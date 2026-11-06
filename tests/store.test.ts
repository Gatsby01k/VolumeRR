import test from "node:test";
import assert from "node:assert/strict";
import {
  openStore,
  acceptEnquiry,
  receiptForToken,
  takeRateLimit,
} from "../lib/server/store";
import fixtures from "../contracts/enquiry.fixtures.json";
import type { WebsiteEnquiryPayload } from "../contracts/content-model";

const sample = fixtures.cases.find((f) => f.expectedValid)!
  .payload as WebsiteEnquiryPayload;
test("Acceptance is durable and idempotent; receipt and outbox commit together", () => {
  const db = openStore(":memory:");
  try {
    const accepted = acceptEnquiry(db, sample);
    assert("receipt" in accepted);
    const repeated = acceptEnquiry(db, sample);
    assert("receipt" in repeated);
    assert.equal(repeated.receipt.receiptId, accepted.receipt.receiptId);
    assert.equal(repeated.receipt.duplicate, true);
    assert.equal(
      (db.prepare("SELECT count(*) AS n FROM enquiries").get() as { n: number })
        .n,
      1,
    );
    assert.equal(
      (db.prepare("SELECT count(*) AS n FROM outbox").get() as { n: number }).n,
      1,
    );
    assert.deepEqual(acceptEnquiry(db, { ...sample, company: "Changed" }), {
      conflict: true,
    });
    assert.equal(
      receiptForToken(db, repeated.token)?.receiptId,
      accepted.receipt.receiptId,
    );
    assert.equal(receiptForToken(db, "wrong-token"), null);
    assert.equal(
      receiptForToken(db, accepted.token),
      null,
      "Superseded receipt token is invalidated",
    );
    db.prepare("UPDATE outbox SET attempts=attempts+1").run();
    assert.equal(
      receiptForToken(db, repeated.token)?.kind,
      "accepted",
      "Delivery failure cannot undo acceptance",
    );
  } finally {
    db.close();
  }
});
test("Outbox insert failure rolls back the enquiry", () => {
  const db = openStore(":memory:");
  try {
    db.exec(
      "CREATE TRIGGER fail_outbox BEFORE INSERT ON outbox BEGIN SELECT RAISE(ABORT, 'simulated failure'); END;",
    );
    assert.throws(() => acceptEnquiry(db, sample));
    assert.equal(
      (db.prepare("SELECT count(*) AS n FROM enquiries").get() as { n: number })
        .n,
      0,
    );
  } finally {
    db.close();
  }
});
test("Rate limit persists per hashed bucket", () => {
  const db = openStore(":memory:");
  try {
    for (let i = 0; i < 3; i++) assert.equal(takeRateLimit(db, "test", 3), 0);
    assert(takeRateLimit(db, "test", 3) > 0);
    assert.equal(takeRateLimit(db, "other", 3), 0);
  } finally {
    db.close();
  }
});
