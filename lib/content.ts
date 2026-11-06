import copy from "@/content/content.en.json";
import routeData from "@/content/route-manifest.json";
import type { DesignRouteRecord, CtaContext } from "@/contracts/content-model";
export {
  countries,
  products,
  methods,
  industries,
  regions,
  globalCopy,
  countryMethods,
  availabilityLabel,
} from "./registry";

export interface PageCopy {
  path: string;
  eyebrow: string;
  h1: string;
  summary: string;
  primaryCta: CtaContext;
  sections: { heading: string; body: string }[];
  faq: { question: string; answer: string }[];
  publicationMode: string;
  ownerGates: string[];
}
export const pages = copy.pages as Record<string, PageCopy>;
export const routes = routeData as DesignRouteRecord[];
export const isPublicRelease =
  process.env.NEXT_PUBLIC_RELEASE_MODE === "published";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export function pageForPath(path: string) {
  return routes.find((r) => r.path === path && r.readiness !== "reserved");
}
