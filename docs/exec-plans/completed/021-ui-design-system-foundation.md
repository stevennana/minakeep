# UI design-system foundation

```json taskmeta
{
  "id": "021-ui-design-system-foundation",
  "title": "UI design-system foundation",
  "order": 21,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "022-public-home-shell-reset",
  "prompt_docs": [
    "AGENTS.md",
    "docs/DESIGN.md",
    "docs/FRONTEND.md",
    "docs/design-docs/cool-monochrome-visual-system.md",
    "docs/design-docs/responsive-ui-rules.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-system"
  ],
  "required_files": [
    "src/app/globals.css",
    "src",
    "tests/e2e"
  ],
  "human_review_triggers": [],
  "completed_at": "2026-03-21T01:35:22.465Z"
}
```

## Objective

Introduce the reusable design-system layer for the next UI wave so later route-level redesign tasks can focus on composition instead of restyling everything ad hoc.

## Scope

- define shared design tokens for color, type scale, spacing, radius, and shadows
- introduce reusable presentation primitives for shells, panels, cards, metadata rows, tags, and button variants
- set the cool monochrome base and smaller typography scale
- keep route and feature logic intact

## Out of scope

- homepage-specific composition work
- owner-specific layout restructuring
- route-level content hierarchy changes beyond what the shared system needs

## Exit criteria

1. The repo has a shared visual system encoded in reusable primitives and tokens.
2. Existing route logic remains intact while presentation becomes easier to restyle centrally.
3. `npm run test:e2e -- --grep @ui-system` passes with desktop/mobile screenshots, visible hierarchy anchors, and accessibility checks.
4. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-system`

## Evaluator notes

Promote when the deterministic UI checks pass and later UI tasks can clearly reuse the shared system instead of re-solving basic styling per route.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- Note which existing visual primitives were consolidated or replaced.
- 2026-03-21 10:48 KST: Added a shared `src/components/ui/primitives.tsx` layer for surfaces, section headings, metadata rows, tag chips/lists, detail blocks, and button variants; rewired the shared route shells and editor/link/search/tag/public-note surfaces onto those primitives without changing their underlying route logic.
- 2026-03-21 10:48 KST: Replaced the warm parchment globals with tokenized cool-monochrome CSS variables for color, type scale, spacing, radius, and shadows, while keeping existing route selectors compatible so later UI tasks can restyle centrally.
- 2026-03-21 10:48 KST: Added a dedicated `@ui-system` Playwright spec with desktop/mobile visual snapshots, hierarchy-anchor assertions, horizontal overflow checks, and lightweight automated accessibility structure checks against shared public/private shells.
- 2026-03-21 10:59 KST: `npm run test:e2e -- --grep @ui-system` passed after writing stable desktop/mobile snapshots for the site header, public hero, login layout, and private vault header/dashboard hero.
- 2026-03-21 11:01 KST: `npm run verify` passed, confirming the shared-system refactor did not break the existing auth, note, publish, link, tag, search, AI, or startup smoke paths.
- 2026-03-21T01:35:22.465Z: automatically promoted after deterministic checks and evaluator approval.
