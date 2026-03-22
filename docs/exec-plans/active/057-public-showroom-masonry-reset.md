# Public showroom masonry reset

```json taskmeta
{
  "id": "057-public-showroom-masonry-reset",
  "title": "Public showroom masonry reset",
  "order": 57,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "058-public-note-human-reading-polish",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-home-showroom.md",
    "docs/product-specs/public-showroom-search.md",
    "docs/design-docs/homepage-showroom-rhythm.md",
    "docs/design-docs/public-home-first-screen-density.md",
    "docs/design-docs/public-surface-taste-rules.md",
    "docs/references/public-surface-design-references.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-public-showroom-masonry"
  ],
  "required_files": [
    "src/app/page.tsx",
    "src/features/public-content/components/public-showroom.tsx",
    "src/app/globals.css",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The archive still feels like a rigid two-column app grid on desktop.",
    "The search shell or archive header still dominates the first screen.",
    "The masonry implementation breaks scan order or mobile collapse."
  ]
}
```

## Objective

Rebuild the public homepage into a more dynamic masonry-style published archive with quieter top chrome.

## Scope

- homepage showroom layout and archive head
- collapsed and expanded public search shell styling
- note/link preview-card rhythm on the public homepage

## Out of scope

- public note page redesign
- owner routes
- publishing logic or search semantics changes

## Exit criteria

1. Desktop homepage layout feels visibly more dynamic than the current two-column impression.
2. The first screen remains content-first and scan-friendly.
3. Mobile collapse remains readable and touch-safe.
4. `npm run test:e2e -- --grep @ui-public-showroom-masonry` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-public-showroom-masonry`

## Evaluator notes

Promote only when the public showroom feels more alive without becoming chaotic or image-gallery random.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-22 09:58 KST: Rebuilt the homepage archive shell so the compact archive head and recessed public search live together inside one quieter top block, removing the previous stacked search-first impression.
- 2026-03-22 09:58 KST: Switched the public showroom feed to CSS multi-column masonry on desktop with strict single-column mobile fallback, refreshed the related Playwright showroom snapshots, and tagged the task-specific UI checks under `@ui-public-showroom-masonry`.
