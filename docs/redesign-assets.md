# ErmaJean production redesign assets

Generated with the built-in image generation tool on 2026-09-24 for the approved avatar-led redesign. These are standalone production images, not cropped screenshots. Original generations remain under `/Users/marcuslee/.codex/generated_images/01a0d577-1583-76e2-9368-6df993856503/`.

Every image is saved identically in `public/redesign/` and `_mobile/ErmaJean/assets/redesign/`.

| File | Size | Purpose | Generation source |
| --- | --- | --- | --- |
| ermajean.png | 1145 × 1374, RGBA | Transparent waist-up mascot | exec-8f4fa07c-84e0-41e1-98a8-1ea952eb0c46.png |
| ermajean-portrait.png | 1254 × 1254, RGB | Tip/avatar portrait; use circular clipping in UI | exec-3f5f7944-3d6a-4140-a462-c8400b714872.png |
| chicken-rice.png | 1536 × 1024, RGB | Hero/one-pan chicken and rice | exec-7ab8936e-8a5e-485e-b59c-82f79c2f3ba0.png |
| chicken-pasta.png | 1536 × 1024, RGB | Lemon garlic chicken pasta editorial example | exec-86836b04-9908-4977-a171-1f281557a157.png |
| chickpea-bowl.png | 1536 × 1024, RGB | Chickpea power bowl editorial example | exec-00df0442-8f7e-4fcc-99af-385f42176c44.png |

## References and prompts

### Waist-up mascot
Reference: `docs/audit-2026-09-21/design/ermajean-avatar.png`.

> Use case: background-extraction / identity-preserve. Production asset for ErmaJean recipe app. Extract/recreate ONLY the large waist-up illustrated woman from the LEFT of this reference onto a genuinely transparent alpha background. Preserve her exact character identity, rich warm brown skin, high dark curly bun, leopard print tied headband, gold hoop earrings, cream shirt with tomato-red collar and sleeve trim, blue denim apron, wooden spoon held upright on viewer right, warm knowing smile. Identical polished hand-drawn editorial ink and warm textured coloring as reference. Single isolated character centered, full bun and spoon and elbows visible, waist cleanly ends at lower image boundary, tight composition with only 3% clear margin around silhouette. No speech bubble, no sage circle, no lettering, no swatches, no second character, no white outline, no shadows outside figure. Output portrait PNG with actual transparent background; not checkerboard artwork.

### Portrait
Reference: generated `public/redesign/ermajean.png`.

> Use case: identity-preserve. Create one square app avatar portrait from this exact illustrated ErmaJean character. Preserve exact facial identity, brown skin, dark curly high bun, leopard-print headband tied atop head, gold hoops, cream shirt and blue denim apron. Crop naturally at upper chest; full bun and headband must fit inside with 5% space above bun. Expression same warm knowing smile with direct gaze. No spoon, no hand. Plain solid pale butter-yellow (#EAD8A7) backdrop. Single character only, centered. No text, logos, watermark, outline, frames, or UI. Clean detailed editorial illustration in precisely same inky warm texture as input. Square image.

### Chicken and rice
Reference: `docs/audit-2026-09-21/design/web-v2-home.png`.

> Use case: photorealistic-natural. Reference is approved website UI mockup, supplied ONLY for matching the food photography. Create production food photograph only, no website, no letters, no UI. Horizontal 3:2 close-up image of the one-pan chicken and rice meal shown in reference: four juicy seared golden brown chicken thighs with caramelized paprika crust, fluffy seasoned golden rice, wilted spinach, parsley, speckles of red chili. Rustic dark skillet, appetizing generous real-life family dinner. Camera 35 degree close-up, skillet almost fills frame, warm natural window light. Green and cream gingham kitchen towel underneath on warm wooden kitchen table, subtle blurred fresh herbs in background. Bold flavorful richly textured food, authentic busy home cook, not fine dining. Keep chicken and rice centered so can crop to wide card. No hands, no character, no words, no logos, no collages. Match the delicious warm photographic visual of referenced mockup faithfully.

### Chicken pasta
Reference: `docs/audit-2026-09-21/design/mobile-v2-discover.png`.

> Use case photorealistic-natural. Production recipe photograph of lemon garlic chicken pasta inspired by small saved-recipe thumbnail in reference mobile UI. Generate ONLY a real food photograph, no device or UI. Close up overhead-three-quarter view of a warm ivory ceramic shallow bowl full of golden seared chicken slices, short twisted pasta, fresh spinach, parsley, lemon slices, light garlic sauce, cracked black pepper. Appetizing, colorful, warm natural daylight, textured wooden kitchen table and cream/green cloth around bowl. Cozy resourceful home cooking, generous and unfussy. Landscape 3:2, bowl centrally fills frame. No text, no hands, no characters, no watermark.

### Chickpea bowl
Reference: `docs/audit-2026-09-21/design/mobile-v2-discover.png`.

> Use case photorealistic-natural. Production recipe photograph of chickpea power bowl inspired by small saved-recipe thumbnail in reference mobile UI. Generate ONLY a real food photograph, no device or UI. Close-up overhead-three-quarter view of a warm ivory ceramic shallow bowl full of golden crispy spiced chickpeas, roasted orange sweet potato cubes, dark green kale, fluffy grains, sliced cucumber, colorful cherry tomatoes, lemon wedge and light tahini drizzle. Appetizing, colorful, warm natural daylight, textured wooden kitchen table and cream/green cloth around bowl. Cozy resourceful home cooking, generous and unfussy. Landscape 3:2, bowl centrally fills frame. No text, no hands, no characters, no watermark.

## Visual QA and usage

- Inspected original approved character sheet, mobile discover board, and website homepage before generation; inspected all generated outputs.
- Character retains the defining facial features, warm brown skin, curly bun, leopard headband, gold hoops, cream/tomato shirt, denim apron, and wooden spoon.
- `ermajean.png` has actual alpha: 695,113 fully transparent pixels; corner alpha 0. Interior opacity is mostly 253/255 as delivered by the generator. Alpha was inspected using Pillow, never modified. No checkerboard or white rectangle is baked in.
- Portrait has a butter backdrop intentionally; clip with a circle and `cover`/appropriate content positioning for tip avatars. The full bun fits but the top margin is tighter than the requested 5%.
- Food outputs contain no UI, typography, overlays, or unrelated characters. Use `cover` for cards and hero regions, keeping central chicken/bowl visible.
- Food photographs are generated editorial examples. Do not imply they are photographs of arbitrary user recipes or replace unrelated recipe images with them.
- PNG source files total about 13 MB per client. Web delivery should use Next Image optimization; native copies are bundled. Preserve original alpha when creating later optimized derivatives.
