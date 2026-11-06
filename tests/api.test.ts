import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { POST } from "../app/api/enquiries/route";
import { POST as basicPost } from "../app/api/enquiries/basic/route";
import { GET } from "../app/api/receipt/route";
import { NextRequest } from "next/server";
import fixtures from "../contracts/enquiry.fixtures.json";
import { openStore } from "../lib/server/store";

test("HTTP boundary: validation, commit, retry, conflict, receipt privacy and release gate", async () => {
  const dir = mkdtempSync(join(tmpdir(), "volumerail-api-test-"));
  const previous = { ...process.env };
  const sample = {
    ...fixtures.cases.find((f) => f.expectedValid)!.payload,
    requestIdempotencyKey: randomUUID(),
  };
  const request = (payload: unknown, headers: Record<string, string> = {}) =>
    new Request("http://localhost:3000/api/enquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
        ...headers,
      },
      body: JSON.stringify(payload),
    });
  try {
    process.env.ENQUIRY_DB_PATH = join(dir, "test.sqlite");
    assert.equal(
      (await POST(request(sample, { Origin: "https://other.example" }))).status,
      403,
    );
    assert.equal(
      (await POST(request(sample, { "Content-Length": "20000" }))).status,
      413,
    );
    assert.equal(
      (await POST(request({ ...sample, email: "invalid" }))).status,
      422,
    );
    process.env.ENQUIRIES_ENABLED = "false";
    assert.equal((await POST(request(sample))).status, 503);
    Object.assign(process.env, {
      ENQUIRIES_ENABLED: "true",
      OPERATING_ENTITY_NAME: "TEST ONLY",
      OPERATING_ENTITY_ADDRESS: "TEST ONLY",
      PRIVACY_CONTACT: "test@example.com",
      PRIVACY_NOTICE_VERSION: sample.privacyNoticeVersion,
      ENQUIRY_OWNER: "TEST ONLY",
      ENQUIRY_DELIVERY_URL: "https://example.com/test-only",
      ENQUIRY_DELIVERY_SECRET: "test-only-secret",
      RATE_LIMIT_SECRET: "test-only-rate-secret",
    });
    const accepted = await POST(request(sample));
    assert.equal(accepted.status, 202);
    const receipt = await accepted.json();
    assert.equal(receipt.kind, "accepted");
    assert(!JSON.stringify(receipt).includes(sample.email));
    const repeated = await POST(request(sample));
    assert.equal(repeated.status, 202);
    const repeatedReceipt = await repeated.json();
    assert.equal(repeatedReceipt.receiptId, receipt.receiptId);
    assert.equal(repeatedReceipt.duplicate, true);
    assert.equal(
      (await POST(request({ ...sample, company: "Different" }))).status,
      409,
    );
    assert.equal(
      (await GET(new NextRequest("http://localhost:3000/api/receipt"))).status,
      404,
    );
    const cookie = repeated.headers.get("set-cookie")!.split(";")[0];
    const checked = await GET(
      new NextRequest("http://localhost:3000/api/receipt", {
        headers: { Cookie: cookie },
      }),
    );
    assert.equal(checked.status, 200);
    assert.equal((await checked.json()).receiptId, receipt.receiptId);
    const db = openStore();
    assert.equal(
      (db.prepare("SELECT count(*) AS n FROM enquiries").get() as { n: number })
        .n,
      1,
    );
    assert.equal(
      (db.prepare("SELECT count(*) AS n FROM outbox").get() as { n: number }).n,
      1,
    );
    db.close();
    const form = new URLSearchParams({
      requestIdempotencyKey: randomUUID(),
      purpose: "support",
      company: "X",
      email: "support@example.com",
      privacyAcknowledged: "on",
    });
    const native = await basicPost(
      new Request("http://localhost:3000/api/enquiries/basic", {
        method: "POST",
        headers: {
          Origin: "http://127.0.0.1:3000",
          Host: "127.0.0.1:3000",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form,
      }),
    );
    assert.equal(native.status, 303);
    assert.equal(
      native.headers.get("location"),
      "http://127.0.0.1:3000/contact/confirmation",
    );
    assert(native.headers.get("set-cookie")?.includes("HttpOnly"));
  } finally {
    for (const key of Object.keys(process.env))
      if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
    rmSync(dir, { recursive: true, force: true });
  }
});
