# Public showroom clickable media

```json taskmeta
{
  "id": "082-public-showroom-clickable-media",
  "title": "Public showroom clickable media",
  "order": 82,
  "status": "planned",
  "promotion_mode": "standard",
  "next_task_on_success": "083-public-note-reading-top-summary",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-home-showroom.md",
    "docs/design-docs/homepage-showroom-rhythm.md",
    "docs/design-docs/responsive-ui-rules.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep public-showroom",
    "npm run verify"
  ],
  "required_files": [
    "src/features/public-content",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Image click targets diverge from the related title link targets.",
    "Published link media loses the required new-tab behavior.",
    "The change causes card layout or accessibility regressions."
  ]
}
```

## Objective

Make public showroom images/favicons clickable and consistent with the existing title destinations.

## Scope

- note preview image click target
- link preview image/fallback click target
- accessibility and new-tab behavior alignment

## Out of scope

- note detail layout
- owner delete/settings work

## Exit criteria

1. Published note preview images route to the same note detail page as the note title.
2. Published link media opens the same external destination in a new tab.
3. The showroom remains visually stable on desktop and mobile.
4. `npm run test:e2e -- --grep public-showroom` passes.
5. `npm run verify` passes.

## Required checks

- `npm run test:e2e -- --grep public-showroom`
- `npm run verify`

## Evaluator notes

Promote only when media click targets feel like a natural extension of the existing card behavior rather than a bolt-on wrapper.

## Progress log

- Start here. Append timestamped progress notes as work lands.
