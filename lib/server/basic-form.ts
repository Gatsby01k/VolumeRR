import { randomUUID } from "node:crypto";
import { countries, products } from "@/lib/content";
import type { FieldError } from "@/contracts/content-model";
import { enquiryConfig } from "./config";

export type BasicValues = Record<string, string | string[]>;
export const escapeHtml = (value: unknown) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function basicForm(values: BasicValues = {}, errors: FieldError[] = []) {
  const config = enquiryConfig();
  const value = (key: string) => escapeHtml(values[key] || "");
  const checked = (key: string, id?: string) =>
    id
      ? (
          Array.isArray(values[key])
            ? values[key].includes(id)
            : values[key] === id
        )
        ? "checked"
        : ""
      : values[key] === "on"
        ? "checked"
        : "";
  const input = (
    key: string,
    label: string,
    type = "text",
    required = false,
    max = 120,
  ) =>
    `<label class="field-label" for="${key}">${label}<input id="${key}" name="${key}" type="${type}" value="${value(key)}" maxlength="${max}" ${required ? "required" : ""}></label>`;
  return `${errors.length ? `<div class="error-summary" role="alert"><h2>Please review your enquiry.</h2><ul>${errors.map((e) => `<li>${escapeHtml(e.message)}</li>`).join("")}</ul></div>` : ""}
    <form action="/api/enquiries/basic" method="post">
    <input type="hidden" name="requestIdempotencyKey" value="${value("requestIdempotencyKey") || randomUUID()}">
    <label class="field-label" for="purpose">What would you like to discuss?<select id="purpose" name="purpose">${[
      ["merchant", "Payment setup"],
      ["partner", "Partnership"],
      ["technical", "Technical question"],
      ["support", "Existing enquiry"],
    ]
      .map(
        ([id, label]) =>
          `<option value="${id}" ${values.purpose === id ? "selected" : ""}>${label}</option>`,
      )
      .join("")}</select></label>
    <fieldset class="form-choice-group"><legend>Markets (required for payment setups, or choose Not sure yet)</legend>${countries.map((c) => `<label class="checkline"><input type="checkbox" name="marketIds" value="${c.id}" ${checked("marketIds", c.id)}>${c.name} / ${c.currency}</label>`).join("")}<label class="checkline"><input type="checkbox" name="marketExploring" ${checked("marketExploring")}>Not sure yet</label></fieldset>
    ${input("otherMarkets", "Other markets (up to 3, separated by commas)", "text", false, 244)}
    <fieldset class="form-choice-group"><legend>Products (required for payment setups, or choose Still exploring)</legend>${products.map((p) => `<label class="checkline"><input type="checkbox" name="flowIds" value="${p.id}" ${checked("flowIds", p.id)}>${p.title}</label>`).join("")}<label class="checkline"><input type="checkbox" name="flowExploring" ${checked("flowExploring")}>Still exploring</label></fieldset>
    <label class="field-label" for="partnerType">Partnership type (for partnership enquiries)<select id="partnerType" name="partnerType">${[
      ["", "Choose a type"],
      ["payment_provider", "Payment provider"],
      ["commercial", "Commercial partner"],
      ["technical", "Technology partner"],
      ["other", "Other"],
    ]
      .map(
        ([id, label]) =>
          `<option value="${id}" ${values.partnerType === id ? "selected" : ""}>${label}</option>`,
      )
      .join("")}</select></label>
    ${input("company", "Company or project *", "text", true)}${input("email", "Contact email *", "email", true, 254)}${input("name", "Your name (optional)")}${input("website", "Website (optional)", "url", false, 2048)}${input("supportReference", "Enquiry reference (optional)", "text", false, 100)}
    <label class="field-label" for="requirements">Anything else we should know? (optional)<textarea id="requirements" name="requirements" rows="5" maxlength="3000">${value("requirements")}</textarea></label><p class="small muted">Please do not include bank details, passwords or identity documents. This form does not store your contact fields in browser storage.</p>
    <div class="honeypot" aria-hidden="true"><label>Leave blank<input name="faxNumber" tabindex="-1" autocomplete="off"></label></div>
    <label class="checkline"><input type="checkbox" name="privacyAcknowledged" required ${checked("privacyAcknowledged")}><span>I have read the <a href="/legal/privacy" target="_blank">Privacy Notice</a>.</span></label><label class="checkline"><input type="checkbox" name="marketingConsent" ${checked("marketingConsent")}>Receive product updates (optional).</label>
    ${config.enabled ? "" : '<div class="inline-notice">Public enquiries are not connected yet. Sending is disabled until the responsible entity, privacy notice and receiving team are configured.</div>'}
    <button class="button" type="submit" ${config.enabled ? "" : "disabled"}>Send enquiry ↗</button></form>`;
}
export function basicErrorDocument(values: BasicValues, errors: FieldError[]) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Review your enquiry | VolumeRail</title><style>@font-face{font-family:Manrope;src:url('/fonts/Manrope.variable.woff2')}*{box-sizing:border-box}body{background:#F1F0E9;color:#101719;font:16px/1.6 Manrope,Arial;margin:0}main{max-width:760px;margin:auto;padding:32px 24px}h1{font-size:36px}label{display:block;margin:16px 0}input:not([type=checkbox]),select,textarea{display:block;width:100%;font:inherit;padding:12px;margin-top:8px;background:#FAF9F4;border:1px solid #69777B}input[type=checkbox]{margin-right:12px;width:20px;height:20px}fieldset{border:1px solid #B6BEC0;margin:24px 0}button{background:#CDFF00;color:#101719;border:0;padding:16px 24px;font:inherit;min-height:48px}button:disabled{opacity:.5}.error-summary{border:2px solid #A31C17;padding:16px;color:#A31C17}.honeypot{position:absolute;left:-10000px}.inline-notice{border-left:3px solid #345100;padding:16px;margin:24px 0}.small{font-size:13px}a{color:inherit}</style></head><body><main><a href="/"><img src="/brand/wordmark.webp" width="180" alt="VolumeRail" style="background:#090C0D;padding:10px"></a><h1>Review your enquiry.</h1><p>Your details remain below. Please correct the highlighted issue and submit again.</p>${basicForm(values, errors)}<p><a href="/contact">Return to the multi-step form</a></p></main></body></html>`;
}
