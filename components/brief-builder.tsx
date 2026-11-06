"use client";
import Link from "next/link";
import { useBrief } from "./providers";
import { countries, products } from "@/lib/registry";
import { Arrow } from "./icons";

export function BriefSummary({
  editing = false,
  onEdit,
}: {
  editing?: boolean;
  onEdit?: (step: number) => void;
}) {
  const { brief } = useBrief();
  return (
    <div className="brief-summary">
      <span className="eyebrow">YOUR PAYMENT BRIEF</span>
      <dl>
        <div>
          <dt>Purpose</dt>
          <dd className="capitalize">{brief.purpose}</dd>
          {editing && (
            <button className="text-button" onClick={() => onEdit?.(0)}>
              Edit <Arrow />
            </button>
          )}
        </div>
        <div>
          <dt>Markets</dt>
          <dd>
            {brief.marketIds
              .map((id) => countries.find((c) => c.id === id)?.name)
              .join(", ") ||
              (brief.marketExploring ? "Not sure yet" : "To discuss")}
            {brief.marketIds.length > 0 && brief.marketExploring
              ? " · Also exploring"
              : ""}
          </dd>
          {editing && (
            <button className="text-button" onClick={() => onEdit?.(0)}>
              Edit <Arrow />
            </button>
          )}
        </div>
        <div>
          <dt>Products</dt>
          <dd>
            {brief.flowIds
              .map((id) => products.find((p) => p.id === id)?.title)
              .join(", ") ||
              (brief.flowExploring ? "Still exploring" : "To discuss")}
          </dd>
          {editing && (
            <button className="text-button" onClick={() => onEdit?.(1)}>
              Edit <Arrow />
            </button>
          )}
        </div>
        <div>
          <dt>Settlement</dt>
          <dd>
            {brief.settlementPreference &&
            brief.settlementPreference !== "not_sure"
              ? brief.settlementPreference
              : "To discuss"}
          </dd>
        </div>
      </dl>
      {!editing && (
        <Link className="button" href="/contact">
          Review brief <Arrow />
        </Link>
      )}
    </div>
  );
}
export function FlowPicker({ countryId }: { countryId?: string }) {
  const { brief, update, toggleFlow } = useBrief();
  return (
    <div className="flow-picker">
      {products.map((p, i) => (
        <label className="flow-toggle-row" key={p.id}>
          <input
            className="switch"
            type="checkbox"
            checked={brief.flowIds.includes(p.id)}
            onChange={() => {
              if (countryId && !brief.marketIds.includes(countryId))
                update({ marketIds: [...brief.marketIds, countryId] });
              toggleFlow(p.id);
            }}
          />
          <span>
            <strong>{p.title}</strong>
            <span className="muted small">
              {
                ["Local collection", "Outgoing payments", "Currency and cycle"][
                  i
                ]
              }
            </span>
          </span>
          <span className="muted small">{p.summary}</span>
        </label>
      ))}
    </div>
  );
}
export function BriefBuilder() {
  const { brief, toggleMarket, toggleFlow } = useBrief();
  return (
    <div className="brief-builder">
      <div className="brief-builder-choices">
        <div>
          <span className="eyebrow">MARKETS</span>
          <div className="choice-chips">
            {countries.map((c) => (
              <button
                key={c.id}
                aria-pressed={brief.marketIds.includes(c.id)}
                className={`chip ${brief.marketIds.includes(c.id) ? "selected" : ""}`}
                onClick={() => toggleMarket(c.id)}
              >
                {c.name}
                <span>{brief.marketIds.includes(c.id) ? "✓" : "+"}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="eyebrow">PRODUCTS</span>
          <div className="choice-chips">
            {products.map((p) => (
              <button
                key={p.id}
                aria-pressed={brief.flowIds.includes(p.id)}
                className={`chip ${brief.flowIds.includes(p.id) ? "selected" : ""}`}
                onClick={() => toggleFlow(p.id)}
              >
                {p.title}
                <span>{brief.flowIds.includes(p.id) ? "✓" : "+"}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="paper brief-preview">
        <BriefSummary />
      </div>
    </div>
  );
}
