# Public home dynamic grid

```json taskmeta
{
  "id": "023-public-home-dynamic-grid",
  "title": "Public home dynamic grid",
  "order": 23,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "024-public-note-reading-polish",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-home-showroom.md",
    "docs/design-docs/homepage-showroom-rhythm.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-home-grid"
  ],
  "required_files": [
    "src/app/page.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": []
}
```

## Objective

Implement the homepage’s varied-height note showroom and reusable note-preview card treatment.

## Scope

- build a grid-based note archive with dynamic card heights
- keep titles and previews primary, metadata secondary
- ensure the dynamic rhythm still scans quickly

## Out of scope

- public note page changes
- owner workspace changes
- mobile-specific final polish beyond what the homepage grid immediately needs

## Exit criteria

1. Published note previews form a dynamic, readable grid.
2. Card rhythm feels more alive than the current uniform list/card treatment.
3. `npm run test:e2e -- --grep @ui-home-grid` passes with desktop/mobile screenshots, no obvious overflow, and accessibility checks.
4. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-home-grid`

## Evaluator notes

Promote when the deterministic UI checks pass and the grid feels intentionally composed rather than merely unequal.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 10:51 KST: Reworked `src/app/page.tsx` into a note-first showroom grid with a reusable `PublishedNotePreviewCard`, reordered card hierarchy to title -> preview -> metadata -> tags, and added deterministic compact/balanced/feature card variants based on published note content.
- 2026-03-21 10:51 KST: Added homepage card styling in `src/app/globals.css` for varied minimum heights, calmer metadata treatment, and a two-column desktop showroom grid that keeps the right-side intro rail intact.
- 2026-03-21 10:58 KST: Added `tests/e2e/ui-home-grid.spec.ts` with desktop/mobile screenshot baselines plus explicit rhythm, overflow, and accessibility assertions; refreshed impacted `@ui-home-shell` and `@ui-system` snapshots; `npm run test:e2e -- --grep @ui-home-grid` and `npm run verify` now pass locally.
