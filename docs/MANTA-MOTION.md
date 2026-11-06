# Manta choreography correction

The initial implementation supplied only a static poster and generic transforms. It did not implement the interaction storyboard in full. This follow-up connects the character to the actual market and enquiry journeys.

## What Manta does

| Scene / event                                                                  | Behaviour                                                                                        | Time      |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | --------- |
| First visible home intro                                                       | Peek → turn → lift the decorative edge → settle → one blink. Text and controls remain available. | 800 ms    |
| Market link focus, pointer entry or comparison selection                       | Look / point toward the market, with a bank up to 8°.                                            | 440 ms    |
| A real market/product change in the brief, including the enquiry form          | A fin gesture and a small lime impulse toward the visible brief action.                          | 320 ms    |
| Validation failure                                                             | A short questioning tilt, independent of the accessible error summary.                           | 180 ms    |
| A server-accepted receipt                                                      | A quiet settling gesture on the receipt edge, deduplicated by receipt ID.                        | 420 ms    |
| Reduced motion, hide preference, document hidden or actor outside the viewport | Immediate static/hidden state or suspended animation; no queued gestures.                        | Immediate |

The reveal uses separate poses and an SVG edge group. Only the decorative lip/edge moves, by up to 12 px; headings, fields and hit areas stay fixed. The mobile character occupies an 88 px slot above the horizontal paper fold. Its rail version occupies 40 px; the desktop rail version occupies 64 px.

The hero, market header, form and receipt share one controller. Intersection observers suppress the rail duplicate when a showcase instance is visible. No idle loop, scroll hijacking, chatbot, AI response, payment execution or fake success is added. A new action replaces the previous gesture. The first interaction completes/skips the intro, and scrolling back does not replay it.

`enquiry_received` is emitted only through `confirmReceipt` when the confirmation page displays a protected, server-accepted receipt. The form navigates there after its 202 response, so navigation latency cannot consume the 420 ms gesture before the receipt appears. Pending, timeout, 422, 429 and unavailable states do not emit that gesture. An ordinary neutral perch on the Brief Rail is not a receipt or a payment confirmation.

## Rendering and assets

- Original poster: `public/brand/manta.webp` (retained).
- New pose atlas: `public/brand/manta-poses-v2.webp`, 960×640, six 320×320 cells, 77,310 bytes.
- Source: `design/manta/pose-atlas-source.png`, generated from the approved poster and storyboard with the built-in ImageGen tool. Prompts: `manta-asset-prompt.md`.
- Pose order: reveal, ready, explore / brief, attention, neutral perch.
- Eye masks for the single intro blink follow the ready-pose landmarks from the source atlas.
- The atlas loads only after a visible actor has mounted, and only in normal motion mode. Failed loading keeps the original poster and all site controls functional.

This is a pre-rendered 2D animation implementation with real UI choreography. It is not represented as a production GLB, a rig or frame-perfect reproduction of an unavailable 3D animation.

## Verification

The domain tests cover event mapping, repeated-action replacement, durations, receipt gating, preference priority, the 800 ms reveal and the 180 KiB companion asset/source budget. Assets plus the gzip-compressed companion source total 118,007 bytes against the 184,320-byte budget. This conservative source calculation is separate from the site's initial JavaScript audit. The full unit/API suite now contains 40 passing tests.

Live browser checks confirmed the lift phase with a measured negative edge translation within 12 px, the return to ready, the separate Explore pose, a brief gesture and impulse after an actual selection, one visible actor, a 40 px mobile rail perch, the attention pose on a real product validation error, reduced-mode poster fallback, and complete hide/show. The intro did not replay when returning to the top after a brief selection.

The final production home passed ten viewport checks from 320 to 1920 px with no page-width overflow or overlap of the painted character and protected text/actions. Form instances measured 40 px on mobile and 64 px on desktop; receipt instances measured 44/64 px. The market header was also inspected at seven widths. Results are in `manta-verification.json`, and screenshots are in `previews/manta-*-v2.jpg`.

A synthetic enquiry was accepted through the real browser form on a separate local production server with a temporary database. The receipt actor was observed in `enquiry_received`, pose 5, with the 420 ms received animation, then returned to ready. Exactly one enquiry and one pending outbox record were stored; no delivery worker ran and no external delivery occurred. The temporary server and database were removed after checking. The default preview keeps public submission disabled.

That full-flow check also found a pre-existing origin check that compared Next.js's normalized internal hostname with the browser's public hostname. JSON and native form transports now verify the actual HTTP Host while rejecting foreign origins, mismatched ports/protocols and malformed hosts. The native redirect preserves the verified public origin. An integration regression case covers this path. Receipt heading line breaks were corrected during the same check.

The final production build, TypeScript/content validation and 46/46 HTTP route checks passed. Initial modern JavaScript is 171.4 KiB gzip and CSS is 15.8 KiB gzip. The existing 130 KiB initial-JavaScript target remains unmet; the new atlas is loaded separately after a visible actor mounts.

Additional Playwright cases are included in `tests/e2e/manta.spec.ts`. As with the original delivery, those separate CLI browser cases are provided for repeatable future runs; the live browser checks in this session use the desktop browser tools.
