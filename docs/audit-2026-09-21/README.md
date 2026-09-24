# ErmaJean audit and redesign package

Start with `index.html` for the visual review, or open these documents:

- [Current-state audit](AUDIT.md): 18 prioritized findings, verified checks, scope and limitations.
- [Update plan](ROADMAP.md): phased delivery, first backlog, dependencies and acceptance criteria.
- [UI/UX and brand specification](DESIGN.md): audience, voice, avatar, tokens, every major screen and required states.
- [Image prompts](design/PROMPTS.md): exact prompts used with built-in image generation.

Current mobile direction: [Mobile v2 review](mobile-v2.html) — nine avatar-led screens. [Prompts and review notes](design/MOBILE-V2-PROMPTS.md). This supersedes the original mobile boards below, which are retained as earlier explorations.

Original generated concepts:

1. [ErmaJean avatar system](design/ermajean-avatar.png)
2. [Mobile kitchen, recipe and shopping](design/mobile-core.png)
3. [Mobile recipe box, plan and cooking](design/mobile-flows.png)
4. [Desktop kitchen](design/desktop-kitchen.png)
5. [Avatar-led public landing](design/landing-avatar.png)

Images are art direction, not deployed screens, validated recipes, or final production assets. DESIGN.md records the known image inconsistencies and implementation corrections.

`evidence/` contains install/build/lint/test/Expo Doctor logs, dependency audit JSON and public-route/parser observations. No credentials or environment files are included. Both existing lockfiles were installed without dependency changes; application source was not changed.

Current website direction: [Website v2 review](web-v2.html), [experience notes](WEB-V2.md), and [prompts](design/WEB-V2-PROMPTS.md). Four new desktop concepts extend the mobile direction.
