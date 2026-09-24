# Mobile v2 — avatar-led mockups

Generated with the built-in image_gen tool using landing-avatar.png as the visual direction and ermajean-avatar.png as the character reference. These nine screens supersede the earlier mobile-core.png and mobile-flows.png direction. Previous assets remain available for comparison.

## Review notes

- Kitchen, Recipes, Plan and Shop remain the four primary destinations; profile uses user initials, distinct from ErmaJean.
- Character scale follows context: welcoming illustration for entry, helper panel at home, compact portrait for tips.
- Standardize navigation selection to the filled icon + pale sage pill seen in the planning board; generated boards vary.
- Cooking board shows ErmaJean twice; remove the lower repeat or reduce the upper illustration in implementation to prioritize instructions.
- Library search should say “Search your recipes” until semantic search is implemented; “vibes” is illustrative copy, not a capability promise.
- Use one recipe fixture across boards: generated names and timings vary. Food photos, recipe instructions, nutrition and goals are illustrative, not validated user data.
- Larger text must reflow and scroll; image layouts do not certify touch target sizes or accessibility.
- Use accessible sans-serif for functional tips; handwritten copy is a decorative option, never mandatory reading in a small size.

## Shared prompt

Use case: ui-mockup. Create a NEW high-fidelity native MOBILE APP mockup board for ErmaJean, matching the attached website art direction. Reference image 1 is the approved avatar-led WEBSITE STYLE (not a layout to shrink); reference image 2 is the CHARACTER IDENTITY sheet. Preserve EXACT recognizable ErmaJean: warm brown skin, dark curly high bun, leopard-print headscarf tied above forehead, gold hoops, cream tomato-trim tee, denim apron, wooden spoon, mature confident cool-aunt smile. No other illustrated characters. User profile uses initials 'J', never ErmaJean's face.
Landscape 3:2 canvas, three equally sized large tall phone screens side-by-side with small gutters, complete screens visible from status bar through bottom safe area, subtle thin frames NO device hardware/perspective. Minimal board heading, no annotations. Native app usability with readable 16px-equivalent body, 48px actions, spacious margins.
MATCH website's thick charismatic rounded serif, collard green #244638, warm oat #F7F3E8, tomato #B84732 bold CTA, butter #EADBA7 and sage #DEE6D8. Small hand-drawn tomato/underline logo detail, restrained doodles. Contemporary food-culture, candid colorful food photography, warm outlined character illustration. Flat colors, fine borders, NO gradients, glass, generic SaaS style, overwhelming decorative card stacks or vintage scrapbook. Busy 22–42-year-olds, low decision fatigue, quick satisfying dinner, nutrition as fuel without guilt. Avatar must have a useful role and never obscure content. Main app tabs exactly Kitchen (house), Recipes (book), Plan (calendar), Shop (basket), all labeled. Pushed subflows no tabs. Small ErmaJean portrait tips have name label and plain text. All nutrition/time/food samples are illustrative design content. 

## mobile-v2-discover.png

Board heading 'ermajean / Dinner starts here'.
LEFT welcome screen: no tabs, small logo, headline 'We got food at home.' Large signature half-body ErmaJean holding spoon integrated with a cropped vivid chicken rice bowl photo, same warm illustrative/photo mix as website. Speech bubble 'We can work with this.' Short copy 'Turn what’s in your fridge into dinner.' Clear label 'Your AI kitchen helper'. Bottom tomato full-width 'Let’s get dinner handled', secondary 'I already have an account'.
CENTER returning-user Kitchen: logo and user initial J at top. headline 'Hey, what’s for dinner?' A compact sage helper panel showing waist-up ErmaJean at right occupying only quarter of panel; text left 'Got a few ingredients? I’ve got ideas.' tomato 'Find my dinner' button. Below 'Tonight, handled.' one large beautiful chicken rice bowl photo card title 'One-pan chicken & rice', metadata '20 min · Serves 4', source 'AI draft', button 'See recipe'. Slim lower row 'Your keepers' with two tiny thumbnail previews. Kitchen tab active.
RIGHT ingredient entry pushed screen: back 'Kitchen', heading 'What are we working with?' Small circular thoughtful ErmaJean at left of tip 'Start with what needs using.' Field label 'Ingredients' search input 'Add an ingredient', chips Chicken / Rice / Spinach with remove x. Fields 'Time' choices 15 / 20 / 30 min (20 selected), 'Servings' minus 4 plus. 'Preferences' two chips 'No dairy' 'Mild spice', link 'Edit preferences'. A small text 'AI suggestions · Check ingredients before cooking'. Fixed tomato button 'Find my dinner'. No tabs.

## mobile-v2-cook.png

Board heading 'ermajean / Good dinners become keepers'.
LEFT Recipes tab screen, logo and user initial J. Heading 'The keepers.' Copy 'Good dinners worth repeating.' Search input, filters All / Quick / Favorites. Tomato '+ Add recipe' action. Two-column photo grid: chicken rice bowl, chickpea wraps, garlic noodles, sheet-pan salmon. Title and time each, consistent bookmark icons and 'Your recipe' or 'AI draft' labels. Tiny butter strip with circular smiling ErmaJean and text 'A good shortcut is worth keeping.' Recipes tab active.
CENTER recipe detail pushed screen: Back / bookmark controls, large appetizing chicken rice photograph top quarter. Small 'AI DRAFT' label. Heading 'One-pan chicken & rice'. metadata 20 min / Easy, servings minus 4 plus. Ingredients / Steps / Notes tabs, Ingredients active. Three checklist rows '1 lb chicken', '1 cup white rice', '2 cups spinach'. Small sage portrait tip with SAME ErmaJean labeled 'ErmaJean’s tip' and 'Frozen veg? That works, too.' Small line 'Estimated per serving: 520 kcal · 34g protein'. Primary tomato 'Let’s cook', outlined 'Add to plan'. No tabs.
RIGHT cooking mode pushed screen, back 'Recipe', heading 'Alright, let’s cook.' Small calm ErmaJean portrait near heading, no large photo so steps remain focus. 'Step 2 of 4' and progress markers. Large text 'Get some color on that chicken.' Body 'Warm the oil in a large pan. Add the seasoned chicken and turn halfway through browning.' Small ingredient strip 'Chicken · Oil · Seasoning'. Large clear 06:00 timer with 'Start timer' control. Keep screen awake switch. A butter tip with small portrait 'One pan. Less cleanup. We love to see it.' Footer Previous and tomato Next step. No tab bar. Ensure cooking step is explicitly browning stage not final doneness claim.

## mobile-v2-plan.png

Board heading 'ermajean / A little prep. A better week'.
LEFT Plan screen logo/user J. Heading 'This week, loosely.' Copy 'Plan a few. Leave room for life.' Week date September 21–27 with previous/next. WEEK LIST ONLY, no selected-day chips: Mon Chicken & rice photo row; Tue Leftovers row; Wed Chickpea wraps photo row; Thu '+ Leave it open' dashed row. Each has explicit more menu. Butter tip card waist-up ErmaJean small at right with text 'Make extra tonight. Tomorrow-you says thanks.' Bottom tomato 'Build shopping list'. Plan active in tabs.
CENTER Shop screen logo/user J. Heading 'Check the fridge first, boss.' Small round ErmaJean helper portrait by subtitle 'You might have dinner halfway handled.' Segments To buy (4) / Got it (1). Exactly FOUR unchecked visible rows: Produce: Spinach 1 bag, Bell peppers 2; Protein: Chicken 2 lb; Pantry: Rice 1 bag. NO checked item in To buy tab. Group dividers and generous checkbox targets. '+ Add an item' outlined button, small caption 'From 3 planned dinners'. Bottom green 'Share list'. Shop active in tabs.
RIGHT Profile/Goals pushed screen back 'Kitchen', user initial J clearly separate from mascot. Heading 'Your kitchen. Your pace.' card 'Jordan' 'Preferences & account'. Nutrition section heading 'Fuel for your day', optional switch 'Show nutrition estimates' ON. Goal row 'Protein goal' '100g' Edit, subtitle 'Set what works for you.' NO calorie shame, score or streak. A butter card small seated bust of ErmaJean and text 'A little structure. Plenty of room for real life.' Rows Dietary preferences, Subscription 'Free', Notifications, Help & support, each chevron. Plain footer 'Privacy · Sign out'. No bottom tabs on this pushed settings screen.

