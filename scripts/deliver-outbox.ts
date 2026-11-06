import { createHmac } from "node:crypto";
import { openStore } from "../lib/server/store";

async function main() {
  const destination = process.env.ENQUIRY_DELIVERY_URL;
  const secret = process.env.ENQUIRY_DELIVERY_SECRET;
  if (!destination?.startsWith("https://") || !secret)
    throw new Error(
      "Configure an HTTPS delivery URL and signing secret before running the worker.",
    );
  const db = openStore();
  type Row = {
    id: string;
    receipt_id: string;
    attempts: number;
    payload: string;
    accepted_at: string;
  };
  try {
    // Claim the batch atomically. Expired leases are eligible after a worker crash.
    db.exec("BEGIN IMMEDIATE");
    const rows = db
      .prepare(
        `SELECT o.id, o.receipt_id, o.attempts, e.payload, e.accepted_at FROM outbox o JOIN enquiries e ON e.receipt_id=o.receipt_id WHERE o.status='pending' AND o.next_attempt<=? AND (o.lease_until IS NULL OR o.lease_until<?) LIMIT 20`,
      )
      .all(Date.now(), Date.now()) as Row[];
    for (const row of rows)
      db.prepare("UPDATE outbox SET lease_until=? WHERE id=?").run(
        Date.now() + 120000,
        row.id,
      );
    db.exec("COMMIT");
    for (const row of rows) {
      try {
        const timestamp = String(Date.now());
        const body = JSON.stringify({
          eventId: row.id,
          receiptId: row.receipt_id,
          acceptedAt: row.accepted_at,
          enquiry: JSON.parse(row.payload),
        });
        const signature = createHmac("sha256", secret)
          .update(`${timestamp}.${body}`)
          .digest("hex");
        const res = await fetch(destination, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-VolumeRail-Signature": `t=${timestamp},v1=${signature}`,
            "Idempotency-Key": row.id,
          },
          body,
          signal: AbortSignal.timeout(15000),
          redirect: "error",
        });
        if (!res.ok) throw new Error("Delivery not accepted");
        db.prepare(
          "UPDATE outbox SET status='delivered', delivered_at=?, lease_until=NULL WHERE id=?",
        ).run(new Date().toISOString(), row.id);
        console.log("outbox_delivered", { eventId: row.id });
      } catch {
        db.prepare(
          "UPDATE outbox SET attempts=attempts+1, next_attempt=?, lease_until=NULL WHERE id=?",
        ).run(
          Date.now() + Math.min(3600000, 30000 * 2 ** row.attempts),
          row.id,
        );
        console.error("outbox_retry_scheduled", { eventId: row.id });
      }
    }
  } finally {
    db.close();
  }
}
void main();
