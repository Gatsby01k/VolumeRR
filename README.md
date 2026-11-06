# VolumeRail

Implementation of the VolumeRail Website Blueprint v1 and the supplied Brand Assets v1. English UI, original Unbounded / Manrope fonts, the approved wordmark and Manta assets.

## Run

Node.js 24 or newer is required for the built-in SQLite database.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. For a production build, run `npm run build` and `npm start`.

## Included

- 37 blueprint routes and an additional accessible, JavaScript-free enquiry form at `/contact/basic`.
- Five reserved route contracts remain hidden and return 404 until approved content exists.
- Market / method filters, URL state, comparison of up to three countries, country and product context, and a session-scoped Brief Rail.
- Merchant, partner, technical and support enquiry branches; review, field errors, rate limits, unavailable and uncertain states, and safe retries.
- Server-side JSON Schema and registry validation, same-origin checks, 16 KB body limit, honeypot, persistent rate limits and private receipt cookies.
- Atomic SQLite enquiry + outbox transactions, stable idempotency keys, duplicate / conflict handling, and a separately retryable signed delivery worker.
- Reduced motion, Manta visibility and storage preferences; responsive native navigation and comparison layouts.
- Content, routes, contracts, design tokens, fonts, asset provenance and the original written specifications are versioned alongside the code.

## Public enquiries and release configuration

The supplied archives contain no approved legal entity, privacy notice, delivery destination, production API contract, or verified availability. The default implementation is an unindexed preview, and public submission is disabled. No external system is contacted by the preview.

Copy `.env.example` to `.env.local` and supply approved values before enabling `ENQUIRIES_ENABLED=true`. This guard requires the entity, address, privacy contact/version, enquiry owner, HTTPS delivery destination, delivery secret, and rate-limit secret. Supply the actual approved legal copy in `components/pages.tsx` / the content registry, and publish only reviewed route records. Set `NEXT_PUBLIC_SITE_URL` to the real HTTPS origin. `NEXT_PUBLIC_RELEASE_MODE=published` permits indexing only for route records explicitly marked `published`.

The accepted response means the enquiry and outbox have been committed to the database. Delivery is separate. Run `npm run outbox` in a supervised scheduler. The receiver verifies `X-VolumeRail-Signature` (`HMAC-SHA256(timestamp + "." + body)`) and deduplicates using the stable `Idempotency-Key`. Retries use exponential backoff and a claim lease. Notification failure never removes the enquiry or receipt.

Deploy the Node application to a server with a persistent disk for `ENQUIRY_DB_PATH`, backups, TLS and a reverse proxy that overwrites `x-real-ip`. Do not place SQLite on an ephemeral function filesystem. Horizontal scaling requires a shared transactional database adapter. Configure the actual retention / deletion schedule according to the approved privacy notice. This repository does not invent one.

## Verification

```sh
npm run typecheck
npm run validate
npm test
npm run build
node --import tsx scripts/smoke.ts
node --import tsx scripts/measure-assets.ts
```

Unit / integration tests use synthetic data and temporary databases. They cover the supplied enquiry fixtures, registry checks, browser-storage allowlisting, transaction rollback, duplicate and conflict behavior, protected receipt access, rate limiting and the native HTML form transport. The smoke script requires a running local server and writes `docs/http-verification.json`.

Browser QA covers the supplied seven viewport widths and the market → compare → brief → enquiry path. Its observed results are recorded in `docs/IMPLEMENTATION.md`.

The repeatable browser suite is `npm run test:e2e` (install the Playwright Chromium browser first). Live browser checks were performed in this desktop session; the separate Playwright / axe suite was not run. The implementation report records remaining release inputs and the initial JavaScript budget gap.

## Assets

The original static Manta poster is used with short CSS reactions. Both archives explicitly omit a production GLB, rig and animation clips; no 3D asset is represented as delivered. The site works without WebGL. Font licenses are in `public/fonts`; brand provenance is in `public/brand/PROVENANCE.md`.

Raw handoff archives and temporary renderings stay in the ignored `.handoff` folder. No private form submissions, environment files or runtime databases are committed.
