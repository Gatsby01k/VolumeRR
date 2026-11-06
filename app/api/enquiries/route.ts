import { NextResponse } from "next/server";
import { createHmac, randomUUID } from "node:crypto";
import { validateEnquiry } from "@/lib/domain/enquiry";
import { acceptEnquiry, openStore, takeRateLimit } from "@/lib/server/store";
import { enquiryConfig } from "@/lib/server/config";

export const runtime = "nodejs";
const response = (
  body: unknown,
  status: number,
  headers?: Record<string, string>,
) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin)
    return response({ kind: "forbidden" }, 403);
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    return response({ kind: "unsupported_media" }, 415);
  if (Number(request.headers.get("content-length")) > 16384)
    return response({ kind: "payload_too_large" }, 413);
  const reader = request.body?.getReader();
  if (!reader)
    return response(
      {
        kind: "validation_error",
        fieldErrors: [
          { field: "form", code: "empty", message: "An enquiry is required." },
        ],
      },
      422,
    );
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      length += part.value.byteLength;
      if (length > 16384) {
        await reader.cancel();
        return response({ kind: "payload_too_large" }, 413);
      }
      chunks.push(part.value);
    }
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (
      parsed &&
      typeof parsed === "object" &&
      "faxNumber" in parsed &&
      (parsed as { faxNumber: unknown }).faxNumber
    )
      return response({ kind: "unavailable", retryable: false }, 400);
    if (parsed && typeof parsed === "object")
      delete (parsed as Record<string, unknown>).faxNumber;
    const result = validateEnquiry(parsed);
    if (!result.valid)
      return response(
        { kind: "validation_error", fieldErrors: result.fieldErrors },
        422,
      );
    const config = enquiryConfig();
    if (!config.enabled)
      return response({ kind: "unavailable", retryable: true }, 503);
    if (result.payload.privacyNoticeVersion !== config.privacyVersion)
      return response(
        {
          kind: "validation_error",
          fieldErrors: [
            {
              field: "privacyAcknowledged",
              code: "notice_updated",
              message: "Please reload and review the current Privacy Notice.",
            },
          ],
        },
        422,
      );
    const db = openStore();
    try {
      // A reverse proxy must overwrite x-real-ip. Never log the address or form body.
      const address = request.headers.get("x-real-ip") || "direct-connection";
      const bucket = createHmac("sha256", process.env.RATE_LIMIT_SECRET!)
        .update(address)
        .digest("hex");
      const retry = takeRateLimit(db, bucket);
      if (retry)
        return response(
          { kind: "rate_limited", retryAfterSeconds: retry },
          429,
          { "Retry-After": String(retry) },
        );
      const accepted = acceptEnquiry(db, result.payload);
      if ("conflict" in accepted)
        return response(
          { kind: "conflict", code: "idempotency_payload_mismatch" },
          409,
        );
      const res = response(accepted.receipt, 202);
      res.cookies.set("vr_receipt", accepted.token, {
        httpOnly: true,
        sameSite: "strict",
        secure: new URL(request.url).protocol === "https:",
        maxAge: 3600,
        path: "/",
      });
      return res;
    } finally {
      db.close();
    }
  } catch (error) {
    if (error instanceof SyntaxError)
      return response(
        {
          kind: "validation_error",
          fieldErrors: [
            {
              field: "form",
              code: "json",
              message: "The enquiry could not be read.",
            },
          ],
        },
        422,
      );
    const correlationId = randomUUID();
    console.error("enquiry_unavailable", { correlationId });
    return response(
      { kind: "unavailable", retryable: true, correlationId },
      503,
    );
  }
}
