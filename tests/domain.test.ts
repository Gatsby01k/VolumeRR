import test from "node:test";
import assert from "node:assert/strict";
import { validateEnquiry, normalizePayload } from "../lib/domain/enquiry";
import { sanitizeBrief, serializeBrief, emptyBrief } from "../lib/domain/brief";
import fixtures from "../contracts/enquiry.fixtures.json";
import type { WebsiteEnquiryPayload } from "../contracts/content-model";

for (const fixture of fixtures.cases)
  test(`Enquiry contract: ${fixture.name}`, () => {
    assert.equal(validateEnquiry(fixture.payload).valid, fixture.expectedValid);
  });
test("Registry rejects unknown market and ISO currency", () => {
  const base = fixtures.cases.find((f) => f.expectedValid)!.payload;
  assert.equal(
    validateEnquiry({ ...base, marketIds: ["unknown"] }).valid,
    false,
  );
  assert.equal(
    validateEnquiry({
      ...base,
      expectedMonthlyAmount: 20,
      expectedMonthlyCurrency: "ZZZ",
    }).valid,
    false,
  );
});
test("Optional empty website is omitted before validation", () => {
  const base = fixtures.cases.find((f) => f.expectedValid)!.payload;
  assert.equal(validateEnquiry({ ...base, website: "   " }).valid, true);
  assert(!("website" in (normalizePayload({ website: " " }) as object)));
});
test("Brief storage never includes personal or arbitrary free-text values", () => {
  const raw = serializeBrief({
    ...emptyBrief,
    marketIds: ["kenya"],
    flowIds: ["payout"],
    otherMarkets: ["private free text"],
    ...{
      company: "Secret",
      email: "secret@example.com",
      requirements: "Secret",
    },
  });
  assert(
    !raw.includes("Secret") &&
      !raw.includes("private free text") &&
      !raw.includes("secret@example.com"),
  );
});
test("Saved brief removes unknown choices and rejects stale session data", () => {
  const saved = {
    ...emptyBrief,
    marketIds: ["kenya", "unknown"],
    flowIds: ["payout", "bogus"],
    updatedAt: new Date().toISOString(),
  };
  assert.deepEqual(sanitizeBrief(saved).brief.marketIds, ["kenya"]);
  assert.deepEqual(sanitizeBrief(saved).brief.flowIds, ["payout"]);
  assert.equal(sanitizeBrief(saved).changed, true);
  assert.deepEqual(
    sanitizeBrief({ ...saved, updatedAt: "2020-01-01" }).brief.marketIds,
    [],
  );
});
