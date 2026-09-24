# ErmaJean — update plan

## Recommended sequence

Repair the dinner journey and its trust boundaries, establish a reliable release baseline, then ship the new experience. Keep the existing backend/client architecture. Each task should become one logical commit/PR; do not mix a framework migration with a visual rewrite.

Estimates below are planning ranges, not commitments: approximately 8–12 calendar weeks for one experienced full-stack engineer with part-time design/QA and backend access, with overlap where practical. Native release/store review and major dependency migrations may extend this. Re-estimate after Phase 0 and the database-policy review. The first useful release is a smaller reliable ingredient → dinner → save flow, not every future feature.

| Phase | Indicative effort | Work and dependencies | Exit criterion |
|---|---|---|---|
| 0 · Contain exposure | 2–4 engineer days | F01–04: protect paid AI work, session details, inbound mail; inspect live RLS/entitlement write permissions | Anonymous and cross-user attempts rejected in staging; no model call before authorization; owner-controlled mail routes |
| 1 · Make releases trustworthy | 4–8 days, migration uncertainty additional | F05/F15/F18: isolate TS/lint projects, automated checks, staging, prioritize vulnerable dependencies, establish native build baseline | Fresh clone installs/builds/tests without prompts; documented environment config; installable device preview |
| 2 · Repair core journeys | 8–12 days | F06–14/F16: shared AI contract, bearer auth, exact tier mapping, atomic quota/save, recovery, publication, servings/math, parser, billing and meal replacement | Staging tests pass across both clients and two user identities; no result loss or silent errors |
| 3 · Brand and interaction foundation | 3–5 design/engineering days; overlaps 1–2 | Finalize ErmaJean avatar, semantic tokens, responsive shell, accessible components and copy | Key screens reviewed at phone/tablet/desktop sizes; avatar legible at 32/48px; controls pass accessibility checks |
| 4 · Ship dinner assistance and cooking | 7–10 days | Kitchen ingredient flow, draft review/save, recipe box/detail, cooking mode; depends on Phases 0–3 | New user finds and saves a usable dinner without a tutorial; draft is recoverable after interruption |
| 5 · Plan, shop and useful nutrition | 6–10 days | Flexible week with leftovers, durable shopping list, optional macro goals and honest estimates | Plan changes update a persistent list; missing nutrition stays unknown; offline reads and retry behavior verified |
| 6 · Launch and measure | 3–5 days plus external review | Public site, pricing clarity, device/browser QA, release/store setup, staged rollout and dashboards | Critical issues closed; rollback rehearsed; core journey and cost metrics visible |

## First implementation backlog

| Order | Task | Owner role | Size | Acceptance |
|---|---|---|---|---|
| 1 | Gate generation and bound input/cost | Backend | M | Anonymous=401; exhaustion=explicit limit; concurrency cannot overrun allowance |
| 2 | Protect checkout-session details | Backend | S | Cross-user session lookup fails without disclosing email |
| 3 | Verify/disable mail webhook and replace template config | Backend/ops | S | Unsigned and replayed mail rejected; delivery only to configured ErmaJean inbox |
| 4 | Audit RLS and profile/usage write permissions | Backend | M | Anonymous/A/B CRUD matrix checked in and passing |
| 5 | Split web/mobile TS scope and configure lint/CI | Full-stack | S–M | Current web build blocker removed; no interactive lint prompts |
| 6 | Patch advisory paths and migrate supported frameworks | Full-stack | L | Advisory applicability documented; build/auth/device regression checks pass |
| 7 | Shared generation schema and mobile auth client | Full-stack | M | Same validated result and errors on both clients; native token accepted |
| 8 | Consolidate quick/full generator and durable drafts | Mobile/web | M | Result survives back/forward, retry and save |
| 9 | Centralize entitlements and Stripe reconciliation | Backend | M | Real monthly/yearly IDs match price display; unknown prices never grant unlimited |
| 10 | Repair recovery and public recipe sharing | Full-stack | M | Signed-out recipient sees published recipe; revoked link is safe; reset lands correctly |
| 11 | Correct servings, ingredient parser and stale macro cache | Full-stack | M | Explicit unit fixtures, portions and edited-ingredient invalidation pass |
| 12 | Atomic meal replacement and durable shopping state | Backend/mobile | M | Failed replacement retains old meal; checks survive restart |

S ≈ up to a day, M ≈ 2–4 days, L ≈ 5+ days. Tasks can overlap; these are not additive schedule guarantees.

## Proposed data and contract changes

- Typed generation request/result/error, entitlement response and recipe model shared between clients without sharing web UI dependencies. Server remains authoritative.
- Recipe fields: numeric base servings, structured ingredients with original source text, ordered steps, source kind, image/alt metadata, optional user notes, nutrition basis/source/time/version. Backfill safely; preserve original text during migration.
- Separate the amount cooked from the user's planned portion. A four-serving dinner does not mean one person consumed four servings.
- Meal slots: unique user/date/type or intentionally designed multi-meal model; note/leftover slots and planned portions. Atomic writes.
- Persisted shopping lists/items, source-recipe references, checked state and manual edits. Regeneration should preserve user edits where possible and explain changes.
- Sharing: explicit publication, ownership and revocation; public snapshot separate from private recipe. Avoid publishing personal notes by default.
- Generation requests: idempotency key, allowance reservation, provider status, usage reconciliation. Persist only needed operational metadata, not full sensitive prompts in logs.
- Subscription/event ledger and trusted entitlement projection. No user write access to billing fields.
- Add migrations with rollback/backfill strategy; never edit the reference-only schema as a migration.

## UX rollout slices

1. **Dinner now:** ingredient entry, time/servings/preferences, one best recommendation with two alternatives, review draft, save/cook. No mandatory meal-plan setup before value.
2. **Keep it:** recipe box, useful filters, manual recipe add, real images or honest fallback, notes, sharing and cooking checklist/timer.
3. **Make tomorrow easier:** flexible dinner-first planning, leftovers/free evenings, persistent shopping list, optional goals. No required perfect seven-day grid.
4. **Public promise:** refreshed landing page and pricing explain the real supported flows. Never market import-from-social, automatic pantry inventory or exact savings until implemented and validated.

## Release checks that matter

- Two-user authorization tests through both API and direct Supabase access.
- Generation invalid JSON, cancellation, timeouts, duplicate taps, quota concurrency and write failures.
- Recovery, OAuth and universal links in cold and warm app states.
- Free/monthly/yearly upgrade, cancellation, repeated/out-of-order Stripe events and failed writes.
- Recipe save/edit/delete/share/revoke, absent share, cross-device updates.
- Ingredient fractions/units; serving scaling; missing nutrition; edits invalidate cached estimates.
- Failed meal replacement; shopping persistence; interruption and offline retry.
- Keyboard navigation and screen readers; large text; reduce motion; phone safe areas; tablet and desktop layout.
- Native device previews and production configuration; no placeholder EAS IDs or dead routes.

## Product measurement

Establish baselines before assigning improvement targets. Proposed primary measure: **weekly users who choose a dinner and later mark it cooked**. Supporting measures: time to first usable suggestion, draft-to-save conversion, save-to-cook conversion, shopping-list reuse, week-1/week-4 retention, generation failure/latency, AI cost per successful saved recipe and paid conversion. Separate planned/cooked self-report from actual consumption; do not overclaim takeout savings.

Run 5–8 moderated sessions with audience-matched professionals/parents. Tasks: “You have chicken, rice, 20 minutes”; “swap tomorrow for leftovers”; “shop with poor reception”; “find the recipe you loved last week.” Observe completion and confusion without teaching navigation. Validate affectionate terms sparingly; a settings option can reduce personality copy if it feels intrusive.

## Deliberately deferred

Social feed, gamified diet streaks, grocery delivery integrations, AI voice chat, full pantry inventory, advanced nutrition coaching, automated social-video import, collaborative household editing, animated mascot and broad recipe marketplace. Evaluate these after a reliable daily dinner habit is demonstrated.
