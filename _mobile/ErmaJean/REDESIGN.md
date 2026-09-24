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

## Secondary frontend completion — September 24

Recipe create/edit, goals and keeper selection now use one shared safe-area sheet with Fraunces/DM Sans, 48pt actions, scrollable form content, keyboard avoidance, inline validation and retryable save failures. Goal fields preserve failed drafts and reject invalid values. AI quota failures open a branded plan-review prompt. Existing root loading and OAuth callback paths have branded error/retry states; the placeholder modal routes to the generator.

Profile now has working device-local dietary preferences and nutrition visibility. Dietary preferences prefill generation; nutrition visibility controls recipe estimates. Notification settings link to OS settings on native and clearly explain that reminders are not available. These settings do not claim cloud synchronization.

Browser QA performed on Expo web at 390×844: add/edit recipe form visual review and missing-field validation; goal dialog visual review and negative-protein rejection with draft preservation; dietary settings visual review; keeper selection with wrapping recipe names and search empty-state/clear recovery. Verified explicit ARIA checked state (`All`, `Easy`, `Dinner`) and that modal opening removes underlying navigation from the accessibility tree; closing restores it. Three component tests cover invalid input, failed-save draft preservation and successful save. This is browser accessibility-tree inspection, not a native screen-reader test.

Native attempt: booted iPhone 17 Pro simulator on iOS 26.5 and installed official Expo Go 54.0.7. Direct launch succeeds. Xcode's installed bundle lacks Simulator.app under Developer/Applications, and no Simulator.app was found under /Applications or /Library/Developer. Expo `--ios` cannot identify Simulator; CUA cannot open it. Opening the project leaves an iOS “Open in Expo Go?” prompt with no available Simulator UI control. Native app rendering, keyboard, dynamic type and VoiceOver journeys therefore remain unverified. Screenshot of that environment blocker was captured at `/tmp/ermajean-ios.png`. Android emulator/device is unavailable in this session.
