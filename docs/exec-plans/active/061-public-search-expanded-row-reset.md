# Public search expanded row reset

```json taskmeta
{
  "id": "061-public-search-expanded-row-reset",
  "title": "Public search expanded row reset",
  "order": 61,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "062-owner-dashboard-notes-priority-reset",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-showroom-search.md",
    "docs/design-docs/public-home-first-screen-density.md",
    "docs/design-docs/public-surface-taste-rules.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-public-search-row"
  ],
  "required_files": [
    "src/features/public-content/components/public-showroom.tsx",
    "src/app/globals.css",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The expanded search panel still appears beside the archive count instead of below the archive header.",
    "Search expansion still dominates the first screen or becomes awkward to read on desktop.",
    "The layout fix regresses collapsed-search or mobile behavior."
  ]
}
```

## Objective

Fix the expanded public-search layout so it occupies a clear row beneath the archive heading instead of breaking as a right-side tile.

## Scope

- expanded public-search placement and shell layout
- archive head and search-row spacing relationship
- responsive behavior for the expanded search state

## Out of scope

- title-search behavior changes
- masonry card redesign
- owner dashboard layout

## Exit criteria

1. Expanded public search sits on its own readable row beneath the archive heading on desktop.
2. The first screen remains content-first and visually stable.
3. Collapsed search and mobile states remain clean.
4. `npm run test:e2e -- --grep @ui-public-search-row` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-public-search-row`

## Evaluator notes

Promote only when the expanded search state looks deliberately placed instead of squeezed into the archive header.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-22 10:57 KST: Updated the public showroom shell so the archive header stays single-column at the desktop breakpoint and the search shell stretches as its own row beneath the heading/count block; added stable test hooks and tightened the public showroom UI assertion to check expanded-row placement.
- 2026-03-22 10:59 KST: Verified the focused `@ui-public-search-row` Playwright flow and the full `npm run verify` gate both pass after narrowing the desktop reflow to the expanded-search state so the collapsed shell and first-screen density stay stable.
