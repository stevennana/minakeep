# Public search expanded row reset

```json taskmeta
{
  "id": "068-public-search-expanded-row-reset",
  "title": "Public search expanded row reset",
  "order": 68,
  "status": "planned",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "069-owner-dashboard-notes-priority-reset",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-showroom-search.md",
    "docs/design-docs/public-home-first-screen-density.md",
    "docs/design-docs/progressive-disclosure-rules.md"
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
    "Search still uses redundant labels or helper copy around an obvious search field.",
    "The layout fix regresses collapsed-search or mobile behavior."
  ]
}
```

## Objective

Fix the expanded public-search layout so it occupies a clear row beneath the archive heading and removes redundant labeling.

## Scope

- expanded public-search placement and shell layout
- archive head and search-row spacing relationship
- label and helper-copy reduction inside the expanded search state

## Out of scope

- title-search behavior changes
- masonry card redesign
- owner dashboard layout

## Exit criteria

1. Expanded public search sits on its own readable row beneath the archive heading on desktop.
2. The expanded state uses minimal obvious labeling.
3. Collapsed search and mobile states remain clean.
4. `npm run test:e2e -- --grep @ui-public-search-row` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-public-search-row`

## Evaluator notes

Promote only when the expanded search state looks deliberately placed and does not over-explain itself.

## Progress log

- Start here. Append timestamped progress notes as work lands.
