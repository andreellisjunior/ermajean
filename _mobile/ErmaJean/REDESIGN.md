# Avatar-led mobile redesign

Reference: `docs/audit-2026-09-21/design/mobile-v2-{discover,cook,plan}.png` and its review notes.

Implemented Kitchen / Recipes / Plan / Shop tabs; profile is a pushed route. Oat, collard, tomato, sage and butter palette; bundled Fraunces and DM Sans; shared portrait tips and helper card. Real recipe records use their image URL when present, otherwise an honest placeholder. Generated food photos are only used for explicitly labeled development review fixtures.

Core existing Supabase flows remain connected: read/create/edit/delete recipes and read/add recipe notes, meal assignment/removal, nutrition goals, account sign-in/signup/reset/sign-out. Generator shows unwrapped API drafts and saves an explicitly selected result. Nutrition estimation consumes the actual unwrapped response object. Sharing exports recipe text rather than a private recipe URL. Cooking mode uses existing instruction lines and a configurable timestamp-based timer; no background alarm or keep-awake promise.

Shopping is a dedicated screen generated from the selected week. Check state and manual additions persist locally, scoped to user and week. It does not claim cloud sync. Breakfast/lunch/dinner remain selectable to preserve existing plan data.

## Development review

From `_mobile/ErmaJean`:

```
EXPO_PUBLIC_DESIGN_PREVIEW=true npx expo start --web --port 8082
```

Open `/recipes`, `/(tabs)`, `/meal-plans`, `/shop`, `/profile`, `/recipe/preview-chicken`, `/cook/preview-chicken`, `/generate-modal`, `/sign-in`.

Fixtures require both `__DEV__` and the explicit env switch, display a preview label, and block recipe/plan/generation writes. No environment files are committed. Disable the flag to inspect real account behavior.

## Validation and boundaries

- TypeScript passes.
- Existing 35 service tests pass.
- Full Expo lint passes with warnings in existing animated components and effect dependencies.
- Expo web bundle starts successfully after fixing pre-existing unsupported SecureStore web access and server-side storage initialization.
- Native iOS/Android device checks, large text, screen reader, authenticated backend and store purchase flows still require real device/account validation.
- Server nutrition endpoint uses cookie auth; live native API compatibility is an existing backend concern. The UI handles failure and retry.
- Avatar and food assets are supplied separately with provenance in the shared redesign asset notes.
- Favorites, rich note editing, serving rescaling and notification preference controls are not fabricated: the current backend has no corresponding complete flow in this client. Nutrition values are labeled estimates with serving-basis caveat.
