"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  BriefContext,
  EnquiryReceipt,
  WebsiteEnquiryPayload,
  FieldError,
} from "@/contracts/content-model";
import { countries, products, industries, globalCopy } from "@/lib/registry";
import { useBrief, Manta } from "./providers";
import { BriefSummary } from "./brief-builder";
import { Eyebrow, Foundation } from "./common";
import { Arrow } from "./icons";

type Config = {
  enabled: boolean;
  privacyVersion: string;
  privacyContact: string;
};
type Business = {
  company: string;
  email: string;
  name: string;
  website: string;
  amount: string;
  currency: string;
  requirements: string;
  partnerType: string;
  supportReference: string;
  settlementAsset: string;
  settlementNetwork: string;
  otherMarkets: string;
  faxNumber: string;
};
const blankBusiness: Business = {
  company: "",
  email: "",
  name: "",
  website: "",
  amount: "",
  currency: "USD",
  requirements: "",
  partnerType: "",
  supportReference: "",
  settlementAsset: "",
  settlementNetwork: "",
  otherMarkets: "",
  faxNumber: "",
};
const purposes = [
  { id: "merchant", label: "Payment setup" },
  { id: "partner", label: "Partnership" },
  { id: "technical", label: "Technical question" },
  { id: "support", label: "Existing enquiry" },
];

export function EnquiryWizard({
  config,
  initialPurpose,
}: {
  config: Config;
  initialPurpose?: string;
}) {
  const { initialized, brief, update, clear, announce } = useBrief();
  const [step, setStep] = useState(initialPurpose === "support" ? 2 : 0);
  const [business, setBusiness] = useState<Business>(blankBusiness);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "uncertain" | "unavailable" | "limited" | "conflict"
  >("idle");
  const [retryAt, setRetryAt] = useState(0);
  const [now, setNow] = useState(Date.now());
  const formHeading = useRef<HTMLHeadingElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const key = useRef("");
  const payloadRef = useRef<WebsiteEnquiryPayload | null>(null);
  const submitting = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const router = useRouter();
  const frozen = status === "submitting" || status === "uncertain";
  const sequence =
    brief.purpose === "support"
      ? [2, 3]
      : brief.purpose === "partner" || brief.purpose === "technical"
        ? [0, 2, 3]
        : [0, 1, 2, 3];
  const steps =
    brief.purpose === "partner"
      ? ["Partnership", "Products", "Business", "Review"]
      : globalCopy.form.steps;
  useEffect(() => {
    if (
      initialized &&
      initialPurpose &&
      purposes.some((p) => p.id === initialPurpose)
    )
      update({ purpose: initialPurpose as BriefContext["purpose"] });
  }, [initialPurpose, initialized, update]);
  useEffect(() => {
    key.current = crypto.randomUUID();
    return () => controller.current?.abort();
  }, []);
  useEffect(() => {
    if (errors.length) errorSummary.current?.focus();
  }, [errors]);
  useEffect(() => {
    if (status !== "limited") return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [status]);
  const field = (name: keyof Business, value: string) =>
    setBusiness((b) => ({ ...b, [name]: value }));
  const changeStep = (next: number) => {
    setErrors([]);
    setStatus("idle");
    setStep(next);
    requestAnimationFrame(() => formHeading.current?.focus());
  };
  const fail = (field: string, message: string): FieldError => ({
    field,
    message,
    code: "required",
  });
  const validate = (current: number) => {
    const found: FieldError[] = [];
    if (current === 0) {
      if (
        brief.purpose === "merchant" &&
        !brief.marketIds.length &&
        !brief.marketExploring &&
        !business.otherMarkets.trim()
      )
        found.push(fail("marketIds", globalCopy.form.marketError));
      if (
        business.otherMarkets.trim() &&
        (business.otherMarkets
          .split(",")
          .some((m) => m.trim().length < 2 || m.trim().length > 80) ||
          business.otherMarkets.split(",").length > 3)
      )
        found.push(
          fail(
            "otherMarkets",
            "Enter up to three market names, each 2–80 characters, separated by commas.",
          ),
        );
      if (brief.purpose === "partner" && !business.partnerType)
        found.push(fail("partnerType", globalCopy.form.partnerTypeError));
    }
    if (current === 1 && !brief.flowIds.length && !brief.flowExploring)
      found.push(fail("flowIds", globalCopy.form.flowError));
    if (current === 2) {
      if (!business.company.trim())
        found.push(fail("company", globalCopy.form.companyError));
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.email.trim()))
        found.push(fail("email", globalCopy.form.emailError));
      if (business.website.trim()) {
        try {
          const url = new URL(business.website.trim());
          if (!["http:", "https:"].includes(url.protocol)) throw new Error();
        } catch {
          found.push(fail("website", globalCopy.form.websiteError));
        }
      }
      if (
        business.amount &&
        (!Number.isFinite(Number(business.amount)) ||
          Number(business.amount) < 0 ||
          Number(business.amount) > 1e15)
      )
        found.push(fail("amount", globalCopy.form.volumeError));
      if (
        business.settlementAsset &&
        !/^[A-Z0-9]{3,12}$/.test(business.settlementAsset)
      )
        found.push(fail("settlementAsset", "Use a 3–12 character asset code."));
    }
    if (current === 3 && !privacy)
      found.push(fail("privacyAcknowledged", globalCopy.form.privacyError));
    return found;
  };
  const next = () => {
    const found = validate(step);
    if (found.length) {
      setErrors(found);
      announce("Please check the highlighted details.", "attention");
    } else changeStep(sequence[sequence.indexOf(step) + 1]);
  };
  const errorFor = (name: string) =>
    errors.find((e) => e.field === name)?.message;
  const invalidProps = (name: string) => ({
    "aria-invalid": !!errorFor(name),
    "aria-describedby": errorFor(name) ? `${name}-error` : undefined,
  });
  const inlineError = (name: string) =>
    errorFor(name) ? (
      <span className="field-error" id={`${name}-error`}>
        {errorFor(name)}
      </span>
    ) : null;
  const send = async () => {
    if (submitting.current || !config.enabled || Date.now() < retryAt) return;
    if (!payloadRef.current) {
      const found = [...sequence.flatMap(validate)];
      if (found.length) {
        setErrors(found);
        return;
      }
      const optional: Partial<WebsiteEnquiryPayload> = {};
      for (const name of [
        "name",
        "website",
        "requirements",
        "supportReference",
        "settlementAsset",
        "settlementNetwork",
      ] as const)
        if (business[name].trim()) optional[name] = business[name].trim();
      if (business.amount !== "") {
        optional.expectedMonthlyAmount = Number(business.amount);
        optional.expectedMonthlyCurrency = business.currency;
      }
      if (brief.purpose === "partner")
        optional.partnerType =
          business.partnerType as WebsiteEnquiryPayload["partnerType"];
      if (brief.industryId) optional.industryId = brief.industryId;
      if (brief.settlementPreference)
        optional.settlementPreference = brief.settlementPreference;
      payloadRef.current = {
        schemaVersion: "1.0",
        requestIdempotencyKey: key.current,
        purpose: brief.purpose,
        company: business.company.trim(),
        email: business.email.trim(),
        marketIds: brief.marketIds,
        flowIds: brief.flowIds,
        otherMarkets: business.otherMarkets
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
        marketExploring: brief.marketExploring,
        flowExploring: brief.flowExploring,
        sourceRoute: brief.sourceRoute,
        privacyAcknowledged: true,
        privacyNoticeVersion: config.privacyVersion,
        marketingConsent: marketing,
        locale: "en",
        ...optional,
      };
    }
    submitting.current = true;
    setStatus("submitting");
    setErrors([]);
    controller.current = new AbortController();
    const timeout = setTimeout(() => controller.current?.abort(), 12000);
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payloadRef.current,
          faxNumber: business.faxNumber,
        }),
        signal: controller.current.signal,
      });
      const data = await res.json();
      if (
        res.status === 202 &&
        data.kind === "accepted" &&
        typeof data.receiptId === "string"
      ) {
        clear();
        setBusiness(blankBusiness);
        payloadRef.current = null;
        announce("Enquiry received.", "enquiry_received");
        router.push("/contact/confirmation");
        return;
      }
      if (res.status === 422) {
        payloadRef.current = null;
        setStatus("idle");
        setErrors(
          data.fieldErrors || [fail("form", "Please review your enquiry.")],
        );
      } else if (res.status === 409) {
        setStatus("conflict");
      } else if (res.status === 429) {
        payloadRef.current = null;
        setStatus("limited");
        setRetryAt(Date.now() + (Number(data.retryAfterSeconds) || 60) * 1000);
        setNow(Date.now());
      } else {
        setStatus("unavailable");
        payloadRef.current = null;
      }
    } catch {
      setStatus("uncertain");
      announce(
        "The result is not yet confirmed. Retry safely to check.",
        "attention",
      );
    } finally {
      clearTimeout(timeout);
      submitting.current = false;
    }
  };
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (step === 3) void send();
    else next();
  };

  return (
    <>
      <section className="contact-hero dark">
        <div className="wrap">
          <Eyebrow>YOUR PAYMENT BRIEF</Eyebrow>
          <h1>
            LET’S MAP
            <br />
            YOUR NEXT MOVE<span className="lime">.</span>
          </h1>
          <p className="lead">
            A few details to help us understand your goals
            <br />
            and discuss the right operating scope.
          </p>
          <ol className="form-progress" aria-label="Enquiry progress">
            {sequence.map((s, i) => (
              <li
                key={s}
                className={`${step === s ? "current" : ""} ${sequence.indexOf(step) > i ? "complete" : ""}`}
                aria-current={step === s ? "step" : undefined}
              >
                <button
                  disabled={frozen || sequence.indexOf(step) < i}
                  onClick={() => changeStep(s)}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {steps[s]}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="enquiry-layout">
        <div className="enquiry-main paper">
          <form onSubmit={handleSubmit} noValidate>
            <Eyebrow>
              {String(sequence.indexOf(step) + 1).padStart(2, "0")} /{" "}
              {steps[step].toUpperCase()}
            </Eyebrow>
            <h2 ref={formHeading} tabIndex={-1}>
              {step === 0
                ? brief.purpose === "partner"
                  ? "A clearer partnership."
                  : "Where’s your next market?"
                : step === 1
                  ? "How does value need to move?"
                  : step === 2
                    ? brief.purpose === "support"
                      ? "How can we help?"
                      : "Tell us about your business."
                    : "Review your brief."}
            </h2>
            {errors.length > 0 && (
              <div
                className="error-summary"
                ref={errorSummary}
                tabIndex={-1}
                role="alert"
              >
                <h3>Please check the highlighted details.</h3>
                <ul>
                  {errors.map((error, i) => (
                    <li key={`${error.field}-${i}`}>
                      <a
                        href={`#${error.field}`}
                        onClick={(e) => {
                          e.preventDefault();
                          const targetStep = [
                            "marketIds",
                            "otherMarkets",
                            "partnerType",
                          ].includes(error.field)
                            ? 0
                            : error.field === "flowIds"
                              ? 1
                              : error.field === "privacyAcknowledged"
                                ? 3
                                : 2;
                          setStep(targetStep);
                          setTimeout(
                            () => document.getElementById(error.field)?.focus(),
                            0,
                          );
                        }}
                      >
                        {error.message}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <fieldset disabled={frozen} className="form-body">
              {step !== 3 && (
                <fieldset className="purpose-select">
                  <legend>What would you like to discuss?</legend>
                  <div className="purpose-options">
                    {purposes.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        aria-pressed={brief.purpose === p.id}
                        onClick={() => {
                          update({ purpose: p.id as BriefContext["purpose"] });
                          setStep(p.id === "support" ? 2 : 0);
                          setErrors([]);
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
              {step === 0 && (
                <>
                  {brief.purpose === "partner" && (
                    <fieldset
                      id="partnerType"
                      tabIndex={-1}
                      className="form-choice-group"
                      {...invalidProps("partnerType")}
                    >
                      <legend>Partnership type</legend>
                      {[
                        { id: "payment_provider", label: "Payment provider" },
                        { id: "commercial", label: "Commercial partner" },
                        { id: "technical", label: "Technology partner" },
                        { id: "other", label: "Other partnership" },
                      ].map((p) => (
                        <label className="checkline" key={p.id}>
                          <input
                            type="radio"
                            name="partnerType"
                            value={p.id}
                            checked={business.partnerType === p.id}
                            onChange={(e) =>
                              field("partnerType", e.target.value)
                            }
                          />
                          {p.label}
                        </label>
                      ))}
                      {inlineError("partnerType")}
                    </fieldset>
                  )}
                  <p className="muted">
                    {brief.purpose === "merchant"
                      ? "Select your countries, add another market or choose Not sure yet."
                      : "Add market context if it helps. You can also continue without a selection."}
                  </p>
                  <fieldset
                    id="marketIds"
                    className="market-picks"
                    tabIndex={-1}
                    {...invalidProps("marketIds")}
                  >
                    <legend className="sr-only">Markets</legend>
                    {countries.map((c) => (
                      <label
                        className={`market-pick ${brief.marketIds.includes(c.id) ? "selected" : ""}`}
                        key={c.id}
                      >
                        <input
                          type="checkbox"
                          checked={brief.marketIds.includes(c.id)}
                          onChange={(e) =>
                            update({
                              marketIds: e.target.checked
                                ? [...brief.marketIds, c.id]
                                : brief.marketIds.filter((id) => id !== c.id),
                            })
                          }
                        />
                        <span className="small muted">{c.iso2}</span>
                        <strong>{c.name}</strong>
                        <span>{c.currency}</span>
                        <span className="small muted">Scope to confirm</span>
                      </label>
                    ))}
                  </fieldset>
                  {inlineError("marketIds")}
                  <label className="checkline">
                    <input
                      type="checkbox"
                      checked={brief.marketExploring}
                      onChange={(e) =>
                        update({ marketExploring: e.target.checked })
                      }
                    />
                    Not sure yet
                    {brief.marketIds.length ? (
                      <span className="small muted">
                        {" "}
                        — also exploring other markets
                      </span>
                    ) : null}
                  </label>
                  <label className="field-label" htmlFor="otherMarkets">
                    Other markets <span className="muted">(optional)</span>
                    <input
                      id="otherMarkets"
                      value={business.otherMarkets}
                      maxLength={244}
                      onChange={(e) => field("otherMarkets", e.target.value)}
                      placeholder="Up to 3 countries, separated by commas"
                      {...invalidProps("otherMarkets")}
                    />
                    {inlineError("otherMarkets")}
                  </label>
                  {brief.purpose === "technical" && (
                    <fieldset className="form-choice-group">
                      <legend>
                        Products <span className="muted">(optional)</span>
                      </legend>
                      {products.map((p) => (
                        <label className="checkline" key={p.id}>
                          <input
                            type="checkbox"
                            checked={brief.flowIds.includes(p.id)}
                            onChange={(e) =>
                              update({
                                flowIds: e.target.checked
                                  ? [...brief.flowIds, p.id]
                                  : brief.flowIds.filter((id) => id !== p.id),
                              })
                            }
                          />
                          {p.title}
                        </label>
                      ))}
                    </fieldset>
                  )}
                </>
              )}
              {step === 1 && (
                <>
                  <p className="muted">
                    Choose the connected parts of your payment operation.
                  </p>
                  <fieldset
                    id="flowIds"
                    className="product-picks"
                    tabIndex={-1}
                    {...invalidProps("flowIds")}
                  >
                    <legend className="sr-only">Payment products</legend>
                    {products.map((p) => (
                      <label
                        key={p.id}
                        className={
                          brief.flowIds.includes(p.id) ? "selected" : ""
                        }
                      >
                        <input
                          type="checkbox"
                          checked={brief.flowIds.includes(p.id)}
                          onChange={(e) =>
                            update({
                              flowIds: e.target.checked
                                ? [...brief.flowIds, p.id]
                                : brief.flowIds.filter((id) => id !== p.id),
                            })
                          }
                        />
                        <span>
                          <strong>{p.title}</strong>
                          <span className="small muted">{p.summary}</span>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  {inlineError("flowIds")}
                  <label className="checkline">
                    <input
                      type="checkbox"
                      checked={brief.flowExploring}
                      onChange={(e) =>
                        update({ flowExploring: e.target.checked })
                      }
                    />
                    Still exploring
                  </label>
                  <label className="field-label" htmlFor="settlementPreference">
                    Settlement preference{" "}
                    <span className="muted">(optional)</span>
                    <select
                      id="settlementPreference"
                      value={brief.settlementPreference || "not_sure"}
                      onChange={(e) =>
                        update({
                          settlementPreference: e.target
                            .value as BriefContext["settlementPreference"],
                        })
                      }
                    >
                      <option value="not_sure">To discuss</option>
                      <option value="bank">Bank settlement</option>
                      <option value="stablecoin">Stablecoin preference</option>
                      <option value="other">Other</option>
                    </select>
                    <span className="small muted">
                      A preference for discussion. Availability is not assumed.
                    </span>
                  </label>
                  {brief.settlementPreference === "stablecoin" && (
                    <div className="field-pair">
                      <label className="field-label" htmlFor="settlementAsset">
                        Asset code (optional)
                        <input
                          id="settlementAsset"
                          value={business.settlementAsset}
                          maxLength={12}
                          onChange={(e) =>
                            field(
                              "settlementAsset",
                              e.target.value.toUpperCase(),
                            )
                          }
                          placeholder="e.g. USDC"
                        />
                        {inlineError("settlementAsset")}
                      </label>
                      <label
                        className="field-label"
                        htmlFor="settlementNetwork"
                      >
                        Network (optional)
                        <input
                          id="settlementNetwork"
                          value={business.settlementNetwork}
                          maxLength={80}
                          onChange={(e) =>
                            field("settlementNetwork", e.target.value)
                          }
                        />
                      </label>
                    </div>
                  )}
                </>
              )}
              {step === 2 && (
                <>
                  <p className="muted">
                    Share a few details so we can prepare a useful next
                    conversation.
                  </p>
                  {(["company", "email", "name", "website"] as const).map(
                    (name) => (
                      <label className="field-label" htmlFor={name} key={name}>
                        {globalCopy.form[name]}
                        {["company", "email"].includes(name) && (
                          <span className="required"> *</span>
                        )}
                        <input
                          id={name}
                          name={name}
                          type={
                            name === "email"
                              ? "email"
                              : name === "website"
                                ? "url"
                                : "text"
                          }
                          autoComplete={
                            {
                              company: "organization",
                              email: "email",
                              name: "name",
                              website: "url",
                            }[name]
                          }
                          required={["company", "email"].includes(name)}
                          maxLength={
                            name === "email"
                              ? 254
                              : name === "website"
                                ? 2048
                                : 120
                          }
                          value={business[name]}
                          onChange={(e) => field(name, e.target.value)}
                          {...invalidProps(name)}
                        />
                        {inlineError(name)}
                      </label>
                    ),
                  )}
                  {brief.purpose === "support" ? (
                    <label className="field-label" htmlFor="supportReference">
                      Enquiry reference (optional)
                      <input
                        id="supportReference"
                        maxLength={100}
                        value={business.supportReference}
                        onChange={(e) =>
                          field("supportReference", e.target.value)
                        }
                      />
                    </label>
                  ) : (
                    <>
                      <label className="field-label" htmlFor="industryId">
                        Business model <span className="muted">(optional)</span>
                        <select
                          id="industryId"
                          value={brief.industryId || ""}
                          onChange={(e) =>
                            update({ industryId: e.target.value || undefined })
                          }
                        >
                          <option value="">To discuss</option>
                          {industries.map((i) => (
                            <option value={i.id} key={i.id}>
                              {i.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="volume-fields">
                        <label className="field-label" htmlFor="amount">
                          Expected monthly volume{" "}
                          <span className="muted">(optional)</span>
                          <input
                            id="amount"
                            type="number"
                            min="0"
                            max="1000000000000000"
                            step="any"
                            inputMode="decimal"
                            value={business.amount}
                            onChange={(e) => field("amount", e.target.value)}
                            placeholder="e.g. 100,000"
                            {...invalidProps("amount")}
                          />
                          {inlineError("amount")}
                        </label>
                        <label className="field-label" htmlFor="currency">
                          Currency
                          <select
                            id="currency"
                            value={business.currency}
                            onChange={(e) => field("currency", e.target.value)}
                          >
                            {[
                              "USD",
                              "EUR",
                              "GBP",
                              "INR",
                              "PEN",
                              "GHS",
                              "KES",
                            ].map((c) => (
                              <option key={c}>{c}</option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </>
                  )}
                  <label className="field-label" htmlFor="requirements">
                    {brief.purpose === "technical"
                      ? "Your technical question"
                      : brief.purpose === "support"
                        ? "How can we help?"
                        : "Anything else we should know?"}{" "}
                    <span className="muted">(optional)</span>
                    <textarea
                      id="requirements"
                      maxLength={3000}
                      rows={4}
                      value={business.requirements}
                      onChange={(e) => field("requirements", e.target.value)}
                      placeholder="Markets, timing or operating requirements"
                    />
                  </label>
                  <p className="small muted">{globalCopy.form.safeInput}</p>
                  <div className="honeypot" aria-hidden="true">
                    <label>
                      Leave this blank
                      <input
                        name="faxNumber"
                        tabIndex={-1}
                        autoComplete="off"
                        value={business.faxNumber}
                        onChange={(e) => field("faxNumber", e.target.value)}
                      />
                    </label>
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <p className="muted">
                    Check the details before sending your enquiry.
                  </p>
                  <dl className="review-details">
                    {[
                      {
                        label: "Purpose",
                        value: brief.purpose,
                        step: brief.purpose === "support" ? 2 : 0,
                      },
                      {
                        label: "Markets",
                        value:
                          [
                            ...brief.marketIds.map(
                              (id) => countries.find((c) => c.id === id)?.name,
                            ),
                            business.otherMarkets,
                            brief.marketExploring ? "Also exploring" : "",
                          ]
                            .filter(Boolean)
                            .join(", ") || "To discuss",
                        step: 0,
                      },
                      {
                        label: "Products",
                        value:
                          brief.flowIds
                            .map(
                              (id) => products.find((p) => p.id === id)?.title,
                            )
                            .join(", ") ||
                          (brief.flowExploring
                            ? "Still exploring"
                            : "To discuss"),
                        step: brief.purpose === "merchant" ? 1 : 0,
                      },
                      { label: "Company", value: business.company, step: 2 },
                      { label: "Contact", value: business.email, step: 2 },
                      {
                        label: "Requirements",
                        value: business.requirements || "Nothing to add",
                        step: 2,
                      },
                    ].map((row) => (
                      <div key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                        <button
                          className="text-button small"
                          type="button"
                          aria-label={`Edit ${row.label.toLowerCase()}`}
                          onClick={() => changeStep(row.step)}
                        >
                          Edit <Arrow />
                        </button>
                      </div>
                    ))}
                  </dl>
                  <label className="checkline">
                    <input
                      id="privacyAcknowledged"
                      type="checkbox"
                      checked={privacy}
                      onChange={(e) => setPrivacy(e.target.checked)}
                      {...invalidProps("privacyAcknowledged")}
                    />
                    <span>
                      I have read the{" "}
                      <Link href="/legal/privacy" target="_blank">
                        Privacy Notice
                      </Link>
                      .
                    </span>
                  </label>
                  {inlineError("privacyAcknowledged")}
                  <label className="checkline">
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                    />
                    Yes, I’d like to receive product updates (optional).
                  </label>
                  {!config.enabled && (
                    <div className="inline-notice">
                      <strong>Public enquiries are not connected yet.</strong>
                      <p>
                        You can prepare and review your brief. Sending will be
                        enabled once the responsible entity, approved privacy
                        notice and receiving team are configured.
                      </p>
                    </div>
                  )}
                </>
              )}
            </fieldset>
            {status === "uncertain" && (
              <div className="error-summary" role="alert">
                <h3>{globalCopy.form.uncertainTitle}</h3>
                <p>
                  {globalCopy.form.uncertainBody} Check the previous submission
                  before editing.
                </p>
                <button
                  type="button"
                  className="button"
                  onClick={() => void send()}
                >
                  Retry safely <Arrow />
                </button>
              </div>
            )}
            {status === "unavailable" && (
              <div className="error-summary" role="alert">
                {globalCopy.form.unavailable}
              </div>
            )}
            {status === "limited" && (
              <div className="error-summary" role="alert">
                Please wait {Math.max(0, Math.ceil((retryAt - now) / 1000))}{" "}
                seconds before trying again. Your details are still here.
              </div>
            )}
            {status === "conflict" && (
              <div className="error-summary" role="alert">
                <h3>
                  This submission key already belongs to a different enquiry.
                </h3>
                <p>
                  Review your current details before starting a new submission.
                </p>
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    key.current = crypto.randomUUID();
                    payloadRef.current = null;
                    setStatus("idle");
                  }}
                >
                  Review as a new enquiry <Arrow />
                </button>
              </div>
            )}
            <div className="form-actions">
              {sequence.indexOf(step) > 0 ? (
                <button
                  type="button"
                  className="text-button"
                  disabled={frozen}
                  onClick={() =>
                    changeStep(sequence[sequence.indexOf(step) - 1])
                  }
                >
                  ← Back
                </button>
              ) : (
                <Link className="link-line" href="/markets">
                  Explore markets
                </Link>
              )}
              {status !== "uncertain" && status !== "conflict" && (
                <button
                  className="button"
                  type="submit"
                  disabled={
                    frozen ||
                    (step === 3 &&
                      (!config.enabled ||
                        (status === "limited" && now < retryAt)))
                  }
                >
                  {status === "submitting"
                    ? "Sending enquiry…"
                    : step === 3
                      ? "Send enquiry"
                      : sequence[sequence.indexOf(step) + 1] === 3
                        ? "Review brief"
                        : "Continue"}
                  <Arrow />
                </button>
              )}
            </div>
            <p className="small muted basic-form-link">
              <Link className="link-line" href="/contact/basic">
                Use the single-page form <Arrow />
              </Link>
            </p>
            <noscript>
              <p>
                JavaScript is disabled.{" "}
                <a href="/contact/basic">
                  Use the accessible single-page enquiry form.
                </a>
              </p>
            </noscript>
          </form>
        </div>
        <aside className="enquiry-sidebar dark">
          <div>
            <div className="enquiry-sidebar-head">
              <h2>Your brief</h2>
              <Manta showcase className="form-manta" />
            </div>
            <p className="muted">A summary of what you’ve shared so far.</p>
            <BriefSummary
              editing
              onEdit={(s) => {
                if (!frozen) changeStep(brief.purpose === "support" ? 2 : s);
              }}
            />
            <p className="small muted">
              Your contact details stay in this form. They are not saved in
              browser storage.
            </p>
          </div>
        </aside>
      </section>
      <Foundation light={false} />
    </>
  );
}

export function Receipt({
  initialReceipt,
}: {
  initialReceipt?: EnquiryReceipt | null;
}) {
  const [receipt, setReceipt] = useState<EnquiryReceipt | null>(
    initialReceipt || null,
  );
  const [loading, setLoading] = useState(initialReceipt === undefined);
  useEffect(() => {
    const abort = new AbortController();
    fetch("/api/receipt", { cache: "no-store", signal: abort.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.kind === "accepted") setReceipt(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => abort.abort();
  }, []);
  return (
    <section className="receipt-page dark">
      <div className="wrap">
        <Eyebrow>{receipt ? "ENQUIRY RECEIVED" : "YOUR PAYMENT BRIEF"}</Eyebrow>
        <h1>
          {loading
            ? "Checking your reference."
            : receipt
              ? "Your next move.<br/>Starts here."
              : "Keep your next<br/>step clear."}
        </h1>
        <div className="receipt-card paper">
          {loading ? (
            <p role="status">Checking for a confirmed enquiry…</p>
          ) : receipt ? (
            <>
              <Manta showcase className="receipt-manta" />
              <span className="eyebrow">ENQUIRY RECEIVED</span>
              <h2>Your enquiry has been received.</h2>
              <p>
                Your enquiry has been accepted. Keep the reference below if you
                need to follow up.
              </p>
              <dl className="data-list">
                <div>
                  <dt>Enquiry reference</dt>
                  <dd>{receipt.receiptId}</dd>
                </div>
                <div>
                  <dt>Accepted</dt>
                  <dd>
                    {new Date(receipt.acceptedAt).toLocaleString("en-GB", {
                      timeZone: "UTC",
                    })}{" "}
                    UTC
                  </dd>
                </div>
              </dl>
              <p>
                Your brief gives the team the context for the next conversation.
              </p>
              <Link className="button" href="/support">
                Follow up on an enquiry <Arrow />
              </Link>
            </>
          ) : (
            <>
              <h2>No confirmed enquiry.</h2>
              <p>
                There is no confirmed enquiry to show. Return to your brief to
                continue.
              </p>
              <Link className="button" href="/contact">
                Return to your brief <Arrow />
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
