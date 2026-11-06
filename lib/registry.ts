import countryData from "@/content/markets.json";
import productData from "@/content/products.json";
import methodData from "@/content/methods.json";
import industryData from "@/content/industries.json";
import ui from "@/content/ui.en.json";
import routePaths from "@/content/route-paths.json";
import type {
  CountryRecord,
  ProductRecord,
  MethodRecord,
  IndustryRecord,
} from "@/contracts/content-model";

export const countries = countryData as CountryRecord[];
export const products = productData as ProductRecord[];
export const methods = methodData as MethodRecord[];
export const industries = industryData as IndustryRecord[];
export const globalCopy = ui;
export const validSourceRoutes = routePaths;
export const regions = [
  { id: "asia", label: "Asia", short: "ASIA" },
  { id: "latam", label: "Latin America", short: "LATAM" },
  { id: "africa", label: "Africa", short: "AFRICA" },
];
export function countryMethods(id: string) {
  return methods.filter((m) => m.countryIds.includes(id));
}
export function availabilityLabel(
  reviewedAt: string | null,
  state: string = "unverified",
) {
  if (
    state !== "unverified" &&
    reviewedAt &&
    Date.now() - Date.parse(reviewedAt) > 90 * 86400000
  )
    return globalCopy.availability.stale;
  return (
    globalCopy.availability[state as keyof typeof globalCopy.availability] ||
    globalCopy.availability.unverified
  );
}
