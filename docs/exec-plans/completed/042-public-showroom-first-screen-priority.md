# Public showroom first-screen priority

```json taskmeta
{
  "id": "042-public-showroom-first-screen-priority",
  "title": "Public showroom first-screen priority",
  "order": 42,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "043-public-home-density-regression-pass",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-home-showroom.md",
    "docs/design-docs/homepage-showroom-rhythm.md",
    "docs/design-docs/public-home-first-screen-density.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-public-home-density"
  ],
  "required_files": [
    "src/app/page.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The old explanatory showroom copy still appears above the feed.",
    "The homepage still spends most of the first screen on framing chrome instead of cards.",
    "The page regresses into a marketing-hero layout."
  ],
  "completed_at": "2026-03-21T07:36:41.829Z"
}
```

## Objective

Make the showroom itself the first-screen focus on the public homepage.

## Scope

- remove the non-essential explanatory copy block above the public feed
- tighten public-home framing so real content appears immediately
- preserve the mixed notes-and-links showroom rhythm

## Out of scope

- public search semantics
- note and link publishing rules
- owner-surface changes

## Exit criteria

1. The public homepage removes the extra explanatory showroom text block above the grid.
2. Published cards are visibly present in the first screen on common desktop and mobile viewports.
3. The page keeps a clean, composed showroom rhythm rather than reverting to a hero-led layout.
4. `npm run test:e2e -- --grep @ui-public-home-density` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-public-home-density`

## Evaluator notes

Promote only when the public homepage clearly prioritizes published content over framing copy.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 16:30 KST: Confirmed the homepage still rendered a multi-sentence explanatory lede above the public grid and that no `@ui-public-home-density` Playwright coverage existed yet.
- 2026-03-21 16:34 KST: Removed the explanatory lede from the public homepage intro, tightened the public shell spacing so showroom cards appear sooner, added dedicated `@ui-public-home-density` desktop/mobile coverage, refreshed affected homepage UI snapshots, and verified `npm run test:e2e -- --grep @ui-public-home-density` plus `npm run verify`.
- 2026-03-21T07:36:41.829Z: automatically promoted after deterministic checks and evaluator approval.
