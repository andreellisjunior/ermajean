# ErmaJean — dedicated website experience v2

This pass translates the approved avatar-led mobile direction into four desktop concepts: public homepage, signed-in Kitchen, recipe detail, and weekly planner with shopping pane. These supersede desktop-kitchen.png and landing-avatar.png as the current website exploration. Previous concepts remain available for comparison. The original audit and behavioral requirements still apply.

## What carries over from mobile

ErmaJean’s consistent illustrated identity, oat/collard/tomato palette, characterful serif headings, straightforward sans controls, ingredient-first dinner assistance, flexible plans, optional nutrition, and warm concise copy. User initials/photo remain separate from the assistant character.

## What is specifically designed for web

- Public homepage introduces the promise and previews actual product tasks. Primary CTA starts dinner assistance; users can explore features and pricing before signing in.
- Signed-in shell uses persistent Kitchen / Recipes / Plan / Shop navigation and a global recipe search. Links support browser back/forward and direct URLs.
- Kitchen keeps ingredient entry and recommendations alongside an upcoming-plan summary. Preserve inputs and drafts across navigation.
- Recipe detail uses two columns with readable ingredients, actions and notes. Cooking mode can expand to a focused view; print output excludes navigation and personal notes unless selected.
- Planner uses a flexible week grid with a linked shopping pane. Explicit add/move/swap/remove controls are required; drag-and-drop can supplement them. Failed changes preserve the previous plan.

## Responsive behavior and interaction requirements

At approximately 1280px+, use sidebar plus flexible main content; keep the shopping pane at a readable width. At 768–1279px, collapse secondary panes behind labeled buttons and use a compact navigation rail only if labels remain accessible. Recipe columns stack as width requires. Below 768px, use the mobile hierarchy with accessible navigation, not shrunken desktop content. Weekly grid becomes a day/week list with one clear model. At 200% zoom, stack instead of clipping.

Keyboard-operable controls, visible focus, appropriate dialog focus management, skip navigation, semantic headings and checkbox state, reduced motion and touch targets remain required. Generated typography is art direction, not proof of accessibility. Use consistent button/nav semantics across all screens. Scale down character art before reducing content readability.

## Image review corrections before implementation

1. Public homepage incorrectly includes a J account avatar alongside Sign in. Remove that avatar for signed-out visitors; signed-in visitors get their account control and an Open kitchen CTA.
2. Recipe/planner images add an extra large mascot in the sidebar. Prefer the single contextual tip avatar on these task-focused screens; keep large character art for welcome and Kitchen.
3. Planner shopping preview must include quantities, pending changes and list provenance when implemented. Illustrated ingredient rows are layout samples only.
4. Recipe ingredient quantities are intentionally unspecified in the concept. Real recipes must include validated amounts/yield; do not treat generic substitutions or a 20-minute sample as tested instructions.
5. Keep global search copy to “Search your recipes” until wider ingredient/semantic search is supported. Remove generated “in seconds” performance language from public copy until measured.
6. Standardize sidebar width/background, basket icon and active states across boards. Use sans-serif for functional labels and notes even where generation favors serif.
7. The planner’s two-row week arrangement is a desktop option to usability-test; seven equal columns are not mandatory. Preserve day order and meaningful keyboard traversal.

## Scope

These are static concept mockups, not a functioning website implementation. Shared data/auth/billing repairs in ROADMAP.md are prerequisites for shipping the corresponding features. Exact prompts and references are recorded in design/WEB-V2-PROMPTS.md.
