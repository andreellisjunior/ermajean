# ErmaJean Mobile App - Agent Guide

## Overview

Expo SDK 54 / React Native 0.81.5 mobile app for the ErmaJean recipe platform. Uses Expo Router 6 for file-based navigation, NativeWind for Tailwind-style styling, and Supabase as the backend.

- **Bundle ID**: `com.ermajean.app` (iOS and Android)
- **Orientation**: Portrait only
- **Deep link scheme**: `ermajean://`
- **New Architecture**: Enabled
- **React Compiler**: Enabled (experimental)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 54, React Native 0.81.5, React 19.1 |
| Router | Expo Router 6 (file-based) |
| Language | TypeScript 5.9 |
| Styling | NativeWind 4.2.1 (Tailwind for RN) |
| Backend | Supabase JS SDK 2.86 |
| API Client | Axios → `https://ermajean.com/api` |
| Icons | Lucide React Native |
| Animations | React Native Reanimated 4.1, Animated API |
| Auth | Supabase Auth + expo-secure-store + expo-web-browser (OAuth) |
| Haptics | expo-haptics via `utils/haptics.ts` |

## Directory Layout

```
app/                        # Expo Router screens
├── _layout.tsx             # Root layout (Stack nav, deep linking, notifications)
├── index.tsx               # Auth gate → redirects to sign-in or (tabs)
├── (auth)/sign-in.tsx      # Email/password + Google OAuth sign-in
├── auth/callback.tsx       # OAuth deep link callback handler
├── (tabs)/
│   ├── _layout.tsx         # Tab bar (3 visible: Recipes, Meal Plans, Profile)
│   ├── index.tsx           # Recipes feed (home screen)
│   ├── meal-plans.tsx      # Weekly meal planning
│   ├── profile.tsx         # Profile, macro goals, settings, upgrade CTA
│   └── generate.tsx        # AI recipe generation (hidden tab, accessed via nav)
├── recipe/[id].tsx         # Recipe detail view
└── generate-modal.tsx      # Quick AI generation modal

components/                 # Reusable UI components
├── animated/               # AnimatedCard, FadeInView, StaggeredList
├── ui/                     # Low-level primitives (collapsible, icon-symbol)
├── Button.tsx              # Primary button component
├── Input.tsx               # Form input with icon support
├── GoalsFormModal.tsx      # Macro goals editor modal
├── RecipeFormModal.tsx     # Manual recipe creation modal
├── RecipeSelectionModal.tsx # Recipe picker for meal plans
├── ShoppingListModal.tsx   # Shopping list from meal plan
├── MacroCounter.tsx        # Nutrition progress rings
├── MealSlot.tsx            # Individual meal slot in plan
└── AddRecipeFAB.tsx        # Floating action button

services/                   # Data access layer (direct Supabase queries)
├── recipeService.ts        # Recipe CRUD
├── mealPlanService.ts      # Meal plan CRUD
└── profileService.ts       # Profile and macro goals

libs/                       # Core infrastructure
├── supabase.ts             # Supabase client with SecureStore adapter
├── api.ts                  # Axios client → ermajean.com/api (401/403 interceptors)
└── notifications.ts        # Push notification registration

utils/                      # Utility functions
├── haptics.ts              # Haptic feedback (Haptic.buttonPress, .success, etc.)
├── dateUtils.ts            # Date formatting for meal plans
├── macroCalculations.ts    # Nutrition math
├── recipeSearch.ts         # Client-side recipe search/filter
├── shoppingListUtils.ts    # Shopping list generation from ingredients
└── validation.ts           # Input validation helpers

constants/
├── design.ts               # Full design system: Colors, Spacing, Typography, Shadows, etc.
└── theme.ts                # Theme constants (font families)

types/config.ts             # TypeScript interfaces: Recipe, Profile, MealPlan, MacroGoals, etc.
config.ts                   # App config: Stripe plans, pricing, auth URLs
```

## Key Patterns

### Styling
Mix of NativeWind `className` and inline `style` props. Use NativeWind for layout, colors, and sizing. Use inline `style` for shadows (NativeWind shadow support is limited in RN). Import shadow presets from `constants/design.ts` when possible.

**Background color**: `#FDFBF7` (creamy beige) — applied via `bg-[#FDFBF7]` on screen roots.

**Color palette**:
- Primary: emerald-800 (`#065f46`) for active states, CTAs
- Inactive: stone-400 (`#a8a29e`)
- Text: stone-800 (`#292524`) for headings, stone-500 (`#78716c`) for secondary
- Cards: white with stone-100 borders and `Shadows.md` or `Shadows.lg`

### Haptics
Always use `Haptic.*` from `utils/haptics.ts`. Common usage:
- `Haptic.buttonPress()` — taps and button presses
- `Haptic.success()` — completed actions (save, delete)
- `Haptic.error()` — failed operations
- `Haptic.cardTap()` — card/list item presses
- `Haptic.refresh()` — pull-to-refresh
- `Haptic.selection()` — picker/selector changes
- `Haptic.modal()` — modal open/close

### Data Fetching
- **Read operations**: Direct Supabase queries in `services/` files. Each service function checks auth internally via `supabase.auth.getUser()`.
- **Server-side operations** (AI generation, Stripe): Use the API client in `libs/api.ts` which calls `https://ermajean.com/api`.
- **No global state management library** — auth state via Supabase `onAuthStateChange` listener, screen data via `useState` + `useEffect`.

### Navigation
- `router.push('/recipe/[id]')` for forward navigation
- `router.replace('/(tabs)')` for auth redirects (no back stack)
- Deep linking: `ermajean://recipe/:id` and `https://ermajean.com/recipe/:id`
- Hidden tabs use `href: null` in tab layout options

### Auth Flow
1. `app/index.tsx` checks Supabase session on mount
2. No session → redirect to `/(auth)/sign-in`
3. Email sign-in: `supabase.auth.signInWithPassword()`
4. Google OAuth: `expo-web-browser` opens Supabase OAuth URL → callback at `auth/callback.tsx` extracts tokens
5. Tokens stored in `expo-secure-store` via custom adapter in `libs/supabase.ts`

### Error Handling
- Try/catch with `console.error` + `Alert.alert` for user-facing errors
- API interceptor in `libs/api.ts` handles 401 (redirect to sign-in) and 403 (plan upgrade needed)
- Services throw descriptive errors: `new Error('Failed to fetch recipes: ...')`

### Components
- Screen components live in `app/`, reusable components in `components/`
- Screens fetch their own data in `useEffect`
- Modals use `visible` + `onClose` + `onSave` prop pattern
- Buttons accept `fullWidth`, `variant` ("primary" | "secondary"), `disabled`, `onClick` props

## Git Workflow

- **Always create atomic commits.** Each commit must contain exactly one logical change — a single feature, fix, refactor, or configuration update. Never bundle unrelated changes into a single commit.
- Prefix commit messages with `mobile:` (e.g., `mobile: add haptic feedback to meal plan actions`).
- Write lowercase commit messages in imperative mood. Explain the "why" not just the "what" when possible.
- Never commit `.env` files, credentials, or API keys.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `EXPO_PUBLIC_DEV_BYPASS_AUTH` | **Dev only** — set `true` to skip auth. Must be `false`/absent in production |

## Gotchas

- Recipe images currently use a single placeholder (`assets/images/menu.jpg`) — all recipe cards show the same image
- The `libs/supabase.ts` has a TODO comment about env vars but they're correctly loaded from `.env.local`
- `ingredients` and `instructions` on recipes are stored as single text strings (not arrays)
- Push notifications require a development build — they don't work in Expo Go (SDK 53+)
- The API client base URL is hardcoded to `https://ermajean.com/api` — no staging environment
- NativeWind `className` and `style` can conflict; prefer `style` for shadow properties
- The `Fonts` export in `constants/theme.ts` references system fonts — no custom font loading needed
