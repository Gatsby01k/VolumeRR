import Link from "next/link";
import { Suspense } from "react";
import {
  countries,
  countryMethods,
  pages,
  products,
  regions,
  type PageCopy,
} from "@/lib/content";
import type { CountryRecord, ProductRecord } from "@/contracts/content-model";
import {
  Eyebrow,
  Signature,
  Section,
  Foundation,
  CTA,
  FAQ,
  CountryLinks,
  ProductLinks,
  LinkArrow,
} from "./common";
import { AddButton, ContextLink, Manta } from "./providers";
import { FlowAnatomy, FlowSpecimen, CopyCode } from "./flow";
import { BriefBuilder, FlowPicker, BriefSummary } from "./brief-builder";
import { MarketDirectory, ComparePage } from "./markets";
import { MethodCatalogue } from "./method-catalogue";
import { Arrow } from "./icons";
import { MantaScene, MantaExploreLink } from "./manta-scene";

export function HomePage() {
  return (
    <>
      <MantaScene>
        <div className="wrap home-hero-inner">
          <Eyebrow>PAYMENTS / BUILT AROUND THE FLOW</Eyebrow>
          <Signature />
          <h1>
            <span className="hero-first">MOVE VALUE.</span>
            <span className="hero-open">OPEN</span>
            <span className="hero-markets">MARKETS.</span>
          </h1>
          <div className="home-intro">
            <p className="lead">
              Pay-ins, payouts and settlement.
              <br />
              Built around local markets.
            </p>
            <Link className="button hero-button" href="/markets">
              Explore markets <Arrow />
            </Link>
          </div>
          <Manta showcase className="hero-manta" />
          <div className="home-market-focus paper">
            <span className="eyebrow">MARKET FOCUS</span>
            {regions.map((r, i) => (
              <MantaExploreLink
                key={r.id}
                href={`/markets/${r.id}`}
                countryId={countries.find((c) => c.region === r.id)?.id}
              >
                <span className="small muted">0{i + 1}</span>
                <strong>{r.short}</strong>
                <span className="market-focus-detail">
                  {countries
                    .filter((c) => c.region === r.id)
                    .map((c) => `${c.name} / ${c.currency}`)
                    .join(" · ")}
                </span>
                <Arrow />
              </MantaExploreLink>
            ))}
            <p className="small muted">
              Scope and terms are confirmed for your business.
            </p>
          </div>
          <div className="home-flow-nav">
            <span className="accent-line" />
            <div>
              {products.map((p, i) => (
                <Link key={p.id} href={`/payments/${p.slug}`}>
                  <span className="small muted">0{i + 1}</span>
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </MantaScene>
      <Section light className="home-path">
        <div className="two-col">
          <div>
            <Eyebrow>01 / THE PAYMENT FLOW</Eyebrow>
            <h2>
              A clear path.
              <br />
              At every stage.
            </h2>
            <p className="lead">
              Define the instruction, understand the processing steps and agree
              what confirmation means for your records.
            </p>
          </div>
          <div>
            <FlowAnatomy compact />
            <ProductLinks />
          </div>
        </div>
      </Section>
      <Section className="home-brief">
        <Eyebrow>02 / BUILD THE BRIEF</Eyebrow>
        <h2>
          Your next market.
          <br />
          Start with the details.
        </h2>
        <p className="lead">
          Choose your markets and payment needs.
          <br />
          Carry the same brief into the first conversation.
        </p>
        <BriefBuilder />
      </Section>
      <Foundation />
      <CTA />
    </>
  );
}

export function SimpleHero({
  page,
  children,
  className = "",
}: {
  page: PageCopy;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`simple-hero dark ${className}`}>
      <div className="wrap">
        <Eyebrow>{page.eyebrow}</Eyebrow>
        <h1>{page.h1}</h1>
        <p className="lead">{page.summary}</p>
        {children || <ContextLink cta={page.primaryCta} />}
      </div>
    </section>
  );
}
export function ProductPage({
  page,
  product,
}: {
  page: PageCopy;
  product: ProductRecord;
}) {
  return (
    <>
      <section className="split-hero product-hero dark">
        <div className="wrap">
          <div className="split-copy">
            <Eyebrow>PAYMENTS / {product.title.toUpperCase()}</Eyebrow>
            <h1>{page.h1}</h1>
            <p className="lead">{page.summary}</p>
            <AddButton flowId={product.id} label={page.primaryCta.label} />
          </div>
          <Signature />
          <div className="split-panel paper">
            <FlowSpecimen
              payout={product.id === "payout"}
              settlement={product.id === "settlement"}
            />
          </div>
        </div>
      </section>
      <Section light>
        <Eyebrow>01 / THE OPERATING PATH</Eyebrow>
        <h2>
          Every instruction
          <br />
          needs a next step.
        </h2>
        <FlowAnatomy stages={product.stages} />
        <div className="question-columns">
          <div>
            <h3>Before submission</h3>
            {["Required fields", "Recipient format", "Funding basis"].map(
              (title, i) => (
                <details key={title}>
                  <summary>
                    {title}
                    <span aria-hidden="true">+</span>
                  </summary>
                  <p>{product.setupQuestions[i]}</p>
                </details>
              ),
            )}
          </div>
          <div>
            <h3>When the outcome is pending</h3>
            {[
              "Status reference",
              "Follow-up owner",
              "Confirmation evidence",
            ].map((title, i) => (
              <details key={title}>
                <summary>
                  {title}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>
                  {
                    [
                      "Agree the reference, status meanings and recovery path for each instruction.",
                      "Define who owns follow-up on pending items and unresolved outcomes.",
                      "Agree the authoritative event and reconciliation record.",
                    ][i]
                  }
                </p>
              </details>
            ))}
          </div>
        </div>
      </Section>
      <Section>
        <div className="two-col">
          <div>
            <Eyebrow>02 / LOCAL CONTEXT</Eyebrow>
            <h2>
              The market changes
              <br />
              the detail.
            </h2>
            <p className="muted">
              Choose the countries relevant to this flow. Availability and
              conditions are confirmed for your business.
            </p>
          </div>
          <CountryLinks flowId={[product.id]} />
        </div>
      </Section>
      <Section light>
        <div className="two-col">
          <div>
            <Eyebrow>03 / INTEGRATION SCOPE</Eyebrow>
            <h2>
              Keep the reference.
              <br />
              Keep the context.
            </h2>
          </div>
          <div>
            <div className="editorial-list">
              {[
                "Instruction fields",
                "Status events",
                "Reconciliation records",
              ].map((item, i) => (
                <Link
                  href={
                    [
                      "/developers/integration-guide",
                      "/developers/payment-lifecycle",
                      "/developers/reconciliation",
                    ][i]
                  }
                  key={item}
                >
                  <span className="small muted">0{i + 1}</span>
                  <strong>{item}</strong>
                  <Arrow />
                </Link>
              ))}
            </div>
            <LinkArrow href="/developers/integration-guide">
              Explore integration planning
            </LinkArrow>
          </div>
        </div>
      </Section>
      <FAQ items={page.faq} />
      <CTA
        title={`Bring the ${product.title.toLowerCase()} scope. We’ll start with the details.`}
        cta={{
          label: `Discuss ${product.title.toLowerCase()}`,
          href: "/contact",
          flowIds: [product.id],
        }}
      />
    </>
  );
}

export function CountryPage({
  country,
  page,
}: {
  country: CountryRecord;
  page: PageCopy;
}) {
  return (
    <>
      <section className="split-hero country-hero dark">
        <div className="wrap">
          <div className="split-copy">
            <div className="breadcrumbs">
              <Link href="/markets">MARKETS</Link>
              <span>/</span>
              <Link href={`/markets/${country.region}`}>
                {regions
                  .find((r) => r.id === country.region)
                  ?.label.toUpperCase()}
              </Link>
              <span>/</span>
              <span>{country.name.toUpperCase()}</span>
            </div>
            <h1>
              <span className="country-display">
                {country.name.toUpperCase()}.
              </span>
              <span>
                Build around
                <br />
                the local flow.
              </span>
            </h1>
            <p className="lead">{page.summary}</p>
            <AddButton marketId={country.id} label={page.primaryCta.label} />
            <div className="country-hero-status">
              <span className="eyebrow">MARKET FOCUS</span>
              <span>Scope to confirm</span>
            </div>
          </div>
          <Signature />
          <div className="split-panel currency-panel paper">
            <span className="outlined-currency">{country.currency}</span>
            <span>{country.currencyName}</span>
            <span className="eyebrow">{country.iso2} / LOCAL CURRENCY</span>
          </div>
        </div>
      </section>
      <Section light>
        <div className="two-col">
          <div>
            <Eyebrow>01 / THE MARKET BRIEF</Eyebrow>
            <h2>
              Start with
              <br />
              the operating
              <br />
              context.
            </h2>
            <p className="lead">
              Understand the key details for {country.name} and define the right
              payment scope for your business.
            </p>
          </div>
          <dl className="data-list">
            <div>
              <dt>Region</dt>
              <dd>{regions.find((r) => r.id === country.region)?.label}</dd>
            </div>
            <div>
              <dt>Local currency</dt>
              <dd>
                {country.currency}
                <span className="small muted">{country.currencyName}</span>
              </dd>
            </div>
            <div>
              <dt>Products to scope</dt>
              <dd>Pay-ins · Payouts · Settlement</dd>
            </div>
            <div>
              <dt>Method availability</dt>
              <dd>
                Scope to confirm
                <span className="small muted">
                  Availability is confirmed for the merchant setup.
                </span>
              </dd>
            </div>
            <div>
              <dt>Availability reviewed</dt>
              <dd>Not yet verified</dd>
            </div>
          </dl>
        </div>
      </Section>
      <Section>
        <div className="two-col">
          <div>
            <Eyebrow>02 / LOCAL METHOD LANDSCAPE</Eyebrow>
            <h2>
              Local context.
              <br />
              Clear conditions.
            </h2>
            <p className="lead">
              Methods shown describe the local market. VolumeRail availability
              is confirmed for each merchant setup.
            </p>
            <LinkArrow href="/payments/methods">
              View local method context
            </LinkArrow>
          </div>
          <div className="local-methods">
            {countryMethods(country.id).map((m) => (
              <div key={m.id}>
                <span className="eyebrow">
                  {m.category.replaceAll("_", " ")}
                </span>
                <h3>{m.name}</h3>
                <p className="muted">
                  Local market context. Access and merchant eligibility require
                  confirmation.
                </p>
                <a
                  className="link-line small"
                  href={m.contextSourceUrls[0]}
                  target="_blank"
                  rel="noreferrer"
                >
                  Primary source <Arrow />
                </a>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <Section light>
        <div className="country-scope">
          <div>
            <Eyebrow>03 / BUILD THE SCOPE</Eyebrow>
            <h2>
              Define your
              <br />
              {country.name} scope.
            </h2>
            <p className="muted">
              Select the products you want to include in your payment flow.
              We’ll help confirm the method and operating scope.
            </p>
          </div>
          <FlowPicker countryId={country.id} />
          <BriefSummary />
        </div>
      </Section>
      <CTA
        title={`Your ${country.name} flow. Start with the details.`}
        cta={{
          label: `Discuss ${country.name}`,
          href: "/contact",
          marketIds: [country.id],
        }}
      />
    </>
  );
}

const docPaths = [
  "/developers/integration-guide",
  "/developers/payment-lifecycle",
  "/developers/webhooks",
  "/developers/reconciliation",
];
const docNames = [
  "Integration guide",
  "Payment lifecycle",
  "Webhooks",
  "Reconciliation",
];
const docSummaries = [
  "Align scope, fields and dependencies.",
  "Connect instructions to outcomes.",
  "Plan delivery, retries and recovery.",
  "Align records and resolve differences.",
];
export function DevelopersPage() {
  return (
    <>
      <section className="developers-hero dark">
        <div className="wrap">
          <Eyebrow>DEVELOPERS</Eyebrow>
          <h1>
            MAKE THE FLOW
            <br />
            UNDERSTANDABLE.
          </h1>
          <div className="developer-intro">
            <p className="lead">{pages.developers.summary}</p>
            <Link className="button" href="/developers/integration-guide">
              Explore integration guide <Arrow />
            </Link>
            <div className="chapter-links">
              <a href="#get-started">01 / Overview</a>
              <a href="#events">02 / Events</a>
              <a href="#integration-brief">03 / Operations</a>
            </div>
          </div>
          <Signature />
          <div className="developer-flow paper">
            <FlowAnatomy compact />
          </div>
        </div>
      </section>
      <Section light id="get-started">
        <div className="two-col">
          <div>
            <Eyebrow>GET STARTED</Eyebrow>
            <h2>
              Start with
              <br />
              the operating model.
            </h2>
            <p className="lead">Four key areas to plan the integration.</p>
          </div>
          <div className="editorial-list">
            {docNames.map((name, i) => (
              <Link href={docPaths[i]} key={name}>
                <span className="small muted">0{i + 1}</span>
                <strong>{name}</strong>
                <span className="muted small">{docSummaries[i]}</span>
                <Arrow />
              </Link>
            ))}
          </div>
        </div>
      </Section>
      <Section id="events">
        <div className="two-col">
          <div>
            <Eyebrow>EVENTS AND STATES</Eyebrow>
            <h2>
              Design for the
              <br />
              states in between.
            </h2>
            <p className="lead">
              Agree event meanings, retry rules and reporting before
              implementation.
            </p>
            <Link className="button" href="/developers/webhooks">
              View event guidance <Arrow />
            </Link>
          </div>
          <div className="event-specimen">
            <span className="eyebrow">CONCEPTUAL EXAMPLE</span>
            {[
              {
                title: "Pending",
                body: "An instruction is in progress. Its outcome is not yet known.",
                state: "pending",
              },
              {
                title: "Confirmed",
                body: "The agreed authoritative record confirms the outcome.",
                state: "confirmed",
              },
              {
                title: "Needs attention",
                body: "An exception needs investigation and an operating owner.",
                state: "attention",
              },
            ].map((event, i) => (
              <div className={`event-row ${event.state}`} key={event.title}>
                <span className="event-dot" />
                <strong>{event.title}</strong>
                <p className="muted small">{event.body}</p>
                <span className="small muted">0{i + 1}</span>
              </div>
            ))}
            <p className="small muted">
              Independent examples of states, not a transaction history.
            </p>
          </div>
        </div>
      </Section>
      <Section light id="integration-brief">
        <div className="two-col">
          <div>
            <Eyebrow>YOUR INTEGRATION BRIEF</Eyebrow>
            <h2>
              Your
              <br />
              integration brief.
            </h2>
            <p className="lead">
              Align your team, reduce risk and move to implementation with
              confidence.
            </p>
          </div>
          <div className="editorial-list">
            {[
              "Market and flow",
              "Required fields",
              "Event handling",
              "Reporting",
              "Test and launch criteria",
            ].map((item, i) => (
              <ContextLink
                key={item}
                className="row-link"
                cta={{
                  label: `${String(i + 1).padStart(2, "0")} / ${item}`,
                  href: "/contact",
                  purpose: "technical",
                }}
              />
            ))}
          </div>
        </div>
      </Section>
      <CTA
        title="Discuss a technical integration."
        cta={{
          label: "Discuss technical scope",
          href: "/contact",
          purpose: "technical",
        }}
      />
    </>
  );
}

export function ArticlePage({
  page,
  technical = false,
}: {
  page: PageCopy;
  technical?: boolean;
}) {
  return (
    <>
      <section className="article-header dark">
        <div className="wrap">
          <div className="breadcrumbs">
            <Link href={technical ? "/developers" : "/resources"}>
              {technical ? "DEVELOPERS" : "RESOURCES"}
            </Link>
            <span>/</span>
            <span>PLANNING GUIDANCE</span>
          </div>
          <Eyebrow>{page.eyebrow}</Eyebrow>
          <h1>{page.h1}</h1>
          <p className="lead">{page.summary}</p>
          <p className="small muted">
            Planning guidance / English / VolumeRail
          </p>
        </div>
      </section>
      <Section light className="article-section">
        <div className="article-layout">
          <aside className="article-nav">
            <span className="eyebrow">ON THIS PAGE</span>
            <nav aria-label="Article contents">
              {page.sections.map((s, i) => (
                <a key={s.heading} href={`#section-${i + 1}`}>
                  {s.heading}
                </a>
              ))}
            </nav>
            {technical && (
              <>
                <span className="eyebrow">INTEGRATION PLANNING</span>
                {docNames.map((name, i) => (
                  <Link
                    className={page.path === docPaths[i] ? "active" : ""}
                    key={name}
                    href={docPaths[i]}
                  >
                    {name}
                  </Link>
                ))}
              </>
            )}
          </aside>
          <article className="article-body">
            <div className="article-notice">
              {technical
                ? "Conceptual guidance. Request the current, approved integration contract before implementation."
                : "A practical guide to preparing your payment scope. Availability and terms need confirmation."}
            </div>
            {page.sections.map((s, i) => (
              <section id={`section-${i + 1}`} key={s.heading}>
                <span className="eyebrow">
                  0{i + 1} / {technical ? "INTEGRATION" : "THE USEFUL DETAIL"}
                </span>
                <h2>{s.heading}</h2>
                <p>{s.body}</p>
                {technical && i === 1 && (
                  <CopyCode
                    code={JSON.stringify(
                      {
                        reference: "your-internal-reference",
                        stage: "processing",
                        outcome: "not_yet_confirmed",
                        next: "agree_authoritative_event",
                      },
                      null,
                      2,
                    )}
                  />
                )}
              </section>
            ))}
            <div className="article-next">
              <ContextLink cta={page.primaryCta} />
              <LinkArrow href={technical ? "/developers" : "/resources"}>
                All {technical ? "integration materials" : "resources"}
              </LinkArrow>
            </div>
          </article>
        </div>
      </Section>
    </>
  );
}

export function EditorialPage({
  page,
  kind,
}: {
  page: PageCopy;
  kind: string;
}) {
  const links: Record<string, string[]> = {
    payments: products.map((p) => `/payments/${p.slug}`),
    industries: [
      "/industries/igaming",
      "/industries/digital-businesses",
      "/contact",
    ],
    resources: [
      "/resources/local-payment-methods",
      "/resources/pay-ins-vs-payouts",
      "/resources/settlement-readiness",
    ],
    partners: [
      "/contact?purpose=partner",
      "/contact?purpose=partner",
      "/contact?purpose=partner",
      "/contact?purpose=partner",
    ],
    support: [
      "/contact?purpose=merchant",
      "/contact?purpose=technical",
      "/contact?purpose=support",
    ],
  };
  const isIndex = !!links[kind];
  return (
    <>
      <SimpleHero page={page} />
      {isIndex ? (
        <Section light className="index-sections">
          {page.sections.map((s, i) => (
            <div className="index-row" key={s.heading}>
              <span className="eyebrow">0{i + 1}</span>
              <h2>{s.heading}</h2>
              <p>{s.body}</p>
              <Link
                href={links[kind][i] || "/contact"}
                aria-label={`Explore ${s.heading}`}
                className="index-arrow"
              >
                <Arrow />
              </Link>
            </div>
          ))}
        </Section>
      ) : (
        <>
          {page.sections.map((s, i) => (
            <Section light={i % 2 === 0} key={s.heading}>
              <div className="two-col">
                <div>
                  <Eyebrow>
                    0{i + 1} / {page.eyebrow}
                  </Eyebrow>
                  <h2>{s.heading}</h2>
                </div>
                <div>
                  <p className="lead">{s.body}</p>
                  {kind === "trust" ? (
                    <div className="scope-box">
                      <span className="eyebrow">THE OPERATING SCOPE</span>
                      <p>
                        Merchant responsibilities. VolumeRail responsibilities.
                        Partner responsibilities.
                      </p>
                      <ContextLink
                        cta={{
                          label: "Request the relevant detail",
                          href: "/contact",
                        }}
                        className="link-line"
                      />
                    </div>
                  ) : (
                    <CountryLinks />
                  )}
                </div>
              </div>
            </Section>
          ))}
        </>
      )}
      {kind === "payments" && (
        <Section>
          <div className="two-col">
            <div>
              <Eyebrow>SHARED UNDERSTANDING</Eyebrow>
              <h2>
                You define.
                <br />
                We confirm.
              </h2>
            </div>
            <div className="responsibility-grid">
              <div>
                <h3>You define</h3>
                <p>
                  Business model, target countries, customer journey and the
                  direction of funds.
                </p>
              </div>
              <div>
                <h3>We confirm</h3>
                <p>
                  Proposed scope, responsibilities, requirements and the next
                  steps.
                </p>
              </div>
            </div>
          </div>
        </Section>
      )}
      <FAQ items={page.faq} />
      {kind === "support" ? null : (
        <CTA
          cta={page.primaryCta}
          title={
            kind === "partners"
              ? "A clearer partnership starts here."
              : undefined
          }
        />
      )}
    </>
  );
}

export function LegalPage({ page, kind }: { page: PageCopy; kind: string }) {
  return (
    <>
      <section className="article-header dark">
        <div className="wrap">
          <Eyebrow>{page.eyebrow}</Eyebrow>
          <h1>{page.h1}</h1>
          <p className="lead">{page.summary}</p>
        </div>
      </section>
      <Section light>
        <div className="article-layout">
          <aside className="article-nav">
            <span className="eyebrow">LEGAL INFORMATION</span>
            {["privacy", "cookies", "terms"].map((k) => (
              <Link
                key={k}
                className={kind === k ? "active" : ""}
                href={`/legal/${k}`}
              >
                {pages[k].h1}
              </Link>
            ))}
          </aside>
          <article className="article-body">
            <div className="article-notice">
              This implementation preview does not have an approved public legal
              notice. Public enquiry collection remains disabled until the
              responsible entity and processing terms are configured.
            </div>
            {kind === "cookies" ? (
              <>
                <section>
                  <h2>Essential website storage</h2>
                  <div className="storage-inventory">
                    <h3>volumerail.brief.v1</h3>
                    <p>
                      Session storage. Market and product IDs, purpose,
                      exploring flags and source route. Expires after 24 hours
                      or when the session ends. No contact fields or free text.
                    </p>
                    <h3>volumerail.compare.v1</h3>
                    <p>
                      Session storage. Up to three country IDs for market
                      comparison. Removed when the session ends.
                    </p>
                    <h3>volumerail.preferences.v1</h3>
                    <p>
                      Local storage. Manta visibility, motion mode and optional
                      analytics preference. Retained until you change or clear
                      preferences.
                    </p>
                    <h3>vr_receipt</h3>
                    <p>
                      Essential, HttpOnly, SameSite cookie after an accepted
                      enquiry. Contains an opaque receipt token, never contact
                      details. Expires after one hour.
                    </p>
                  </div>
                </section>
                <section>
                  <h2>Optional preferences</h2>
                  <p>
                    Analytics and marketing are off by default. No analytics
                    provider, session recording or marketing tracker is
                    connected.
                  </p>
                </section>
              </>
            ) : (
              page.sections.map((s) => (
                <section key={s.heading}>
                  <h2>{s.heading}</h2>
                  <p>
                    {s.body.startsWith("Owner-required")
                      ? "The responsible entity must supply and approve this section before public collection is enabled."
                      : s.body}
                  </p>
                </section>
              ))
            )}
            <LinkArrow href="/contact">Return to your brief</LinkArrow>
          </article>
        </div>
      </Section>
    </>
  );
}
export function NotFoundPage() {
  return (
    <>
      <section className="not-found dark">
        <div className="wrap">
          <Eyebrow>404 / PAGE NOT FOUND</Eyebrow>
          <span className="not-found-number" aria-hidden="true">
            404
          </span>
          <h1>Find your flow.</h1>
          <p className="lead">
            This page could not be found.
            <br />
            Your next step can still be clear.
          </p>
          <Link className="button" href="/markets">
            Explore markets <Arrow />
          </Link>
          <LinkArrow href="/">Back to home</LinkArrow>
        </div>
      </section>
    </>
  );
}

export function RoutePage({ id, codes = "" }: { id: string; codes?: string }) {
  const page = pages[id];
  if (id === "home") return <HomePage />;
  const product = products.find((p) => `/payments/${p.slug}` === page.path);
  if (product) return <ProductPage page={page} product={product} />;
  const country = countries.find((c) => c.id === id);
  if (country) return <CountryPage page={page} country={country} />;
  if (id === "markets" || regions.some((r) => r.id === id))
    return (
      <>
        <Suspense
          fallback={
            <section className="simple-hero dark">
              <div className="wrap">
                <p role="status">Loading market directory…</p>
              </div>
            </section>
          }
        >
          <MarketDirectory page={page} preset={id === "markets" ? "" : id} />
        </Suspense>
        <CTA light title="Bring your next market." />
      </>
    );
  if (id === "compare") return <ComparePage codes={codes} />;
  if (id === "developers") return <DevelopersPage />;
  if (
    [
      "guide",
      "lifecycle",
      "webhooks",
      "reconciliation",
      "guide_methods",
      "guide_flows",
      "guide_settlement",
    ].includes(id)
  )
    return (
      <ArticlePage
        page={page}
        technical={page.path.startsWith("/developers")}
      />
    );
  if (["privacy", "cookies", "terms"].includes(id))
    return <LegalPage page={page} kind={id} />;
  if (id === "methods")
    return (
      <>
        <SimpleHero page={page} />
        <Section light>
          <MethodCatalogue />
        </Section>
        <CTA title="Start with the market. Keep the context." />
      </>
    );
  if (id === "not_found") return <NotFoundPage />;
  return <EditorialPage page={page} kind={id} />;
}
