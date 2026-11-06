import test from "node:test";
import assert from "node:assert/strict";
import { statSync, readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import {
  effectiveMantaState,
  idleManta,
  reactManta,
  reactionDuration,
  revealTimeline,
  type MantaEvent,
} from "../lib/domain/companion";

test("Manta maps market, brief and validation events to separate finite gestures", () => {
  const exploring = reactManta(idleManta, {
    type: "market_selected",
    countryId: "kenya",
  });
  assert.equal(exploring.state, "explore");
  assert.equal(exploring.countryId, "kenya");
  const added = reactManta(exploring, { type: "brief_updated" });
  assert.equal(added.state, "brief_added");
  assert.equal(added.sequence, exploring.sequence + 1);
  const invalid = reactManta(added, { type: "validation_failed" });
  assert.equal(invalid.state, "attention");
  assert.deepEqual(
    [
      reactionDuration.explore,
      reactionDuration.brief_added,
      reactionDuration.attention,
      reactionDuration.enquiry_received,
    ],
    [440, 320, 180, 420],
  );
});
test("Pending, timeout or unconfirmed responses can never trigger the received gesture", () => {
  const invalid = {
    type: "enquiry_accepted",
    receiptAccepted: false,
  } as unknown as MantaEvent;
  assert.equal(reactManta(idleManta, invalid), idleManta);
  assert.equal(
    reactManta(idleManta, { type: "enquiry_accepted", receiptAccepted: true })
      .state,
    "enquiry_received",
  );
});
test("Repeated actions replace the current gesture, without a queued animation", () => {
  const first = reactManta(idleManta, { type: "brief_updated" });
  const second = reactManta(first, { type: "brief_updated" });
  const third = reactManta(second, {
    type: "market_selected",
    countryId: "india",
  });
  assert.equal(second.sequence, first.sequence + 1);
  assert.equal(third.state, "explore");
  assert.equal("queue" in third, false);
});
test("Hidden and reduced preferences take priority over every semantic gesture", () => {
  for (const state of [
    "ready",
    "explore",
    "brief_added",
    "attention",
    "enquiry_received",
  ] as const) {
    assert.equal(effectiveMantaState(state, false, false), "hidden");
    assert.equal(effectiveMantaState(state, false, true), "hidden");
    assert.equal(effectiveMantaState(state, true, true), "reduced_static");
  }
});
test("Reveal is a bounded 800 ms sequence, with the lifting phase at 300 ms", () => {
  assert.deepEqual(
    revealTimeline.map((s) => s.at),
    [0, 120, 300, 520, 800],
  );
  assert.equal(revealTimeline[2].phase, "lift");
  assert.equal(revealTimeline.at(-1)?.phase, "ready");
});
test("The full pre-rendered Manta experience fits its 180 KiB asset / code budget", () => {
  const assets =
    statSync("public/brand/manta-poses-v2.webp").size +
    statSync("public/brand/manta.webp").size +
    statSync("public/brand/manta-small.webp").size;
  const source = [
    "components/manta-sprite.tsx",
    "components/manta-scene.tsx",
    "components/providers.tsx",
    "lib/domain/companion.ts",
    "styles/manta.css",
  ].map((p) => readFileSync(p));
  assert(assets + gzipSync(Buffer.concat(source)).length < 180 * 1024);
});
