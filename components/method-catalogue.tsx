"use client";
import { useState } from "react";
import Link from "next/link";
import { countries, methods } from "@/lib/registry";
import { Arrow, SearchIcon } from "./icons";
export function MethodCatalogue() {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");
  const found = methods.filter(
    (m) =>
      (!q || m.name.toLowerCase().includes(q.toLowerCase())) &&
      (!country || m.countryIds.includes(country)) &&
      (!category || m.category === category),
  );
  return (
    <div className="method-catalogue">
      <div className="catalogue-filters">
        <label>
          Search methods
          <div className="search-field">
            <SearchIcon />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="UPI, M-PESA…"
            />
          </div>
        </label>
        <label>
          Country
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">All countries</option>
            {countries.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Method type
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All types</option>
            {[...new Set(methods.map((m) => m.category))].map((c) => (
              <option value={c} key={c}>
                {c.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="small muted" role="status">
        {found.length} local method references. Availability through VolumeRail
        needs confirmation.
      </p>
      <div className="method-list">
        {found.map((m) => (
          <details key={m.id}>
            <summary>
              <span className="eyebrow">{m.category.replaceAll("_", " ")}</span>
              <h3>{m.name}</h3>
              <span className="muted">
                {m.countryIds
                  .map((id) => countries.find((c) => c.id === id)?.name)
                  .join(", ")}
              </span>
              <span className="status-tag">Scope to confirm</span>
              <span aria-hidden="true">+</span>
            </summary>
            <div className="method-detail">
              <p>
                Local market context. Listing this method does not confirm
                availability through VolumeRail. Discuss the country, merchant
                scope and direction of funds.
              </p>
              <div>
                {m.contextSourceUrls.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="link-line"
                  >
                    {i ? "Further context" : "Primary method source"}
                    <Arrow />
                  </a>
                ))}
                {m.countryIds.map((id) => (
                  <Link className="link-line" key={id} href={`/markets/${id}`}>
                    Explore {countries.find((c) => c.id === id)?.name}
                    <Arrow />
                  </Link>
                ))}
              </div>
            </div>
          </details>
        ))}
      </div>
      {!found.length && (
        <div className="empty-state">
          <h2>No matching methods.</h2>
          <button
            className="button"
            onClick={() => {
              setQ("");
              setCountry("");
              setCategory("");
            }}
          >
            Clear filters <Arrow />
          </button>
        </div>
      )}
    </div>
  );
}
