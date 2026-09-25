# ErmaJean - Agent Guide

## Project Overview

ErmaJean is a recipe management SaaS. Users create, save, and share recipes with AI-powered generation, meal planning, and nutrition tracking. The product has two clients and a shared backend:

- **Web app** (root directory): Next.js 16 with App Router, deployed on Vercel at ermajean.com
- **Mobile app** (`_mobile/ErmaJean/`): Expo SDK 57 / React Native — see its own AGENTS.md for mobile-specific guidance
- **Backend**: Supabase (PostgreSQL, Auth, Realtime) — shared by both clients
- **Payments**: Stripe (Free / Monthly $11.99 / Yearly $99)

## Directory Structure

```
/                           # Next.js web application
├── app/                    # App Router pages and API routes
│   ├── (auth-pages)/       # Auth screens (sign-in, sign-up, forgot-password)
│   ├── (dashboard)/        # Dashboard pages (private, requires auth)
│   ├── (home)/             # Public landing pages
│   ├── (share)/            # Public recipe sharing pages
│   ├── api/                # API routes (see below)
│   └── actions.ts          # Server actions (auth, recipe CRUD)
├── components/             # React components (web-only)
├── contexts/               # React contexts (UpgradeModalContext)
├── hooks/                  # Custom hooks (useMacros, useUpgradeModal)
├── libs/                   # Shared utilities
│   ├── supabase/           # Supabase client (client.ts, server.ts, middleware.ts)
│   ├── supabase/db-schema.sql  # Database schema reference (READ-ONLY)
│   ├── api.ts              # Axios API client
│   ├── stripe.ts           # Stripe helpers
│   └── gpt.ts              # OpenAI helpers
├── types/                  # TypeScript type definitions
├── config.ts               # App configuration (Stripe plans, auth URLs, domain)
├── middleware.ts            # Next.js middleware (auth session refresh)
└── _mobile/ErmaJean/       # Mobile app (separate AGENTS.md)
```

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/generate-recipe` | POST | AI recipe generation (OpenAI; defaults in `libs/ai/models.ts`). Called by both web and mobile |
| `/api/recipes` | GET/POST/DELETE | Recipe CRUD |
| `/api/recipes/macros` | POST | Calculate nutritional macros for a recipe |
| `/api/notes` | GET/POST | Recipe notes CRUD |
| `/api/user` | GET | User profile data |
| `/api/auth/callback` | POST | OAuth callback handler |
| `/api/stripe/create-checkout` | POST | Create Stripe checkout session |
| `/api/stripe/create-portal` | POST | Create Stripe customer portal |
| `/api/webhook/stripe` | POST | Stripe webhook handler |
| `/api/webhook/mailgun` | POST | Mailgun webhook handler |

## Architecture

- The mobile app calls the web API at `https://ermajean.com/api` via axios for server-side operations (AI generation, Stripe). See `_mobile/ErmaJean/libs/api.ts`.
- For direct data access (recipes, meal plans, profiles), the mobile app queries Supabase directly via the JS SDK. See `_mobile/ErmaJean/services/`.
- Both clients share the same Supabase project, database, and auth system.
- Web uses `@supabase/ssr` for server-side auth; mobile uses `@supabase/supabase-js` with `expo-secure-store`.

## Database Tables

Reference: `libs/supabase/db-schema.sql` (read-only, do not modify this file)

| Table | Purpose |
|-------|---------|
| `profiles` | User profile, macro goals, subscription status (`has_access`, `customer_id`, `price_id`) |
| `recipes` | User recipes (manual + AI-generated). Key fields: `ingredients`, `instructions` (text), nutrition columns |
| `share_recipes` | Publicly shared recipe copies |
| `meal_plans` | Meal assignments: `user_id`, `recipe_id`, `date`, `meal_type` (Breakfast/Lunch/Dinner) |
| `notes` | Recipe notes |
| `recipe_usage` | AI generation usage tracking (source: "free" or "premium") |

## Conventions

- **Language**: TypeScript throughout
- **Styling**: Tailwind CSS — DaisyUI on web, NativeWind on mobile
- **Routing**: File-based — Next.js App Router (web), Expo Router (mobile)
- **Env vars**: Web uses `NEXT_PUBLIC_` prefix, mobile uses `EXPO_PUBLIC_` prefix
- **Auth gating**: `profiles.has_access` boolean controls premium features
- **Stripe price IDs**: Hardcoded in `config.ts` — must match Stripe dashboard exactly

## Git Workflow

- **Always create atomic commits.** Each commit must contain exactly one logical change — a single feature, fix, refactor, or configuration update. Never bundle unrelated changes into a single commit.
- Write lowercase commit messages. Prefix mobile changes with `mobile:` (e.g., `mobile: wire forgot password with Supabase reset`).
- Keep messages concise (imperative mood, explain the "why" not the "what" when possible).
- Never commit `.env` files, credentials, or API keys.

## Constraints

- `libs/supabase/db-schema.sql` is reference-only. Never modify it directly; use Supabase migrations.
- The `config.ts` at root (web) imports DaisyUI theme types. The mobile `config.ts` is a simpler standalone copy.
- Server actions in `app/actions.ts` handle both auth and recipe operations — keep them grouped logically.
- Stripe webhooks must be verified with `STRIPE_WEBHOOK_SECRET` before processing.

## Human-facing reports and checklists

- Deliver audits, implementation reports, plans, release checklists, and handoff summaries as **ErmaJean-branded HTML files by default**, unless the user explicitly requests another format. Markdown alone is not the human-facing deliverable. This applies to web, mobile, and backend work.
- Save each report at `docs/<topic-or-date>/index.html`. Use `docs/backend-2026-09-24/index.html` as the reference for brand and information hierarchy; adapt the layout to the report instead of copying obsolete facts or metrics.
- Match the approved brand: cream `#F7F3E8`, forest green `#244638`, tomato `#B84732`, sage `#DEE6D8`, butter `#EADBA7`; Fraunces headings and DM Sans body text. Reuse the local fonts in `docs/report-assets/` (retain their licenses) and existing approved ErmaJean artwork. Use warm, plain language while keeping technical findings precise.
- Lead with the outcome, report date, scope, and current status. Clearly distinguish implemented, locally tested, staging-verified, and deployed work. Never imply that a checklist checkmark or a passing local test proves production readiness.
- Make reports easy to scan: concise summaries, meaningful headings, descriptive status labels, prioritized next steps, and expandable technical evidence. Preserve material findings, caveats, source links, exact commands, and validation evidence; do not hide unresolved work behind a polished summary.
- Include responsive layouts, semantic HTML, accessible contrast, visible keyboard focus, and useful print/PDF styling. Avoid horizontal page overflow on phones; allow code blocks to scroll. Prefer static HTML/CSS and minimal JavaScript, with no build step, external analytics, or remote runtime dependencies.
- If interactive checklists are useful, label any browser-local persistence explicitly as personal progress, provide a reset control, and keep deployment status separate. Handle unavailable browser storage gracefully. Never execute operational commands from report controls.
- Keep supporting Markdown/logs when useful, but link to them from the HTML and keep factual content aligned. For sharing outside the repository, bundle required relative assets or embed them so the delivered page remains usable.
- Before delivery, open the report in a browser, inspect desktop and narrow layouts, check links/assets, and exercise any interactive controls and print layout. Link to the HTML as the primary final deliverable and open its preview in Codex when available.

## AI model changes

- Review current official OpenAI model and migration documentation before recommending or changing models. Record the review date, alternatives, workload fit, request compatibility, and published pricing in the branded report. Do not retain an older default without evaluating current options.
- Keep server model defaults centralized in `libs/ai/models.ts`; document deployment environment overrides. Preserve strict schemas, validation, timeouts, quotas, and idempotency when migrating.
- Distinguish documentation-based selection and mocked contract tests from live quality/cost/latency evaluation. Never describe an untested model as benchmarked or production-verified.
