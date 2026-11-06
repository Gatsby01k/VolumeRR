import type { BriefContext } from "@/contracts/content-model";
import {
  countries,
  products,
  industries,
  validSourceRoutes,
} from "@/lib/registry";

export const BRIEF_KEY = "volumerail.brief.v1";
export const emptyBrief: BriefContext = {
  version: "1.0",
  marketIds: [],
  flowIds: [],
  otherMarkets: [],
  marketExploring: false,
  flowExploring: false,
  purpose: "merchant",
  sourceRoute: "/",
  updatedAt: "",
};
const purposes = ["merchant", "partner", "technical", "support"];
export function sanitizeBrief(input: unknown): {
  brief: BriefContext;
  changed: boolean;
} {
  if (!input || typeof input !== "object")
    return { brief: { ...emptyBrief }, changed: true };
  const saved = input as Record<string, unknown>;
  if (
    saved.version !== "1.0" ||
    typeof saved.updatedAt !== "string" ||
    !Number.isFinite(Date.parse(saved.updatedAt)) ||
    Date.now() - Date.parse(saved.updatedAt) > 86400000
  )
    return { brief: { ...emptyBrief }, changed: true };
  const rawMarkets = Array.isArray(saved.marketIds) ? saved.marketIds : [];
  const rawFlows = Array.isArray(saved.flowIds) ? saved.flowIds : [];
  const marketIds = [
    ...new Set(
      rawMarkets.filter(
        (id): id is string =>
          typeof id === "string" && countries.some((c) => c.id === id),
      ),
    ),
  ].slice(0, 10);
  const flowIds = [
    ...new Set(
      rawFlows.filter((id): id is BriefContext["flowIds"][number] =>
        products.some((p) => p.id === id),
      ),
    ),
  ].slice(0, 3);
  const brief: BriefContext = {
    ...emptyBrief,
    marketIds,
    flowIds,
    purpose: purposes.includes(String(saved.purpose))
      ? (saved.purpose as BriefContext["purpose"])
      : "merchant",
    marketExploring: saved.marketExploring === true,
    flowExploring: saved.flowExploring === true,
    sourceRoute:
      typeof saved.sourceRoute === "string" &&
      validSourceRoutes.includes(saved.sourceRoute)
        ? saved.sourceRoute
        : "/",
    updatedAt: saved.updatedAt,
  };
  if (industries.some((i) => i.id === saved.industryId))
    brief.industryId = String(saved.industryId);
  if (
    ["not_sure", "bank", "stablecoin", "other"].includes(
      String(saved.settlementPreference),
    )
  )
    brief.settlementPreference =
      saved.settlementPreference as BriefContext["settlementPreference"];
  return {
    brief,
    changed:
      marketIds.length !== rawMarkets.length ||
      flowIds.length !== rawFlows.length,
  };
}
export function serializeBrief(brief: BriefContext) {
  const {
    version,
    marketIds,
    flowIds,
    purpose,
    marketExploring,
    flowExploring,
    industryId,
    settlementPreference,
    sourceRoute,
  } = brief;
  return JSON.stringify({
    version,
    marketIds,
    flowIds,
    purpose,
    marketExploring,
    flowExploring,
    industryId,
    settlementPreference,
    sourceRoute,
    updatedAt: new Date().toISOString(),
  });
}
