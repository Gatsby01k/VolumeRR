import { DatabaseSync } from "node:sqlite";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { canonicalPayload } from "@/lib/domain/enquiry";
import type {
  EnquiryReceipt,
  WebsiteEnquiryPayload,
} from "@/contracts/content-model";

export function openStore(
  path = process.env.ENQUIRY_DB_PATH || ".data/enquiries.sqlite",
) {
  if (path !== ":memory:")
    mkdirSync(dirname(resolve(/* turbopackIgnore: true */ path)), {
      recursive: true,
      mode: 0o700,
    });
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS enquiries (idempotency_key TEXT PRIMARY KEY, payload_hash TEXT NOT NULL, receipt_id TEXT UNIQUE NOT NULL, accepted_at TEXT NOT NULL, payload TEXT NOT NULL, token_hash TEXT NOT NULL, token_expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS outbox (id TEXT PRIMARY KEY, receipt_id TEXT NOT NULL REFERENCES enquiries(receipt_id), status TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0, next_attempt INTEGER NOT NULL, lease_until INTEGER, delivered_at TEXT);
    CREATE TABLE IF NOT EXISTS rate_limits (bucket TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);`);
  return db;
}
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export function acceptEnquiry(
  db: DatabaseSync,
  payload: WebsiteEnquiryPayload,
): { receipt: EnquiryReceipt; token: string } | { conflict: true } {
  const payloadHash = hash(canonicalPayload(payload));
  db.exec("BEGIN IMMEDIATE");
  try {
    const existing = db
      .prepare(
        "SELECT payload_hash, receipt_id, accepted_at FROM enquiries WHERE idempotency_key=?",
      )
      .get(payload.requestIdempotencyKey) as
      | { payload_hash: string; receipt_id: string; accepted_at: string }
      | undefined;
    if (existing && existing.payload_hash !== payloadHash) {
      db.exec("ROLLBACK");
      return { conflict: true };
    }
    const token = randomBytes(32).toString("base64url");
    if (existing) {
      db.prepare(
        "UPDATE enquiries SET token_hash=?, token_expires=? WHERE idempotency_key=?",
      ).run(hash(token), Date.now() + 3600000, payload.requestIdempotencyKey);
      db.exec("COMMIT");
      return {
        receipt: {
          kind: "accepted",
          receiptId: existing.receipt_id,
          acceptedAt: existing.accepted_at,
          duplicate: true,
        },
        token,
      };
    }
    const receipt: EnquiryReceipt = {
      kind: "accepted",
      receiptId: "VR-" + randomUUID().slice(0, 8).toUpperCase(),
      acceptedAt: new Date().toISOString(),
      duplicate: false,
    };
    db.prepare("INSERT INTO enquiries VALUES (?,?,?,?,?,?,?)").run(
      payload.requestIdempotencyKey,
      payloadHash,
      receipt.receiptId,
      receipt.acceptedAt,
      JSON.stringify(payload),
      hash(token),
      Date.now() + 3600000,
    );
    db.prepare(
      "INSERT INTO outbox (id, receipt_id, next_attempt) VALUES (?,?,?)",
    ).run(randomUUID(), receipt.receiptId, Date.now());
    db.exec("COMMIT");
    return { receipt, token };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
export function receiptForToken(
  db: DatabaseSync,
  token: string,
): EnquiryReceipt | null {
  const row = db
    .prepare(
      "SELECT receipt_id, accepted_at FROM enquiries WHERE token_hash=? AND token_expires>?",
    )
    .get(hash(token), Date.now()) as
    | { receipt_id: string; accepted_at: string }
    | undefined;
  return row
    ? {
        kind: "accepted",
        receiptId: row.receipt_id,
        acceptedAt: row.accepted_at,
        duplicate: false,
      }
    : null;
}
export function takeRateLimit(
  db: DatabaseSync,
  bucket: string,
  maximum = 8,
  window = 600000,
) {
  const now = Date.now();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("DELETE FROM rate_limits WHERE expires<?").run(now);
    const row = db
      .prepare("SELECT count, expires FROM rate_limits WHERE bucket=?")
      .get(bucket) as { count: number; expires: number } | undefined;
    if (row && row.count >= maximum) {
      db.exec("COMMIT");
      return Math.max(1, Math.ceil((row.expires - now) / 1000));
    }
    if (row)
      db.prepare("UPDATE rate_limits SET count=count+1 WHERE bucket=?").run(
        bucket,
      );
    else
      db.prepare("INSERT INTO rate_limits VALUES (?,?,?)").run(
        bucket,
        1,
        now + window,
      );
    db.exec("COMMIT");
    return 0;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
