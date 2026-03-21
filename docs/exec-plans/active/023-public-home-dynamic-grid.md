# Public home dynamic grid

```json taskmeta
{
  "id": "023-public-home-dynamic-grid",
  "title": "Public home dynamic grid",
  "order": 23,
  "status": "queued",
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
