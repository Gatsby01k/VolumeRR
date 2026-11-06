# VolumeRail implementation record

Implemented from the Website Blueprint v1 and Brand Assets v1 on 6 November 2026. The subsequent Manta choreography correction is documented in `MANTA-MOTION.md`.

## Delivered

The 37 non-reserved blueprint route contracts have implementations, including the custom 404. An additional `/contact/basic` route supplies a native HTML form. The five reserved contracts are retained as data and remain absent from navigation; direct requests return 404.

The main composition follows `00-signature-hero.svg`, which the PDF identifies as the final hero composition. The long home page and the payout, market, country, developer and contact templates follow the supplied plates. UI copy, design roles, country / product data and availability labels follow the JSON contracts. The approved wordmark, original Manta poster and local font files are used directly.

The implemented user journeys cover market search and filters, comparison up to three markets, product → country context, the session-scoped Brief Rail, and merchant / partner / technical / support enquiry branches. JSON and native form transports share the same validation and durable acceptance handler. Enquiries and outbox records commit atomically; retries reuse a stable key and mismatched payloads receive 409. Receipt URLs reveal no personal data.

## Verified

- `npm run build`: passed, including TypeScript and canonical-content validation.
- `npm test`: 40 passing domain, fixture, transaction, API, native-form, origin-regression and Manta-controller checks using synthetic data and temporary databases (including the Manta follow-up).
- Production HTTP checks: 46/46 passed. Full results: `http-verification.json`.
- Live browser checks: eight representative routes at 320, 375, 390, 768, 1024, 1440 and 1920 px; 56/56 checks found one H1, no page-width overflow and no unlabelled form fields. Actual viewport dimensions were checked after layout settled. Results: `browser-verification.json`.
- Manually exercised in the browser: Cyrillic country search, clearing filters, refusal of a fourth comparison, comparison → brief → enquiry, product selection, step validation, business fields, review / edit, disabled public submission, mobile dialog Escape / focus restoration and reduced-motion preference.
- Visual review: full home page plus the payout, market, country, developer, article and contact compositions at desktop and mobile sizes. Final screenshots are in `previews/`.
- Manta follow-up: 800 ms paper reveal, Explore and brief gestures, actual form validation, hide/show, reduced motion, safe placement across ten home widths and a real accepted synthetic receipt on a separate temporary local server. Details: `MANTA-MOTION.md` and `manta-verification.json`.

The reusable Playwright / axe suite is included in `tests/e2e`. It was authored but was not executed in this desktop session; live browser checks above were performed through the desktop browser tools. VoiceOver / NVDA, physical Android / iOS devices, the full browser matrix and field Core Web Vitals were not measured. No accessibility certification is claimed.

## Asset audit

The final local production asset audit measured approximately 171.4 KiB gzip of modern-browser initial JavaScript, 15.8 KiB gzip of CSS, and a 28,302-byte Manta poster. The optional pose atlas is a separate 77,310-byte WebP. The CSS and poster are within their blueprint budgets. Initial JavaScript exceeds the 130 KiB target; this remains an explicit performance gap, largely involving the framework runtime and shared route islands. The legacy `nomodule` polyfill is reported separately. The audit is reproducible with `scripts/measure-assets.ts`; it is not a p75 performance result.

## External inputs still required for public release

1. The actual responsible legal entity, address, operating role, approved legal copy and privacy / retention terms.
2. An enquiry owner, real HTTPS receiving destination and delivery secret, persistent database disk, backups and supervised outbox execution.
3. Verified availability and evidence records before publishing any availability or financial claims.
4. Approved production API / sandbox / support destinations for any corresponding public links.
5. A production Manta GLB / rig if true real-time 3D is required. Neither supplied archive contains one. The follow-up implementation adds a generated 2D pose atlas with a complete finite scene controller; the original poster remains its reduced-motion / asset-failure fallback.

Public enquiry acceptance is disabled by default and all preview routes are unindexed. The legal and service claims are not invented to fill those slots. Public hosting was not configured; the delivered preview is local.

The implementation is ready for review and local use. It is not represented as a 100% production release or a pixel-level regression certification.
