# Image loading priority foundation

```json taskmeta
{
  "id": "106-image-loading-priority-foundation",
  "title": "Image loading priority foundation",
  "order": 106,
  "status": "active",
  "promotion_mode": "standard",
  "next_task_on_success": "107-first-screen-card-media-priority",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/image-loading-priority.md",
    "docs/product-specs/note-image-attachments.md",
    "docs/product-specs/link-favicon-caching.md",
    "docs/design-docs/image-loading-strategy.md",
    "docs/design-docs/media-storage-and-serving.md"
  ],
  "required_commands": [
    "npm run test:unit",
    "npm run typecheck"
  ],
  "required_files": [
    "docs",
    "src/features/links",
    "src/features/notes",
    "tests/unit"
  ],
  "human_review_triggers": [
    "The new contract still leaves every image path hardcoded to lazy loading.",
    "The helper contract silently eager-loads every image in the initial collection slice.",
    "The change weakens publish-gated media URLs or markdown-authored image compatibility."
  ]
}
```

## Objective

Create one shared loading-intent contract for note-card images, cached favicons, and rendered markdown images so first-screen media can be prioritized without forking separate ad hoc rules per surface.

## Scope

- shared loading-intent API for note-card and favicon helpers
- markdown-renderer support for a small prioritized-image budget
- targeted unit coverage for the generated image attributes
- doc alignment for the new viewport-first loading policy

## Out of scope

- public-home screenshot regression work
- owner-route screenshot regression work
- broader image optimization or format conversion

## Exit criteria

1. Shared note-image, favicon, and markdown-rendering helpers can express both prioritized and lazy image modes without changing media URLs or accessibility labels.
2. The contract makes it possible to cap eager/high-priority media per surface instead of upgrading an entire list by accident.
3. `npm run test:unit` and `npm run typecheck` pass.

## Required checks

- `npm run test:unit`
- `npm run typecheck`

## Evaluator notes

Promote only when the codebase has one clear image-loading contract that future surfaces can reuse, rather than one-off eager/lazy overrides scattered through route files.

## Progress log

- 2026-04-13T21:27:12+0900: task created during the post-reference-link continuation planning pass.
- 2026-04-13T22:06:00+0900: added one shared image-loading intent helper, threaded it through note-card images, cached favicons, and markdown rendering, and assigned capped prioritized-image budgets on the public showroom, owner dashboard, owner links list, public note page, and note editor preview.
- 2026-04-13T22:06:00+0900: added targeted unit coverage for shared image attributes and markdown prioritized-image budgets, then aligned the image-loading specs/design docs with the viewport-first loading contract.
