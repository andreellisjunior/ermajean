# ErmaJean — current-state audit

Date: September 21, 2026 (America/Chicago). Local checkout: `c6ca4c3`, branch examined as found. Scope: Next.js web client, Expo mobile client, shared API, database reference, authentication, subscriptions, AI, recipe/meal/shopping flows, maintainability, release readiness, brand and UX.

## Assessment

ErmaJean has a credible feature foundation but is not ready for a confident relaunch from this checkout. The biggest gap is reliability across the complete dinner journey, followed by backend controls and release discipline. A reskin alone would leave broken recovery, generation, nutrition, and sharing flows underneath it.

Preserve the Next.js / Expo / Supabase architecture. Consolidate shared contracts and entitlements, repair the core journeys, then roll out the new brand in vertical slices. Avoid a wholesale rewrite.

### What exists

| Area | Current implementation | Assessment |
|---|---|---|
| Web | Public site, sign-in/up/recovery, recipe CRUD, generation, notes, sharing, meal planning, macros, checkout | Broad scope; build currently fails; several contract/control defects |
| Mobile | Expo SDK 54 / RN 0.81.5, auth, recipes, generator, meal planner, shopping modal, profile/macros | Substantial implementation; key flows incomplete; release setup unfinished |
| Backend | Supabase tables + direct client queries + Next.js server routes/actions | Appropriate foundation; policies and functions cannot be verified from repository |
| Payments | Stripe checkout, portal, verified webhook, free/monthly/yearly definitions | Plan recognition and webhook reconciliation need repair |
| Quality | Three mobile service test suites | 35 tests pass; no comparable web test command or checked-in CI pipeline found |
| Brand | Green/cream, family recipes, ingredient-led messaging | Some existing equity; owner's fuller personality is not yet expressed consistently |

## Method and limits

Reviewed routes, actions, service layers, schema reference, utilities, app/release configs and representative UI. Visually inspected the live public landing page and its accessibility tree. Read current first-party competitor and framework documentation. Installed both existing lockfiles with `npm ci --ignore-scripts` to establish reproducible local checks; no package manifests/lockfiles or application source were changed.

This is a repository and public-surface audit, not a completed production penetration test or device certification. No real customer data, paid AI requests, subscription changes, or production writes were used. Authenticated web/mobile end-to-end testing, deployed commit parity, actual Supabase RLS/grants/functions, backups, Stripe dashboard/webhook logs, production metrics, native device performance and store approval remain unverified. No absence of RLS in the schema reference is treated as proof that deployed RLS is absent.

## Verification results

| Check | Result | Evidence |
|---|---|---|
| Web dependency installation | Passed from existing lockfile | `evidence/web-install.log` |
| Web production build | FAILED after compilation: root TS project includes mobile files and resolves mobile `@/libs/supabase` against the web root | `evidence/web-build.log`; `tsconfig.json` broad includes/excludes |
| Web lint | Not configured for unattended execution; prompts to initialize ESLint | `evidence/web-lint.log` |
| Mobile dependency installation | Passed from existing lockfile | `evidence/mobile-install.log` |
| Mobile unit tests | PASSED: 3 suites / 35 tests | `evidence/mobile-tests.log` |
| Mobile TypeScript | PASSED after dependency restoration, with both clients installed | `evidence/mobile-types.log` |
| Expo Doctor | 16/18 checks passed; fails app schema and SDK package alignment | `evidence/mobile-doctor.log` |
| Mobile lint | FAILED: 7 errors / 47 warnings | `evidence/mobile-lint.log` |
| npm dependency audit, web | 32 findings: 1 critical, 17 high, 9 moderate, 5 low | `evidence/web-dependencies.json` |
| npm dependency audit, mobile | 49 findings: 2 critical, 23 high, 21 moderate, 3 low | `evidence/mobile-dependencies.json` |

Dependency counts cover the full locked dependency graph, including tooling; they are not counts of proven remotely exploitable app defects. Review advisory applicability and dependency paths. Do not blindly apply `npm audit fix --force`. The initial incomplete mobile installation could not run Jest; restoration resolved that environment problem and the initial type errors. It should not be reported as 35 failing tests.

### Additional verified evidence

Public read-only GET checks returned HTTP 404 for `/pricing`, `/auth/callback?type=recovery`, `/.well-known/apple-app-site-association` and `/.well-known/assetlinks.json`. Mobile profile points its upgrade CTA to `/pricing`; the actual public pricing section is `/#pricing`. These are live checks, not just absent local files. No email or payment was submitted.

Resolved lockfile versions: web Next 14.2.32, React 18.2.0, Axios 1.11.0, Supabase JS 2.56.1; mobile Expo 54.0.33, React 19.1.0, Axios 1.13.5, Supabase JS 2.96.0. Expo Doctor independently flags top-level `intentFilters` and nine SDK patch mismatches.

## Prioritized findings

P0 = immediate exposure/cost containment. P1 = before relaunch. P2 = quality and differentiation. “Confirmed” means the code or local check demonstrates the issue; production reachability may still depend on deployment configuration.

### F01 · P0 · AI endpoint spends without authenticating or enforcing quota — confirmed code

`app/api/generate-recipe/route.ts:5` calls the model with caller-supplied inputs and no authentication, quota reservation, rate limit or bounded schema. Middleware refreshes sessions but does not reject anonymous requests (`libs/supabase/middleware.ts`). Client-side gates do not protect this route. Web actions also count then generate then insert usage, so concurrent requests can race.

**Update:** verify cookie/bearer sessions on the server; enforce payload limits and supported values; atomically reserve generation allowance; rate-limit per user and IP; set a provider timeout and bounded output; return structured errors. Reconcile failed requests without charging twice. Test anonymous, over-quota, concurrent and retried requests before spending provider tokens.

### F02 · P0 · Checkout-session email disclosure — confirmed code

`app/api/stripe/session-details/route.ts:9` retrieves a session/customer with the Stripe secret and returns customer email to anyone supplying a valid session ID. It does not authenticate or verify ownership. Session IDs are unguessable but are not an authorization boundary, and can appear in return URLs.

**Update:** require a session, compare `client_reference_id`/customer ownership, and return only fields needed by the current user. Test user A cannot retrieve user B's checkout details. No real session was queried during this audit.

### F03 · P0 · Inbound email forwarding lacks signature checks and retains template recipient — confirmed code

`app/api/webhook/mailgun/route.ts:8` accepts arbitrary posted email content and sends it to `config.mailgun.forwardRepliesTo`. `config.ts` retains ShipFast sender/support/forwarding values. If Mailgun is enabled, this can misroute support content and permit unauthenticated forwarding abuse.

**Update:** disable unused forwarding or verify Mailgun signature, timestamp and replay protection; configure ErmaJean-controlled destinations; validate and sanitize fields. Test with a stub mail transport. Actual mail delivery/configuration is unverified.

### F04 · P1 · Database authorization remains a release gate — confirmed repository gap, live risk unverified

Web recipe reads/deletes, note updates/deletes and sharing often rely exclusively on RLS; examples: `app/(dashboard)/recipes/page.tsx`, `app/actions.ts:414`, `app/actions.ts:459`, `app/api/notes/route.ts:31`. Notes GET dereferences `user.id` without a null guard. The schema reference contains table structure, not policies or the `delete_user` function. Mobile direct Supabase access makes database authorization essential. Profile entitlement columns must not be writable by ordinary users merely because they own their row.

**Update:** export/review deployed policies, grants, triggers and functions into migrations; explicitly scope private server queries; test anonymous/user A/user B access for every table and RPC; restrict `has_access`, `price_id`, `customer_id` and usage writes to trusted paths. Verify share revocation, account deletion and storage policies. Add indexes and constraints based on measured queries. Do not modify `db-schema.sql`.

### F05 · P1 · Web build and tooling boundaries are broken — reproduced

Root `tsconfig.json` includes all nested TS/TSX and excludes only `node_modules`. `next build` reaches the mobile client and fails on its alias. Root ESLint dependency does not come with an active config. Next/MDX/ESLint major versions are inconsistent (Next 14 vs integration packages on 13). The build also warns about Supabase Node APIs in middleware's Edge runtime.

**Update:** isolate web/mobile TS and lint boundaries, add scripts and CI for both, remove stale unused template dependencies, and align framework packages. Next 14 is listed as unsupported in the current [Next.js support policy](https://nextjs.org/support-policy); target a supported stable major with auth/caching/route migration tests. Upgrade Expo incrementally per [Expo guidance](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/), checking NativeWind/Reanimated/native builds each step.

### F06 · P1 · AI contract mismatch can break generation — confirmed code

`libs/openai.ts` asks for one JSON recipe object; web actions consume one object; `app/api/generate-recipe/route.ts:29` calls `.map()` on the parsed value as if it were an array. The same route reads the consumed request body again at line 16. There is no validated output schema. Actual generation model is `gpt-4.1-nano`, while the agent guide describes another model.

**Update:** one documented request/response schema and shared server generation service; normalize the recipe result; validate typed fields; handle invalid/empty provider output; remove the second body read; test object/array/invalid JSON fixtures without live model calls. Update docs to the deployed model contract.

### F07 · P1 · Mobile API authentication and response handling do not match the server — confirmed code

`_mobile/ErmaJean/libs/api.ts` sets no bearer token, and the server client uses cookies only. Native Supabase sessions in SecureStore do not automatically become web cookies. After auth is repaired, recipe detail still reads `response.data.calories` even though the interceptor already returns `response.data` (`app/recipe/[id].tsx:54`).

**Update:** mobile request interceptor attaches the current access token; server verifies tokens and scopes reads; define a typed unwrapped response convention; preserve error codes rather than duplicate alerts; configurable staging URL and timeouts. Test native tokens, expired sessions and a successful nutrition response.

### F08 · P1 · Paid tiers are misclassified across clients — confirmed code

`libs/planUtils.ts:20` recognizes only a test monthly ID; the real monthly constant is unused. Unknown paid prices default to unlimited. Mobile `app/(tabs)/generate.tsx` detects monthly by `price_id.includes('monthly')`, which does not match configured opaque Stripe IDs. Mobile counts an `ai_generated` recipe column absent from the supplied schema and ignores its query error.

**Update:** one server-owned tier catalog and entitlement endpoint; reject unknown paid tiers for metered operations; reconcile calendar-month vs billing-period limits explicitly; use `recipe_usage`, not guessed recipe fields. Include legacy prices deliberately. Test free/real monthly/yearly/unknown/canceled tiers on both clients.

### F09 · P1 · Quick generator discards its output — confirmed code

`_mobile/ErmaJean/app/generate-modal.tsx:41` navigates to a separate generator after a successful response without saving or passing the recipe. The destination owns independent empty state. The success message says the recipe is available when it is not.

**Update:** consolidate generators; show the draft immediately, preserve inputs/result through navigation, and save with an idempotent operation. Exercise generate → review → edit → save → reopen.

### F10 · P1 · Password recovery does not reach reset UI reliably — confirmed code; public route checked separately

Mobile sends recovery to `/auth/callback?type=recovery`, but the web callback is `/api/auth/callback`. Web recovery includes `redirect_to=/recipes/reset-password`, while that callback ignores `redirect_to` and always uses the configured `/sign-in` destination.

**Update:** a validated allowlist of callback destinations and an explicit recovery branch; native recovery route or documented browser reset; cold/warm app-link tests, expired link feedback, and post-reset session behavior. Do not infer success from the email-send response.

### F11 · P1 · Mobile sharing skips publication; absent shares can crash web rendering — confirmed code

Mobile detail shares `/recipe/{id}` without creating a `share_recipes` row. Web sharing reads that separate table, then dereferences a potentially null recipe in both metadata and page rendering. The app's native detail reader queries private `recipes`, creating a second distinction for recipient deep links.

**Update:** authenticated owner-controlled publication, opaque/revocable share identifiers, recipient read model separate from private edit model, and real not-found UI/metadata. Test share from each client to a signed-out browser and a different native user. Explain that sharing makes that recipe accessible by link.

### F12 · P1 · Nutrition units and serving math disagree — confirmed code

The macro prompt requests **per-serving** values and stores them. `app/api/recipes/macros/route.ts` then multiplies by requested/original servings. If a four-serving recipe has 500 kcal per serving, requesting one yields 125, not 500. Day totals simply sum stored recipe macros; planned servings are not modeled. Ingredients can change while cached macros remain accepted. Inputs permit non-positive/non-numeric serving strings.

**Update:** define base yield, per-serving nutrition and planned/consumed servings separately; invalidate nutrition on ingredient edits; validate finite nonnegative data; show estimation/source and missing-data states. Add fixture tests for 1/2/4 portions, unknown values and edited recipes. Do not call planned meals consumed intake. This audit assesses software math, not nutritional accuracy.

### F13 · P1 · Shopping parser misreads basic unit/name pairs — reproduced locally

`_mobile/ErmaJean/utils/shoppingListUtils.ts:parseIngredient` captures a two-word unit candidate. Executing the actual function yields `2 cups flour → quantity:2, unit:'', name:'cups flour'`; `1/2 tsp salt` and `3 cloves garlic` fail similarly. This undermines aggregation. Shopping checked state lives in React state only, so it does not survive a fresh app session.

**Update:** structured ingredients plus a migration/fallback preserving original text; unit dictionary with longest valid unit matching; retain meaningful food distinctions; test fractions, metric/imperial and pluralization. Persist shopping lists/checks and offer undo and source-recipe traceability.

### F14 · P1 · Billing state can drift despite correct signature verification — confirmed code

Stripe webhook verifies raw-body signatures, which is good. However, subscription updates are ignored, some DB errors are discarded, and deletion handling catches errors then returns success. No persisted event deduplication/reconciliation is present. `/api/user` equates having a customer ID with access, so a canceled customer may still appear entitled there.

**Update:** persist processed event IDs, use idempotent entitlement transitions, check writes and retry transient failures, reconcile subscription lifecycle/price changes, and read entitlement from one authority. Use Stripe test fixtures for repeated/out-of-order events and failed writes. See [Stripe webhook guidance](https://docs.stripe.com/webhooks).

### F15 · P1 · Mobile release configuration unfinished — confirmed repository

`app.json:97` uses `https://u.expo.dev/your-project-id`; no actual EAS project ID is present there. Android intent filters are at `expo.intentFilters`, not under `expo.android`. Submission identifiers are empty. No association files were found under `public`. Notifications request permission from the root flow, but the captured token is not connected to a persistence/delivery service. A notification setting explicitly says “coming soon.”

**Update:** real EAS identity/channels and device builds, appropriate platform link config/association hosting, secrets managed in build infrastructure, real store metadata. Request notifications only after a useful reminder action. Verify current store payment/account-deletion/privacy requirements for intended storefronts before submission; no store-policy compliance conclusion is made here.

### F16 · P1 · Meal replacement is destructive before save — confirmed code

`services/mealPlanService.ts:80` deletes the existing slot before inserting the replacement. An insert/network failure loses the original plan. Concurrent actions can duplicate slots unless the live database has a suitable uniqueness constraint (unverified).

**Update:** atomic upsert or transaction with a user/date/meal-type uniqueness constraint, retaining old state on failure. Add concurrency and offline retry tests.

### F17 · P2 · UX discoverability, accessibility and consistency need a shared system

Visible mobile home renders a recipe list in ScrollView with the same `menu.jpg` image; a separate hidden recipes route already has FlatList. Desktop recipe layout is capped to `md:max-w-xl`, leaving wide screens underused. Multiple generators, repeated actions and independent alert patterns increase inconsistency. Small icon controls and sparse accessibility semantics need review; e.g. generator close is `w-8 h-8`. Mobile declares automatic appearance while many surfaces use fixed light colors. Swiping a meal to delete needs an explicit accessible alternative and undo.

**Update:** one navigation map, virtualized lists, authentic recipe media or honest illustrated fallbacks, reusable controls, full loading/empty/offline/error states, 48dp/44pt targets, semantic labels, screen-reader reading order, font scaling and reduced motion. Measure contrast in implemented tokens, not generated screenshots. Add tablet layouts because iOS currently declares tablet support.

### F18 · P2 · Operations, retention measurement and documentation lag implementation

No checked-in CI pipeline or complete web test harness found; README is minimal. Agent guide is stale about API methods/model and mobile screen structure. Several template components remain in the repository; unused ShipFast Hero/Problem content was **not** observed on the live homepage. PostHog is initialized, but this is not evidence of a defined product funnel or monitored failure rates. Logs expose recipe/request detail unnecessarily. Public marketing barely communicates meal planning/shopping or the richer brand brief.

**Update:** staging, sanitized structured logs, crash/error monitoring, AI cost/latency dashboards, runbooks, restore verification, shared event schema and release gates. Remove unused starter code only after tracing imports. Instrument dinner selected → saved → planned → shopping → cooked, without collecting raw dietary notes or ingredient text by default.

## What must be verified outside this audit

1. Deployed commit and dependency versions vs local checkout.
2. Supabase policies/grants/RPCs and cross-user negative tests; profile provisioning and delete cascades; backup restore exercise.
3. Stripe live/test price mapping, actual subscription lifecycle and reconciliation logs; mail routing and SPF/DKIM configuration.
4. Authenticated end-to-end journeys on staging, including email links and recovery, quota races and sharing.
5. Native iOS/Android builds, physical devices, app links, offline handling, accessibility, tablets and release/update rollback.
6. Actual latency, crash rate, Core Web Vitals, AI quality/cost, activation/retention and acquisition economics. No numeric performance or business baseline is invented here.

## Implementation follow-up — 24 September 2026

Backend remediation, framework upgrades, verification and remaining live-deployment gates are tracked in [the backend implementation report](../backend-2026-09-24/README.md). The original findings above remain the historical audit, not the current branch status. Local migrations/tests do not prove production configuration has changed.
