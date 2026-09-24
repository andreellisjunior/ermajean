# Frontend completion pass

Branch: `codex/redesign`. Follow-up to the implementation report, September 24, 2026.

## Implemented

- Secondary website surfaces: recipe collection, download confirmation, shared recipes, checkout confirmation/failure/loading, password reset, Terms, Privacy, branded errors and a real unmatched-route 404.
- Legal prose preserved exactly; shared recipes now handle missing/unavailable data without dereferencing a null record and provide a retry link. Unknown recipe photos use a clearly explained placeholder.
- Web dialogs: recipe creation, editing, notes, profile, nutrition goals, subscription, upgrade and deletion. Shared oat panels, Fraunces headings, DM Sans forms, labeled inputs, tomato actions and visible validation/pending/retry states.
- Web dialogs use Headless UI focus management, Escape dismissal and focus return, viewport-bounded scrolling and accessible close buttons. Global focus rings and reduced-motion handling replace the unused purple spinner CSS that collided with generic container layouts.
- Account forms expose pending states and disable duplicate submission; sign-in errors stay visible. Newsletter failures retain the address and allow retry. Error pages no longer link to the starter-template support address.
- Mobile sheets: recipe editor, goals, recipe picker, upgrade and dietary preferences. Safe-area and keyboard-aware layouts, 48px actions, wrapping content, announced validation and retained drafts. Loading and authentication callback failures use branded recovery screens. Selection controls expose checked state.

## Checked

- Final Next production build, sitemap generation, TypeScript and lint pass; lint retains warnings in legacy components.
- Browser checks at 320px: download form has no horizontal overflow and has associated labels; password reset, recipe choice/create/edit, profile/goals, notes, 404 and checkout failure render with the new design.
- Escape closes the recipe dialog and restores focus to Add recipe. The accessibility tree exposes named inputs and dialog headings.
- Route checks: Terms, Privacy, checkout, recipe collection and thank-you render; unknown paths return HTTP 404 with branded content. An unavailable shared recipe renders its recoverable state.
- Root independently confirmed mobile radio checked states and that an open sheet isolates the accessibility tree from the background.
- Mobile browser checks at 390×844: recipe sheet, validation, goals (invalid negative input preserves draft), preferences, picker long titles and no-match search. All 38 mobile tests pass, including new goal validation/save-failure cases; mobile TypeScript and lint pass.
- The approved mockups remain the reference for typography, colors, avatar placement, card shape, spacing and navigation. Secondary states extend that system, with no claims that illustrative food photography belongs to a user's saved recipe.

## Native verification blocker

An iOS 26.5 simulator runtime was booted and official Expo Go 54.0.7 installed. The installed Xcode has no `Developer/Applications/Simulator.app`; searches under `/Applications` and `/Library/Developer` found no alternate Simulator app. Expo's iOS launch reports that it cannot determine the Simulator app ID. A headless launch reaches an OS “Open in Expo Go?” dialog, but there is no available simulator UI surface to interact with it.

Consequently, actual iOS/Android keyboard behavior, large-text layout and VoiceOver/TalkBack journeys are **not verified**. The code includes the relevant safe-area, keyboard, labels, selected states, focus and touch-target handling; runtime verification needs a working Simulator installation or physical device. Browser accessibility-tree checks are not a substitute for those native checks.

Live Supabase, AI, nutrition, recovery callbacks and Stripe integration remain the separate backend release gates documented in the audit. No production data or deployment was changed during this pass.
