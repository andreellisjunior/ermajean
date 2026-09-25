# Backend and framework hardening — 24 September 2026

Implemented on `codex/redesign`. Production has NOT been migrated or deployed. Live Supabase policies, Stripe deliveries, email redirects, native binaries and paid model quality are not verified by local tests.

## Changes

| Area                                           | Implemented behavior                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authentication and ownership (F01/F02/F04/F07) | Shared verified bearer/cookie identity, no fallback from invalid bearer to cookies, bounded JSON, strict input schemas, owner filters and database RLS. Checkout-session details require ownership and omit email.                                                                                                                                                                             |
| AI generation (F01/F06/F08/F09)                | One canonical `{recipe, requestId}` response; structured output and runtime validation; authenticated server-only atomic reservations; free lifetime3, monthly8 UTC, exact yearly unlimited entitlement;10 attempts/user/hour even for yearly plans. Concurrent reservations count before spending. Successful keys replay; atomic save returns the same recipe. Legacy usage remains counted. |
| Recovery (F10)                                 | Allowlisted web redirect, native PKCE exchange on originating device, dedicated reset screen, generic account-existence response.                                                                                                                                                                                                                                                              |
| Billing (F08/F14)                              | Exact shared price catalog, unknown paid tiers fail closed, authenticated checkout/portal, signed webhooks, event deduplication and fenced customer reconciliation from current subscription state; failures return503 for Stripe retry.                                                                                                                                                       |
| Email/web templates (F03)                      | Unsafe inbound Mailgun forwarding explicitly disabled. Unconfigured legacy waitlist/ConvertKit endpoints return503 instead of accepting personal data or reporting false success. Outbound template brand addresses corrected.                                                                                                                                                                 |
| Recipes/sharing (F11)                          | Owner publication/revocation RPCs, explicit public snapshots, transactional dependent cleanup. Editing a private recipe does not silently republish it.                                                                                                                                                                                                                                        |
| Nutrition (F12)                                | Per-serving contract without second scaling; finite nonnegative validation; content edits invalidate cached estimates; quota/lease prevents duplicate parallel estimates; version check prevents saving stale results. Database constraints also protect direct mobile writes. Each planned meal currently represents one serving; a consumed-portions editor is not included.                 |
| Meal planning (F16)                            | Unique user/date/type slots, atomic replacement/move, occupied move preserves source.                                                                                                                                                                                                                                                                                                          |
| Shopping (F13)                                 | Preserved ingredient text and fraction/unit parsing; no incompatible-unit aggregation. Durable per-user/week checkmarks; native manual items persist. Shared Monday week keys and recipe-version item keys prevent checks leaking into edited recipes. Native manual additions also appear in the web list.                                                                                    |
| Release settings (F15)                         | Removed fabricated EAS IDs, corrected Android intent filters, configurable API origin, deliberate notification permission requests. Push delivery is not enabled without actual infrastructure.                                                                                                                                                                                                |
| Verification (F18)                             | CI for web/mobile checks, disposable PostgreSQL security/concurrency tests, dependency audits, environment examples and staged rollout instructions.                                                                                                                                                                                                                                           |

## Framework and model decisions

- Next.js16.3.6 / React19.2.3: async request APIs, `proxy.ts`, flat ESLint, aligned MDX, repaired malformed legacy favicon. Tailwind3/DaisyUI4 retained to preserve the accepted design. [Next16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16).
- Expo57 / React Native0.86.3 / React19.2.3: compatible Expo packages and Router imports, obsolete unused components removed. Use Node24 for CI/development. [Expo SDK57](https://expo.dev/changelog/sdk-57).
- OpenAI SDK7.23; recipe default `gpt-5-mini`, structured response schema, low reasoning,45s timeout, no automatic provider retries. Nutrition retains configurable `gpt-4o-mini` at30s. These are workload choices, not a claim that the newest flagship is required. [Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [model specification](https://developers.openai.com/api/docs/models/gpt-5-mini).
- Recipe prompt now expresses ErmaJean’s practical, warm voice, treats preferences as data, honors restrictions and avoids invented precise prices/savings or nutrition claims. Model output still needs staging quality evaluation; schema validation does not prove food/allergen correctness.
- Expo Router57 still requires a vulnerable CommonJS decoder dependency. `vendor/decode-uri-component` contains upstream0.5.0 security-fixed source with only its export converted to CommonJS; license/provenance retained. `xcode` uses tested UUID11.1.1 override. Remove overrides when upstream supplies compatible fixes. Both lockfiles audit clean locally.
- New compiler advisory lint rules remain warnings for existing async loaders/Animated refs. Lint passes with warnings; this is not a claim of zero warnings.

## Reproducible verification

```sh
npm ci
# Disposable local Postgres, never a live Supabase database:
docker run -d --name ermajean-tests -e POSTGRES_PASSWORD=local-test-only postgres:17
ERMAJEAN_TEST_POSTGRES_CONTAINER=ermajean-tests npm test
npm run lint
# Build-only values are not credentials and must not be deployed:
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=build-only npm run build
npm audit
cd _mobile/ErmaJean
npm ci
npm test -- --runInBand
npx tsc --noEmit
npm run lint
npx expo-doctor
npx expo export --platform web
npm audit
```

The database test creates and drops its own test database inside the named disposable container. Without the environment variable it explicitly skips; CI supplies the container, so CI cannot silently pass without database execution. Tests exercise real SQL RLS, cross-owner denials, billing escalation denial, published snapshots, stale nutrition, concurrent meal writes, concurrent quota reservations, replay/save idempotency, billing leases and account deletion.

## Staging rollout and production gates

1. Export deployed schema, policies, functions, grants and a backup. Restore into an isolated staging project and verify restoration. This repository reference schema cannot reveal deployed legacy functions/policies beyond the tables explicitly hardened.
2. Resolve duplicate meal slots and duplicate Stripe customer mappings before migration; migrations deliberately fail rather than discard user data. Inspect invalid historic nutrition/goals, repair deliberately, then validate the two `NOT VALID` constraints. These constraints reject new invalid writes immediately.
3. Apply `supabase/migrations/2026092401` through `2026092406` in order, each in a transaction. Do not modify `libs/supabase/db-schema.sql`. Run local checks plus staging two-user access tests before switching traffic. Inspect old public snapshots and revoke anything unintended.
4. Configure `.env.example` and mobile `.env.example` with real staging values. Service-role, OpenAI and Stripe secrets are server-only. Verify actual production prices against `libs/planUtils.ts` AND generation SQL. Audit grandfathered paid price IDs before rollout; unknown IDs intentionally receive no paid generation allowance.
5. Supabase redirect allowlist: configured website `/api/auth/callback`, web reset callback query, and native `ermajean://reset-password` / OAuth callback. Exercise fresh, expired, reused and other-device recovery links. Confirm account-creation profile trigger exists in staging.
6. Stripe test-mode deliveries: checkout success, duplicate/out-of-order events, cancellation, failed invoices, renewals and DB outage/retry. Use the supported events in `app/api/webhook/stripe/route.ts`; see `docs/billing-security.md`. SDK22 uses its default API version; inspect dashboard webhook version and test full payloads. Never acknowledge success if profile/ledger commit fails.
7. Paid AI staging evaluation: ordinary pantry dinner, empty ingredients, peanut allergy, vegan + dairy restriction, kid-friendly, rushed15-minute dinner, attempted prompt injection, refusal and invalid/truncated provider output. Compare actual results/cost/latency before enabling the chosen model. Verify live model access and spend limits. No provider calls were made in this implementation pass.
8. EAS: run `eas init` against the actual account; configure build credentials and real project ID. Publish AASA/assetlinks with real Apple team ID / Android signing fingerprints before claiming universal links work. Test native recovery, Google login, billing return, secure storage and offline retries on physical iOS/Android. Native Simulator testing remains unavailable on this host's Xcode installation.
9. Deploy backend and migrations before releasing new mobile builds. Old mobile builds need a minimum-version policy: unauthenticated generation and old response shape are intentionally no longer supported. Keep a tested DB snapshot; do not roll back security policies to restore old behavior.

## Operations and limits

- Alert on route5xx rates, Stripe retry backlog, failed generation completion, provider latency/spend and migration failures. Connect real monitoring in the deployment account; CI does not create production monitors.
- Provider calls are bounded. Abandoned generation reservations expire after2minutes when the user next requests generation. Failed keys remain terminal; use a fresh key only for a confirmed failure, retain the key after ambiguous network timeouts. The hourly cap includes failed attempts. Failed provider calls may still incur provider cost; failed database writes do not return an unrecorded result.
- Save retries reuse the successful request ID; deleting a recipe does not reset generation usage. Check historical `recipe_usage` source labels, especially legacy `premium`, before migrating billing expectations.
- Deletion is owner-only and blocks accounts with paid access or a linked Stripe customer, including delinquent subscriptions. Billed accounts require support-assisted billing closure before deletion; Stripe customers are not deleted by this RPC. Automated billed-account offboarding remains a release follow-up.
- Inbound email, newsletter and push delivery are deliberately unavailable until their actual configuration, abuse/consent controls and delivery infrastructure are supplied. There are no placeholder credentials that pretend these services work.
