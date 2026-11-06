"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  countries,
  countryMethods,
  products,
  regions,
  availabilityLabel,
} from "@/lib/registry";
import type { PageCopy } from "@/lib/content";
import { Arrow, SearchIcon, Close } from "./icons";
import { useBrief } from "./providers";
import { Signature, Eyebrow } from "./common";

const methodTypes = [
  { id: "instant_bank", label: "Instant bank" },
  { id: "bank_transfer", label: "Bank transfer" },
  { id: "wallet", label: "Wallet" },
  { id: "mobile_money", label: "Mobile money" },
];
const searchAliases: Record<string, string> = {
  india: "india in индия bharat",
  peru: "peru pe перу perú",
  ghana: "ghana gh гана",
  kenya: "kenya ke кения kenia",
};
export function MarketDirectory({
  page,
  preset = "",
}: {
  page: PageCopy;
  preset?: string;
}) {
  const searchParams = useSearchParams();
  const path = usePathname();
  const router = useRouter();
  const [q, setQ] = useState(searchParams.get("q")?.slice(0, 80) || "");
  const [region, setRegion] = useState(searchParams.get("region") || preset);
  const [flow, setFlow] = useState(searchParams.get("flow") || "");
  const [methodType, setMethodType] = useState(
    searchParams.get("methodType") || "",
  );
  const [compare, setCompare] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [invalid, setInvalid] = useState(false);
  const { brief, toggleMarket, announce } = useBrief();
  const search = searchParams.toString();
  useEffect(() => {
    const p = new URLSearchParams(search);
    const r = p.get("region") || preset;
    const f = p.get("flow") || "";
    const m = p.get("methodType") || "";
    const bad =
      (!!r && !regions.some((i) => i.id === r)) ||
      (!!f && !products.some((i) => i.id === f)) ||
      (!!m && !methodTypes.some((i) => i.id === m)) ||
      [...p.keys()].some(
        (k) => !["region", "flow", "q", "methodType"].includes(k),
      );
    setInvalid(bad);
    setQ((p.get("q") || "").slice(0, 80));
    setRegion(regions.some((i) => i.id === r) ? r : preset);
    setFlow(products.some((i) => i.id === f) ? f : "");
    setMethodType(methodTypes.some((i) => i.id === m) ? m : "");
  }, [search, preset]);
  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(
        sessionStorage.getItem("volumerail.compare.v1") || "[]",
      );
      if (Array.isArray(stored))
        setCompare(
          [
            ...new Set(
              stored.filter((id) => countries.some((c) => c.id === id)),
            ),
          ].slice(0, 3),
        );
    } catch {}
  }, []);
  const changeFilter = (key: string, value: string) => {
    if (preset && key === "region" && value === "") {
      router.push("/markets");
      return;
    }
    const p = new URLSearchParams();
    const next = { q, region, flow, methodType, [key]: value };
    for (const [k, v] of Object.entries(next)) if (v) p.set(k, v.slice(0, 80));
    const url = `${path}${p.size ? "?" + p.toString() : ""}`;
    if (key === "q") window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  };
  const reset = () => {
    setQ("");
    setRegion(preset);
    setFlow("");
    setMethodType("");
    setInvalid(false);
    window.history.pushState(null, "", path);
  };
  const toggleCompare = (id: string) => {
    if (!compare.includes(id) && compare.length === 3) {
      setMessage(
        "You can compare up to three markets. Remove one to add another.",
      );
      announce(
        "You can compare up to three markets. Remove one to add another.",
        "attention",
      );
      return;
    }
    const next = compare.includes(id)
      ? compare.filter((v) => v !== id)
      : [...compare, id];
    setCompare(next);
    setMessage("");
    try {
      sessionStorage.setItem("volumerail.compare.v1", JSON.stringify(next));
    } catch {}
  };
  const filtered = countries.filter(
    (c) =>
      (!region || c.region === region) &&
      (!q ||
        `${c.name} ${c.currency} ${c.currencyName} ${searchAliases[c.id]}`
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(
            q
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, ""),
          )) &&
      (!flow || c.availability.some((a) => a.flowId === flow)) &&
      (!methodType ||
        countryMethods(c.id).some((m) => m.category === methodType)),
  );
  const compareHref =
    "/markets/compare?codes=" +
    countries
      .filter((c) => compare.includes(c.id))
      .map((c) => c.iso2)
      .sort()
      .join(",");
  return (
    <>
      <section className="directory-hero dark">
        <div className="wrap">
          <div className="directory-title">
            <Eyebrow>{page.eyebrow}</Eyebrow>
            <h1>{page.h1}</h1>
            <p className="lead">{page.summary}</p>
          </div>
          <Signature />
          <div className="market-filters paper">
            <label htmlFor="market-search">Search country or currency</label>
            <div className="search-field">
              <SearchIcon />
              <input
                id="market-search"
                value={q}
                maxLength={80}
                placeholder="India, INR, Kenya…"
                onChange={(e) => {
                  setQ(e.target.value);
                  changeFilter("q", e.target.value);
                }}
              />
              {q && (
                <button
                  aria-label="Clear search"
                  onClick={() => {
                    setQ("");
                    changeFilter("q", "");
                  }}
                >
                  <Close />
                </button>
              )}
            </div>
            <fieldset>
              <legend>Regions</legend>
              <div className="filter-toggles">
                {[
                  { id: "", label: "All regions" },
                  ...regions.map((r) => ({
                    id: r.id,
                    label: r.id === "latam" ? "LATAM" : r.label,
                  })),
                ].map((r) => (
                  <button
                    key={r.id}
                    aria-pressed={region === r.id}
                    onClick={() => {
                      setRegion(r.id);
                      changeFilter("region", r.id);
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend>Flow type</legend>
              <div className="filter-toggles">
                {[{ id: "", title: "All products" }, ...products].map((p) => (
                  <button
                    key={p.id}
                    aria-pressed={flow === p.id}
                    onClick={() => {
                      setFlow(p.id);
                      changeFilter("flow", p.id);
                    }}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="method-filter" htmlFor="method-type">
              Method type
              <select
                id="method-type"
                value={methodType}
                onChange={(e) => {
                  setMethodType(e.target.value);
                  changeFilter("methodType", e.target.value);
                }}
              >
                <option value="">All method types</option>
                {methodTypes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </section>
      <section className="paper market-results section">
        <div className="wrap">
          <div className="results-top">
            <Eyebrow>
              {preset
                ? `${regions.find((r) => r.id === preset)?.label.toUpperCase()} / FOCUS MARKETS`
                : "FOUR FOCUS MARKETS"}
            </Eyebrow>
            <p role="status" className="small muted">
              {filtered.length} {filtered.length === 1 ? "market" : "markets"}{" "}
              shown
            </p>
            <button className="text-button small" onClick={reset}>
              Clear filters
            </button>
          </div>
          {invalid && (
            <div className="inline-notice" role="status">
              Some filters weren’t recognised. Valid choices are shown.{" "}
              <button className="text-button" onClick={reset}>
                Reset filters
              </button>
            </div>
          )}
          <p className="small muted market-scope-note">
            Local method context is shown separately from merchant availability.
            All current market scopes need confirmation.
          </p>
          {filtered.length ? (
            <div className="country-table">
              <div className="country-table-head" aria-hidden="true">
                <span />
                <span>Country</span>
                <span>Region</span>
                <span>Currency</span>
                <span>Setup</span>
                <span>Explore / Brief</span>
              </div>
              {filtered.map((c) => (
                <div className="country-row" key={c.id}>
                  <label className="compare-checkbox">
                    <input
                      type="checkbox"
                      aria-label={`Compare ${c.name}`}
                      checked={compare.includes(c.id)}
                      onChange={() => toggleCompare(c.id)}
                    />
                  </label>
                  <Link href={`/markets/${c.id}`} className="country-name">
                    <span className="iso-code">{c.iso2}</span>
                    <strong>{c.name}</strong>
                  </Link>
                  <span className="country-region">
                    {regions.find((r) => r.id === c.region)?.short}
                  </span>
                  <span className="country-currency">{c.currency}</span>
                  <span className="country-status muted">
                    {availabilityLabel(c.reviewedAt)}
                  </span>
                  <div className="country-actions">
                    <Link href={`/markets/${c.id}`} className="link-line">
                      Explore <Arrow />
                    </Link>
                    <button
                      className="text-button small"
                      aria-pressed={brief.marketIds.includes(c.id)}
                      onClick={() => toggleMarket(c.id)}
                    >
                      {brief.marketIds.includes(c.id)
                        ? "Added ✓"
                        : "Add to brief +"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-mark" aria-hidden="true">
                ∅
              </span>
              <h2>
                No markets match
                <br />
                these filters.
              </h2>
              <p>Clear a filter or tell us about another market.</p>
              <button className="button" onClick={reset}>
                Clear filters <Arrow />
              </button>
              <Link href="/contact" className="link-line">
                Tell us about another market <Arrow />
              </Link>
            </div>
          )}
          <div className="compare-toolbar">
            <span>
              {compare.length} {compare.length === 1 ? "market" : "markets"}{" "}
              selected <span className="muted small">/ up to 3</span>
            </span>
            <span className="small error-text" role="status">
              {message}
            </span>
            {compare.length ? (
              <Link className="button" href={compareHref}>
                Compare setup <Arrow />
              </Link>
            ) : (
              <span className="small muted">
                Select countries to compare the details.
              </span>
            )}
          </div>
        </div>
      </section>
      <section className="section dark comparison-preview">
        <div className="wrap">
          <div className="comparison-heading">
            <div>
              <Eyebrow>MARKET COMPARISON</Eyebrow>
              <h2>
                Different markets.
                <br />
                One considered brief.
              </h2>
            </div>
            <p className="muted">
              Local methods shown as market context. Merchant availability is
              confirmed separately.
            </p>
          </div>
          <ComparisonMatrix
            ids={compare.length > 0 ? compare : ["india", "kenya"]}
          />
        </div>
      </section>
      {preset && (
        <section className="section paper">
          <div className="wrap editorial-columns">
            {page.sections.map((s, i) => (
              <div key={s.heading}>
                <span className="eyebrow">0{i + 1} / LOCAL CONTEXT</span>
                <h3>{s.heading}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export function ComparisonMatrix({ ids }: { ids: string[] }) {
  const selected = countries.filter((c) => ids.includes(c.id));
  const criteria = [
    {
      label: "Currency",
      value: (id: string) => {
        const c = countries.find((c) => c.id === id)!;
        return `${c.currency} — ${c.currencyName}`;
      },
    },
    {
      label: "Payment scenario",
      value: () => "Pay-ins, payouts and settlement to discuss.",
    },
    {
      label: "Local method context",
      value: (id: string) =>
        countryMethods(id)
          .map((m) => m.name)
          .join(", "),
    },
    { label: "Setup to confirm", value: () => "Scope to confirm" },
    {
      label: "Settlement conditions",
      value: () => "Currency, destination, timing and reporting to agree.",
    },
    { label: "Availability reviewed", value: () => "Not yet verified" },
  ];
  return (
    <>
      <table className="comparison-table">
        <caption className="sr-only">
          Comparison of market operating context. Method names do not confirm
          service availability.
        </caption>
        <thead>
          <tr>
            <th scope="col">
              <span className="small muted">OPERATING DETAIL</span>
            </th>
            {selected.map((c) => (
              <th key={c.id} scope="col">
                <Link href={`/markets/${c.id}`}>
                  <span className="accent-line" />
                  <strong>{c.name}</strong>
                  <span className="small muted">
                    {c.iso2} / {c.currency}
                  </span>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {criteria.map((criterion) => (
            <tr key={criterion.label}>
              <th scope="row">{criterion.label}</th>
              {selected.map((c) => (
                <td key={c.id}>{criterion.value(c.id)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="comparison-mobile">
        {criteria.map((criterion) => (
          <section key={criterion.label}>
            <h2>{criterion.label}</h2>
            <dl>
              {selected.map((c) => (
                <div key={c.id}>
                  <dt>{c.name}</dt>
                  <dd>{criterion.value(c.id)}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </>
  );
}
export function ComparePage({ codes }: { codes: string }) {
  const { brief, update, announce } = useBrief();
  const parsed = codes.toUpperCase().split(",").filter(Boolean);
  const selected = countries.filter((c) => parsed.includes(c.iso2)).slice(0, 3);
  const invalid =
    parsed.length > 3 ||
    parsed.some((code) => !countries.some((c) => c.iso2 === code));
  return (
    <section className="section dark compare-page">
      <div className="wrap">
        <Eyebrow>COMPARE MARKET SETUP</Eyebrow>
        <h1>
          Compare the setup.
          <br />
          Keep the context.
        </h1>
        <p className="lead">
          Compare up to three countries by operating context. Unknown
          availability stays visible.
        </p>
        {invalid && (
          <p className="inline-notice">
            Some country codes were not recognised or exceeded the three-market
            limit. Valid choices are shown.
          </p>
        )}
        {selected.length ? (
          <>
            <ComparisonMatrix ids={selected.map((c) => c.id)} />
            <div className="compare-actions">
              <button
                className="button"
                onClick={() => {
                  update({
                    marketIds: [
                      ...new Set([
                        ...brief.marketIds,
                        ...selected.map((c) => c.id),
                      ]),
                    ],
                  });
                  announce("Selected countries added to your brief.");
                }}
              >
                Add selection to your brief <Arrow />
              </button>
              <Link href="/contact" className="link-line">
                Review brief <Arrow />
              </Link>
              <Link href="/markets" className="link-line">
                Change markets <Arrow />
              </Link>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h2>Choose your markets.</h2>
            <p>Select up to three countries from the market directory.</p>
            <Link className="button" href="/markets">
              Explore markets <Arrow />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
