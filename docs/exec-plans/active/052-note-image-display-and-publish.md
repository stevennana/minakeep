# Note image display and publish

```json taskmeta
{
  "id": "052-note-image-display-and-publish",
  "title": "Note image display and publish",
  "order": 52,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "053-link-favicon-cache-and-render",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/design-docs/media-storage-and-serving.md",
    "docs/product-specs/note-image-attachments.md",
    "docs/product-specs/public-home-showroom.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-note-images"
  ],
  "required_files": [
    "src",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The first markdown image is not used consistently for owner/public note cards.",
    "Draft-note images remain publicly reachable.",
    "Public note rendering depends on a different image contract than list-card rendering."
  ]
}
```

## Objective

Surface uploaded note images consistently across owner and public note cards while keeping public media tied to note publication.

## Scope

- first-image derivation for note cards
- owner note-list rendering with images
- public note/showroom image rendering only after publish

## Out of scope

- note-image upload UI
- link favicon work
- Docker packaging

## Exit criteria

1. Owner note cards use the first embedded markdown image when present.
2. Published note cards and note pages render referenced images publicly.
3. Draft-note images do not leak on public routes.
4. `npm run test:e2e -- --grep @ui-note-images` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-note-images`

## Evaluator notes

Promote only when note-image rendering is consistent across owner and public surfaces and the publish boundary stays intact.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 22:45 KST: Derived a `cardImage` from the first embedded markdown image in note records and threaded it through owner note cards plus public showroom note cards without widening the publish contract.
- 2026-03-21 22:45 KST: Added focused `@ui-note-images` Playwright coverage for owner card rendering, published public card/page rendering, and draft image privacy on `/media/:assetId`.
