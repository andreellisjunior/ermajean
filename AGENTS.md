# ErmaJean - Agent Guide

## Project Overview

ErmaJean is a recipe management SaaS. Users create, save, and share recipes with AI-powered generation, meal planning, and nutrition tracking. The product has two clients and a shared backend:

- **Web app** (root directory): Next.js 14 with App Router, deployed on Vercel at ermajean.com
- **Mobile app** (`_mobile/ErmaJean/`): Expo SDK 54 / React Native — see its own AGENTS.md for mobile-specific guidance
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
| `/api/generate-recipe` | POST | AI recipe generation (OpenAI GPT-4 mini). Called by both web and mobile |
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

## Constraints

- `libs/supabase/db-schema.sql` is reference-only. Never modify it directly; use Supabase migrations.
- The `config.ts` at root (web) imports DaisyUI theme types. The mobile `config.ts` is a simpler standalone copy.
- Server actions in `app/actions.ts` handle both auth and recipe operations — keep them grouped logically.
- Stripe webhooks must be verified with `STRIPE_WEBHOOK_SECRET` before processing.
