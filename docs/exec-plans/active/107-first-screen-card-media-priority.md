# First-screen card media priority

```json taskmeta
{
  "id": "107-first-screen-card-media-priority",
  "title": "First-screen card media priority",
  "order": 107,
  "status": "queued",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "108-image-loading-wave-hardening",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/image-loading-priority.md",
    "docs/product-specs/public-home-showroom.md",
    "docs/product-specs/owner-workspace-density.md",
    "docs/product-specs/link-favicon-caching.md",
    "docs/design-docs/image-loading-strategy.md",
    "docs/design-docs/homepage-showroom-rhythm.md",
    "docs/design-docs/responsive-ui-rules.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @ui-image-loading-card-media",
    "npm run verify"
  ],
  "required_files": [
    "src/app",
    "src/features/links",
    "src/features/notes",
    "src/features/public-content",
    "tests/e2e",
    "tests/unit"
  ],
  "human_review_triggers": [
    "The public showroom upgrades all initial card media to eager/high priority instead of only the visible budget.",
    "Owner dashboard or links surfaces regress layout, click targets, or read-only behavior while adding loading hints.",
    "The new UI test only checks for attribute presence and misses desktop/mobile first-screen behavior."
  ]
}
```

## Objective

Apply the shared loading contract to card media on the public showroom, owner dashboard, and owner links route so visible note images and favicons load before lower-list media.

## Scope

- public showroom loading-priority assignment for the initial media-bearing cards
- owner dashboard note-card image priority on initial render
- owner links favicon priority on initial render
- dedicated desktop/mobile UI regression coverage for card-media loading policy

## Out of scope

- rendered note-body images on public note pages or editor preview
- `next/image` migration
- changing collection slice sizes or pagination behavior

## Exit criteria

1. The public showroom gives higher priority only to the small set of initial visible media-bearing cards.
2. The owner dashboard and owner links route prioritize only their top visible card media on initial render.
3. Existing card destinations, new-tab behavior, and layout rhythm remain intact on desktop and mobile.
4. `npm run test:e2e -- --grep @ui-image-loading-card-media` and `npm run verify` pass.

## Required checks

- `npm run test:e2e -- --grep @ui-image-loading-card-media`
- `npm run verify`

## Evaluator notes

Promote only when the change clearly improves first-screen media delivery without degrading the current incremental-loading discipline or over-eagerly fetching lower cards.

## Progress log

- 2026-04-13T21:27:12+0900: task created during the post-reference-link continuation planning pass.
