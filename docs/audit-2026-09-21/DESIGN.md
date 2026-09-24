# ErmaJean — “We got food at home”

## Design decision

Build a practical kitchen companion with the confidence and warmth of a cool aunt. The audience is busy professionals and parents, roughly 22–42, with dinner decision fatigue. They want satisfying food, useful nutrition and fewer takeout nights without a second job managing meals. These audience/personality details come directly from the owner during this audit, not inferred market research.

**Promise:** Turn what you have into a dinner you actually want.

**Emotional outcome:** “Dinner is handled. I can get on with my evening.”

The first exploratory recipe-box board was superseded after the owner's brief. The final direction is bolder, more conversational and more practical. Recipe collecting remains a useful destination; resolving tonight's dinner becomes the front door.

## Market context and differentiation hypothesis

[Paprika](https://www.paprikaapp.com/) already provides recipe organization, web import, meal planning, shopping aggregation and cooking utilities. [Samsung Food](https://samsungfood.com/) already spans recipe saving, planning, shopping and nutrition. [Mealime](https://www.mealime.com/) emphasizes an easy plan → shop → cook sequence; its current homepage also announces an October 21, 2026 shutdown, so do not treat it as an unchanged long-term competitor or assume its future offering.

ErmaJean's opportunity is a coherent **ingredient-first, low-decision dinner experience with a memorable mentor personality**. This is a positioning hypothesis, not proof that no competitor can offer it. The avatar alone is not a defensible advantage; reliable suggestions, practical substitutions, fewer taps and repeatable good dinners must deliver the promise. Validate with audience interviews and task-based usability sessions.

## Visual system

| Token | Value | Role |
|---|---|---|
| Oat | `#F7F3E8` | Main light canvas |
| Collard | `#244638` | Text, navigation and primary completion actions |
| Tomato | `#B84732` | Dinner discovery CTA and small signature accents |
| Butter | `#EADBA7` | Helpful tips and gentle emphasis |
| Sage | `#DEE6D8` | Ingredient/helper surfaces |
| Ink | `#252A24` | Body copy |
| Muted ink | `#596054` | Secondary labels, subject to contrast check |
| Denim | `#4E7897` | Character clothing/accent, not an additional primary button color |

Use expressive rounded editorial serif headlines with a sturdy sans UI. Proposed implementation exploration: Fraunces display + DM Sans body, loaded/subset deliberately with system fallbacks. Generated lettering is a visual reference, not an exact font asset. Keep brand titles to one or two short lines on phones; the larger image headlines are art direction, not fixed pixel measurements.

Phone body text starts at 16; labels 12–14 only where nonessential; cooking steps 20–24. Spacing scale 4/8/12/16/24/32/48. Cards radius 16, controls 12, chips fully rounded. Thin visible borders, minimal shadow; restrained wavy underline is the repeatable brand mark. Food imagery should be vivid, ordinary and appetizing, with honest category fallback artwork when a real dish photo is unavailable. Do not reuse the same dish photo for every recipe or imply a generated photo documents the user's actual meal.

Image boards show a proposed wordmark. Preserve recognition of the existing identity while validating the refreshed lettering; this is not a finalized logo production package.

Calculated solid-color contrast: Collard/Oat 9.43:1, Tomato/Oat 4.75:1, Ink/Oat 13.20:1, Muted ink/Oat 5.87:1, White/Tomato 5.27:1. These token pairs pass 4.5:1 for normal text; opacity, photo overlays and generated image colors still need implementation checks.

## ErmaJean avatar system

The owner supplied the reference: dark curly bun, leopard scarf, hoop earrings, denim apron, wooden spoon and confident smile. The generated board develops that into one consistent mature character, approximately 40–48, with three friendly expressions. Maintain face shape, skin tone, scarf, hair and outfit across all future assets.

| Use | Treatment | Behavior |
|---|---|---|
| Onboarding/landing | Waist-up illustration, roughly 180–320px | Welcomes and demonstrates purpose; never obscures CTA |
| Kitchen suggestion | 48–64px portrait with name “ErmaJean” | Introduces a useful suggestion; opens ingredient workflow, not an unbuilt free-form chat |
| Recipe tip | 32–40px portrait + small card | One practical substitution/shortcut; dismissible if repeated |
| Empty recipe box | 96–144px portrait | “Let’s get your first keeper in here.” + Add recipe |
| Thinking | Small thoughtful portrait | Real loading status, elapsed delay feedback, cancel/retry; no endless animation |
| Saved/cooked | Small pleased portrait | “You did that.” briefly, only after confirmed success |
| Error | Calm neutral expression | Explain what failed and how to recover; no teasing during failure |

At 32px, simplify to face/hair/scarf silhouette; the generated detailed sheet still requires dedicated small-size asset production and testing. No spoon in tiny circular crops. ErmaJean is separate from the user's avatar: user profile uses initials/photo and an accessible “Your account” label. Character label should identify an AI kitchen assistant where relevant, not imply a live human, clinician or dietitian.

The current avatar board is a concept sheet, not a transparent, cut-out, production-ready sprite asset. Next asset pass: master portrait, transparent waist-up PNG/WebP, 32/48/64/128px portrait variants, expression variants and monochrome fallback, each checked at actual size. No autonomous audio or mascot animation in the initial scope.

## Voice rules

Short, grounded, capable. Help first; personality second. One playful line per task state is enough. “Sugar,” “hon” and “boss” are occasional color, not every label. Avoid performed dialect or turning the character into a stereotype. Straightforward transactional copy for money, account deletion, permissions and errors.

| Moment | Proposed copy |
|---|---|
| Home | “We got food at home.” / “Let’s make something good.” |
| Ingredient entry | “What are we working with?” |
| Recommendation | “Tonight, handled.” |
| Week planner | “This week, loosely.” / “Plan a few. Leave room for life.” |
| Recipe library | “The keepers.” / “Good dinners worth repeating.” |
| Grocery tip | “Check the fridge first, boss.” |
| Generation failure | “That didn’t come together. Your ingredients are still here. Try again.” |
| Nutrition | “Fuel for your day.” / “Estimates, not a report card.” |
| Offline | “You’re offline. Your saved list is still here.” Only after offline support exists. |
| Limit reached | “You’ve used your 3 free AI recipes. Your saved recipes are still yours.” |

No “cheat meal,” “bad food,” “burn it off,” red failure rings for eating, streak guilt, or unsupported dollar savings. Goals are optional and private. Never promise exact nutrition or allergen safety because an AI draft exists.

## Information architecture

Mobile tabs: **Kitchen · Recipes · Plan · Shop**. Account/settings from the clearly labeled top-right profile control. Recipe details and cooking are pushed screens with back navigation. Creation is a sheet/full-screen flow; no second hidden generator holding different state. Desktop uses the same destinations in a persistent sidebar and an optional planning pane. Tablet uses list-detail or two-column layouts; not a stretched phone.

The “Ask ErmaJean” treatment on the avatar sheet is a branding example. Initial implementation should label the actual action “Find my dinner” and open the structured assistance flow; conversational chat is deferred.

## Complete screen and behavior specification

| Screen | Primary action / content | Required states and interaction |
|---|---|---|
| Public landing | Ingredient-led promise, avatar + food, 3-step process, product demonstration, real plan comparison | Mobile stacked hero; one CTA; no fabricated testimonials; links/claims only for shipping functionality |
| Sign in / sign up | Email and supported OAuth; calm brand avatar, clear error field | Password manager support, keyboard handling, loading, verification, resend cooldown, account-exists recovery |
| Recovery | Request email → valid reset → sign in | Expired link, invalid link, resend and safe return target; preserve native/web handoff |
| First run | Optional servings/preferences, dietary exclusions; ingredients as first useful task | Skip setup; no forced nutrition goal or push permission; disclose AI assistance |
| Kitchen | Ingredients + time + servings; suggested dinner; return to an unfinished draft | Empty fridge action, input chips, bounded preferences, recent ingredients only with user choice |
| Generating | Clear status and preserved request | Cancel, slow response, retry, quota, offline, provider error; no fake percentage progress |
| Dinner results | One best fit + up to two alternatives; missing ingredients visible | Review AI draft, edit preferences, swap suggestion, regenerate usage explained; no accidental quota double charge |
| Recipe box | Search, favorites, time/protein filters, manual add | Empty, no results, missing image, loading, pagination, retry and cached/offline badge |
| Add/edit recipe | Title, yield, structured ingredients, steps, optional source/photo/notes | Save draft, validation, unsaved-change warning, keyboard-safe actions, duplicate title allowed |
| Recipe detail | Food, time, yield controls, Ingredients/Steps/Notes, estimated nutrition | Source label, ingredient editing, optional suggestions, plan/cook/save, share publication/revoke, no macro values when unknown |
| Cooking mode | One step, relevant ingredients, previous/next, real timer, keep-awake choice | Resume progress, background timer behavior, readable large text, no gesture-only controls; validated food-safety content in actual recipe |
| Plan | Dinner-first flexible week; other meals available; leftovers and open evenings | Add/swap/move/remove with explicit controls and undo; no required seven-day completion; portions separate from batch yield |
| Shopping | By aisle, To buy/Got it, quantities, manual item, source recipes and share | Persisted checks, offline list, edits survive refresh, recipe changes explained, merge ambiguity retained for review |
| Nutrition/goals | Optional energy/protein etc.; basis/source visible | Unknown ≠ zero, planned ≠ eaten, estimates ≠ guarantees; edit/hide goals, no shame colors |
| Profile/settings | Preferences, account, notification settings, support, privacy/export/delete | Honest saved state, error recovery, confirmation for destructive actions; no dead placeholders |
| Upgrade/billing | Exact free/monthly/yearly terms and allowance/reset timing | Quota explanation, price/loading/error, checkout cancellation, entitlement pending, restore/reconcile as platform requires |
| Public share | Published recipe and save-to-my-box CTA | Signed-out access, revoked/not-found, read-only, native fallback, no private notes leaked |

### Main dinner flow

Kitchen → ingredients/time/servings → generate → review AI draft → save or cook → optional plan → shopping list. Save the draft before navigating away. Make “use an existing recipe” equally accessible. Do not require chatting, account personalization or a whole week of planning before a user can solve tonight.

### Accessibility and responsive rules

Minimum 44pt iOS / 48dp Android action hit areas; web mobile 44px minimum, visible focus and keyboard equivalents. All tabs labeled, selected state conveyed with shape/text as well as color. Screen reader labels for every icon control; ingredients use checkbox semantics. Allow dynamic type and 200% text scaling; no fixed-height text containers. Respect reduced motion and platform back behavior. Larger text may replace grids with lists. Never put body copy over noisy food imagery.

Targets: 390px phone first; verify 320/375/430 widths, 768px tablet, 1024/1440 desktop. Desktop uses 220px sidebar with flexible content; supporting pane collapses below tablet/desktop threshold. Keep primary bottom actions above keyboard/safe area. Offline initial scope: cached recipes/list reads and persistent checks with visible sync status; complex edit conflict resolution comes later. This is a proposed capability, not something the current app already provides.

Mobile feasibility: existing Expo cross-platform stack and tablet declaration are known. Keep tap-based navigation and standard sheets. Offline/sync is the highest complexity; phase it deliberately. No gesture-only drag planning, continuous mascot animation, or giant non-virtualized recipe feeds. Validate on actual low/mid-range Android and iPhone devices before claiming readiness.

## Concept-board review notes

Images were generated with the built-in image-generation tool and are visual concepts, not functioning UI or verified recipe content. The written specification is authoritative where generated text or controls drift.

- Core mobile board's “To buy (4)” does not match five unchecked illustrated items; derive counts from actual state. A strict To buy view should hide checked items or have an explicit just-checked transition.
- Generated rice/chicken recipe, substitutions, timings and macro numbers are illustrative only. Do not ship them as validated recipes; white and brown rice are not interchangeable at the same cook time.
- Companion planner mixes week overview rows with a selected-day strip; implementation must choose either a week list or selected-day detail, not both competing models.
- The cooking board's photo and body copy must never imply browning proves doneness. Actual validated recipe steps govern safe completion.
- Standardize Recipes to the book icon (one board uses search). Keep user-avatar and ErmaJean-avatar semantics distinct.
- Macro sample bar is a layout example, not measured user intake. Use the correct portion/basis model from the roadmap.
- Avatar sheet has compressed spacing in one tip line; use the exact text from this document in UI.
- Heading sizes in image boards need responsive limits; generated pixels are not a contrast, touch-size or typography compliance certificate.

## Mobile v2 update

The owner requested a new mobile set matching the avatar-led website. See [nine mobile screens](mobile-v2.html) and [prompts/review notes](design/MOBILE-V2-PROMPTS.md). These replace the earlier mobile boards as the current visual direction. The underlying flow, accessibility and behavior specifications remain applicable.

## Deliverables and next design gate

Review the mobile core, recipe/plan/cook companion, desktop kitchen, avatar system and avatar-led landing concepts together. Confirm character identity and hierarchy with a small audience sample; then implement a clickable dinner-flow prototype and test before rolling across all screens. Preserve written screen/state specifications as acceptance criteria so the redesign includes recovery, errors and empty states, not just ideal screenshots.
