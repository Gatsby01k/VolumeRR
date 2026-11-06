import Link from "next/link";
import type { ReactNode } from "react";
import { countries, products, routes } from "@/lib/content";
import navigation from "@/content/navigation.json";
import { Arrow } from "./icons";
import { ContextLink, PreferencesButtons } from "./providers";
import type { CtaContext } from "@/contracts/content-model";

export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`eyebrow slash ${className}`}>{children}</div>;
}
export function Signature({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`signature ${className}`}
      viewBox="0 0 900 620"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="paper-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FAF9F4" />
          <stop offset="1" stopColor="#F1F0E9" />
        </linearGradient>
        <linearGradient id="metal-gradient" x1="0" x2="1">
          <stop stopColor="#758083" />
          <stop offset=".35" stopColor="#F6F8F6" />
          <stop offset=".7" stopColor="#CBD0D2" />
          <stop offset="1" stopColor="#697579" />
        </linearGradient>
      </defs>
      <path
        className="signature-paper"
        d="M90 4H900V620H228L14 260Q0 241 14 210L52 70Q68 20 90 4Z"
        fill="url(#paper-gradient)"
      />
      <g className="signature-edge">
        <path
          className="signature-lip"
          d="M90 4Q68 20 52 70L14 210Q0 241 14 260L228 620L240 620L26 254Q12 238 26 214L64 74Q80 24 102 4Z"
          fill="url(#paper-gradient)"
        />
        <path
          d="M90 4Q68 20 52 70L14 210Q0 241 14 260L228 620"
          fill="none"
          stroke="url(#metal-gradient)"
          strokeWidth="8"
        />
        <path
          d="M83 10Q62 29 46 72L8 210"
          fill="none"
          stroke="#CDFF00"
          strokeWidth="2"
        />
        <path d="m178 554 41 59" fill="none" stroke="#FF251E" strokeWidth="4" />
      </g>
    </svg>
  );
}
export function LinkArrow({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`link-line ${className}`}>
      {children}
      <Arrow />
    </Link>
  );
}
export function Section({
  children,
  light = false,
  className = "",
  id,
}: {
  children: ReactNode;
  light?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`section ${light ? "paper" : "dark"} ${className}`}
    >
      <div className="wrap">{children}</div>
    </section>
  );
}
export function FAQ({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  if (!items.length) return null;
  return (
    <Section light className="faq-section">
      <div className="two-col">
        <div>
          <Eyebrow>THE USEFUL DETAIL</Eyebrow>
          <h2>
            A clearer
            <br />
            next step.
          </h2>
        </div>
        <div className="faq-list">
          {items.map((q) => (
            <details key={q.question}>
              <summary>
                {q.question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{q.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}
export function Foundation({ light = true }: { light?: boolean }) {
  return (
    <Section light={light} className="foundation">
      <div className="foundation-grid">
        <div>
          <Eyebrow>03 / A STRONGER FOUNDATION</Eyebrow>
          <h2>
            Clarity before
            <br />
            the first flow.
          </h2>
          <p className="muted">
            Local expertise. Global infrastructure.
            <br />A clearer path from opportunity to operation.
          </p>
        </div>
        <div className="foundation-points">
          <div>
            <h3>Market scope</h3>
            <p>
              Understand local payment methods, currency and operating
              requirements in your target markets.
            </p>
          </div>
          <div>
            <h3>Integration scope</h3>
            <p>
              Plan the fields, events and technical approach for your use case
              and internal systems.
            </p>
          </div>
          <div>
            <h3>Operating conditions</h3>
            <p>
              Set expectations for timing, eligibility, reconciliation and
              ongoing operations.
            </p>
          </div>
          <LinkArrow href="/trust">Explore the operating approach</LinkArrow>
        </div>
      </div>
    </Section>
  );
}
export function CTA({
  title = "Let’s map your next move.",
  body = "Real markets. Practical paths. Tell us where you want to operate and how value needs to move.",
  light = false,
  cta,
}: {
  title?: string;
  body?: string;
  light?: boolean;
  cta?: CtaContext;
}) {
  return (
    <Section light={light} className="cta-section">
      <div className="cta-grid">
        <div>
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
        <ContextLink
          cta={cta || { label: "Discuss your flow", href: "/contact" }}
        />
      </div>
    </Section>
  );
}
export function CountryLinks({ flowId }: { flowId?: CtaContext["flowIds"] }) {
  return (
    <div className="country-links">
      {countries.map((country, i) => (
        <div className="list-link-row" key={country.id}>
          <span className="small muted">0{i + 1}</span>
          <ContextLink
            className="row-link"
            cta={{
              href: `/markets/${country.id}`,
              label: `${country.name} / ${country.currency}`,
              flowIds: flowId,
            }}
          />
        </div>
      ))}
    </div>
  );
}
export function ProductLinks() {
  return (
    <div className="product-links">
      {products.map((p, i) => (
        <Link href={`/payments/${p.slug}`} key={p.id}>
          <span className="muted small">0{i + 1}</span>
          <strong>{p.title}</strong>
          <span className="muted">
            {
              [
                "Collect locally.",
                "Scope outgoing payments.",
                "Close the loop.",
              ][i]
            }
          </span>
          <Arrow />
        </Link>
      ))}
    </div>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <Link className="wordmark" href="/" aria-label="VolumeRail home">
            <img
              src="/brand/wordmark.webp"
              width="200"
              height="68"
              alt="VolumeRail"
              loading="lazy"
            />
          </Link>
          <p>
            Pay-ins, payouts and settlement.
            <br />
            Built around local markets.
          </p>
          <div className="footer-regions">
            {["ASIA", "LATAM", "AFRICA"].map((label, i) => (
              <Link
                key={label}
                href={`/markets/${["asia", "latam", "africa"][i]}`}
              >
                {label}
                <Arrow />
              </Link>
            ))}
          </div>
        </div>
        <div className="footer-columns">
          {navigation.footerGroups.map((group) => (
            <div key={group.label}>
              <h3 className="eyebrow">{group.label}</h3>
              {group.items.map((path) => (
                <Link key={path} href={path}>
                  {routes.find((r) => r.path === path)?.title || path}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} VolumeRail</span>
          <span className="footer-scope">
            Market availability and terms are confirmed for your business.
          </span>
          <div className="footer-settings">
            <PreferencesButtons />
          </div>
        </div>
      </div>
    </footer>
  );
}
