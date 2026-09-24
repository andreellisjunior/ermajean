# ErmaJean redesign implementation

Branch: `codex/redesign`. The approved v2 mobile and web boards in `docs/audit-2026-09-21/design/` are the design reference. No deployment or production-data changes were performed.

## Delivered

- Public website: editorial hero, original ErmaJean cutout, ingredient preview, recipe/plan feature stories, nutrition positioning, current configured prices, responsive navigation and account links.
- Web account entry: shared typography, palette, character and simpler sign-in/recovery forms. Successful password sign-in explicitly navigates to Kitchen.
- Web workspace: Kitchen, recipe library/detail, cooking steps, weekly planner, shopping list and existing recipe settings/notes. Desktop sidebar becomes bottom navigation on narrow screens.
- Mobile: Kitchen / Recipes / Plan / Shop tabs, pushed profile, ingredient-first generation and result selection, recipe detail/edit/notes, cooking mode, auth and nutrition goals.
- Shared generated character and food assets, Fraunces and DM Sans, oat/collard/tomato/sage/butter palette. Web imagery uses Next image optimization; mobile fonts are bundled.
- Existing recipe records without photos show honest placeholders. Food photography is illustrative marketing or explicitly labeled preview content, not fabricated user recipe imagery.
- Root TypeScript excludes the independently configured mobile app. Root lint now runs noninteractively. Sitemap uses ermajean.com and excludes private routes/previews.

## Review locally

Website: `http://localhost:3000/`.

Web fixtures: `/design-preview/kitchen`, `/design-preview/recipes`, `/design-preview/recipe`, `/design-preview/plan`, `/design-preview/shop`. Each is visibly labeled, isolated from account writes, and marked noindex. Fixture changes remain in memory.

Mobile Expo web preview: `http://localhost:8082/`. Start with `EXPO_PUBLIC_DESIGN_PREVIEW=true npx expo start --web --port 8082` from `_mobile/ErmaJean`. Fixtures require both development mode and the explicit flag. See that client's `REDESIGN.md`.

The current local web server uses process-only placeholder provider settings because the checkout has no configured Supabase/OpenAI/Stripe credentials. These placeholders are not usable credentials. The preview demonstrates the design and local interaction states; live integrations require a configured development environment.

## Validation completed, September 24, 2026

- Final Next production build and sitemap generation passed with placeholder environment settings. No provider API execution was tested.
- Root lint passed with warnings in existing components. Mobile TypeScript and lint passed; mobile lint retains 12 warnings. All 35 existing mobile service tests passed.
- Browser visual review: public desktop at 1440px and phone at 390px; responsive web Kitchen at 390px; desktop Plan and recipe detail; mobile Kitchen, Recipes, recipe detail, cooking, Plan, Shop and ingredient entry at 390px.
- Verified mobile cooking Next advances the displayed step; grocery checkoff moves an item from To buy to Got it; desktop Tuesday meal assignment updates the day card and shopping list count.
- Final refinements corrected mobile week-navigation wrapping, added plan thumbnails, tightened phone website header, optimized image delivery, and removed mismatched fixture photography.

## Release boundaries

This implements the design; it does not close every backend/security finding in the earlier audit. Native device testing (iOS/Android), large-text/screen-reader checks, live sign-in/recovery, recipe writes, AI generation, nutrition and subscription journeys remain release gates in a configured environment.

The existing native nutrition API integration still requires bearer-token support server-side; the current endpoint expects cookies. Other earlier audit concerns, including generation quotas, entitlement consistency and recovery callbacks, remain tracked in the audit roadmap. Do not treat a successful UI build as verification of those integrations.

Shopping checkoffs/manual mobile items persist on the device, not across devices. Web shopping keeps original ingredient quantities per meal to avoid unsafe unit aggregation. Cooking timer requires the screen to remain open and does not promise a background alarm. Favorites, notification preferences and serving rescaling are not presented as completed backend capabilities.
