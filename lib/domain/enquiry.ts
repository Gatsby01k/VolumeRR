import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import schema from "@/contracts/enquiry.schema.json";
import { countries, products, industries, routes } from "@/lib/content";
import type {
  FieldError,
  WebsiteEnquiryPayload,
} from "@/contracts/content-model";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const check = ajv.compile<WebsiteEnquiryPayload>(schema);
const optionalStrings = [
  "name",
  "website",
  "settlementAsset",
  "settlementNetwork",
  "requirements",
  "supportReference",
  "industryId",
  "partnerType",
  "settlementPreference",
  "expectedMonthlyCurrency",
];
export function normalizePayload(input: unknown): unknown {
  if (!input || typeof input !== "object" || Array.isArray(input)) return input;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    const normalized =
      typeof value === "string"
        ? value.trim()
        : Array.isArray(value)
          ? value.map((v) => (typeof v === "string" ? v.trim() : v))
          : value;
    if (optionalStrings.includes(key) && normalized === "") continue;
    out[key] = normalized;
  }
  if (typeof out.expectedMonthlyCurrency === "string")
    out.expectedMonthlyCurrency = out.expectedMonthlyCurrency.toUpperCase();
  return out;
}
export function validateEnquiry(
  input: unknown,
):
  | { valid: true; payload: WebsiteEnquiryPayload }
  | { valid: false; fieldErrors: FieldError[] } {
  const payload = normalizePayload(input);
  if (!check(payload)) {
    const errors = (check.errors || [])
      .filter((e) => !["if", "anyOf"].includes(e.keyword))
      .map((e) => ({
        field:
          e.instancePath.split("/")[1] ||
          e.params.missingProperty ||
          e.params.additionalProperty ||
          "form",
        code: e.keyword,
        message: e.message || "Please review this field.",
      }));
    return {
      valid: false,
      fieldErrors: errors.length
        ? errors
        : [
            {
              field: "marketIds",
              code: "choice_required",
              message:
                "Choose a market and product, or say you are still exploring.",
            },
          ],
    };
  }
  const p = payload as WebsiteEnquiryPayload;
  const errors: FieldError[] = [];
  const add = (field: string, message: string) =>
    errors.push({ field, code: "unknown_choice", message });
  if (p.marketIds.some((id) => !countries.some((c) => c.id === id)))
    add("marketIds", "Please choose a known market or use Other market.");
  if (p.flowIds.some((id) => !products.some((f) => f.id === id)))
    add("flowIds", "Please choose a known product.");
  if (p.industryId && !industries.some((i) => i.id === p.industryId))
    add("industryId", "Please review your industry choice.");
  if (
    !routes.some((r) => r.path === p.sourceRoute && r.readiness !== "reserved")
  )
    add("sourceRoute", "Please review the source of your brief.");
  if (
    p.expectedMonthlyCurrency &&
    !Intl.supportedValuesOf("currency").includes(p.expectedMonthlyCurrency)
  )
    add("expectedMonthlyCurrency", "Choose a valid ISO currency.");
  return errors.length
    ? { valid: false, fieldErrors: errors }
    : { valid: true, payload: p };
}
export function canonicalPayload(payload: WebsiteEnquiryPayload) {
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(payload)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => [
          key,
          Array.isArray(value) ? [...value].sort() : value,
        ]),
    ),
  );
}
