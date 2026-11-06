import { POST as submit } from "../route";
import { basicErrorDocument, type BasicValues } from "@/lib/server/basic-form";
import { enquiryConfig } from "@/lib/server/config";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return new Response("Request origin not allowed.", { status: 403 });
  if (
    !request.headers
      .get("content-type")
      ?.startsWith("application/x-www-form-urlencoded")
  )
    return new Response("Unsupported form.", { status: 415 });
  const reader = request.body?.getReader();
  if (!reader) return new Response("Empty form.", { status: 422 });
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.byteLength;
    if (size > 16384) {
      await reader.cancel();
      return new Response("Form too large.", { status: 413 });
    }
    chunks.push(part.value);
  }
  const params = new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
  const values: BasicValues = Object.fromEntries(params);
  values.marketIds = params.getAll("marketIds");
  values.flowIds = params.getAll("flowIds");
  const payload: Record<string, unknown> = {
    schemaVersion: "1.0",
    requestIdempotencyKey: params.get("requestIdempotencyKey"),
    purpose: params.get("purpose"),
    company: params.get("company"),
    email: params.get("email"),
    marketIds: values.marketIds,
    flowIds: values.flowIds,
    otherMarkets: (params.get("otherMarkets") || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean),
    marketExploring: params.has("marketExploring"),
    flowExploring: params.has("flowExploring"),
    privacyAcknowledged: params.has("privacyAcknowledged"),
    privacyNoticeVersion: enquiryConfig().privacyVersion,
    marketingConsent: params.has("marketingConsent"),
    sourceRoute: "/contact",
    locale: "en",
    faxNumber: params.get("faxNumber") || "",
  };
  for (const key of [
    "name",
    "website",
    "partnerType",
    "supportReference",
    "requirements",
  ])
    if (params.get(key)?.trim()) payload[key] = params.get(key);
  const result = await submit(
    new Request(new URL("/api/enquiries", request.url), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: request.headers.get("origin")!,
        "x-real-ip": request.headers.get("x-real-ip") || "direct-connection",
      },
      body: JSON.stringify(payload),
    }),
  );
  if (result.status === 202) {
    const headers = new Headers({
      Location: new URL("/contact/confirmation", request.url).toString(),
      "Cache-Control": "no-store",
    });
    const cookie = result.headers.get("set-cookie");
    if (cookie) headers.set("set-cookie", cookie);
    return new Response(null, { status: 303, headers });
  }
  const data = await result.json();
  const message =
    result.status === 409
      ? "This enquiry key is already in use. Return to the enquiry form to start a new submission."
      : result.status === 429
        ? "Please wait before trying again. Your details are preserved below."
        : "The enquiry could not be accepted. Your details are preserved below. Please try again.";
  return new Response(
    basicErrorDocument(
      values,
      data.fieldErrors || [{ field: "form", code: "unavailable", message }],
    ),
    {
      status: result.status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        ...(result.headers.has("retry-after")
          ? { "Retry-After": result.headers.get("retry-after")! }
          : {}),
      },
    },
  );
}
