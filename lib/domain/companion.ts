import type { CompanionState } from "@/contracts/content-model";

export type MantaEvent =
  | { type: "market_selected"; countryId?: string }
  | { type: "brief_updated" }
  | { type: "validation_failed" }
  | { type: "enquiry_accepted"; receiptAccepted: true }
  | { type: "reset" };

export type MantaReaction = {
  state: CompanionState;
  sequence: number;
  countryId?: string;
};
export const idleManta: MantaReaction = { state: "ready", sequence: 0 };
export const reactionDuration: Record<CompanionState, number> = {
  ready: 0,
  explore: 440,
  brief_added: 320,
  attention: 180,
  enquiry_received: 420,
  reduced_static: 0,
  hidden: 0,
};
export const revealTimeline = [
  { at: 0, phase: "peek" },
  { at: 120, phase: "turn" },
  { at: 300, phase: "lift" },
  { at: 520, phase: "settle" },
  { at: 800, phase: "ready" },
] as const;
export type RevealPhase = (typeof revealTimeline)[number]["phase"];
export function reactManta(
  current: MantaReaction,
  event: MantaEvent,
): MantaReaction {
  let state: CompanionState = "ready";
  switch (event.type) {
    case "market_selected":
      state = "explore";
      break;
    case "brief_updated":
      state = "brief_added";
      break;
    case "validation_failed":
      state = "attention";
      break;
    case "enquiry_accepted":
      // Runtime protection as well as the discriminated TypeScript contract.
      if (event.receiptAccepted !== true) return current;
      state = "enquiry_received";
      break;
  }
  return {
    state,
    sequence: current.sequence + 1,
    countryId:
      event.type === "market_selected" ? event.countryId : current.countryId,
  };
}
export function effectiveMantaState(
  state: CompanionState,
  visible: boolean,
  reduced: boolean,
): CompanionState {
  return !visible ? "hidden" : reduced ? "reduced_static" : state;
}
