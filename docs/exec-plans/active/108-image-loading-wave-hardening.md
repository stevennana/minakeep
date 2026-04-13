# Image loading wave hardening

```json taskmeta
{
  "id": "108-image-loading-wave-hardening",
  "title": "Image loading wave hardening",
  "order": 108,
  "status": "queued",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/image-loading-priority.md",
    "docs/product-specs/note-image-attachments.md",
    "docs/product-specs/public-note-reading.md",
    "docs/design-docs/image-loading-strategy.md",
    "docs/design-docs/media-storage-and-serving.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @ui-image-loading-regression",
    "npm run verify"
  ],
  "required_files": [
    "docs",
    "src/app",
    "src/features/notes",
    "tests/e2e",
    "tests/unit"
  ],
  "human_review_triggers": [
    "Rendered markdown images remain globally lazy even when the first article image sits in the opening viewport.",
    "The hardening pass closes the wave without one bundled regression command for the shipped image-loading behavior.",
    "The new policy regresses public-note reading, owner preview parity, or media privacy boundaries."
  ]
}
```

## Objective

Close the image-loading wave by extending the loading contract to rendered markdown images and bundling durable regression coverage for the shipped viewport-first behavior.

## Scope

- first rendered markdown-image priority for public note reading and owner preview
- lazy fallback for later article images
- bundled UI and unit regression coverage for the final loading-policy contract
- final doc and queue reconciliation for the shipped behavior

## Out of scope

- generalized asset prefetching beyond rendered note images
- third-party CDN integration
- unrelated public-note typography or layout redesign

## Exit criteria

1. Public note reading and owner preview prioritize only the first rendered markdown image in the article body when it belongs to the initial viewport.
2. Later article images remain lazy, and media privacy/publish gating stays unchanged.
3. The image-loading wave ends with one bundled regression command plus reconciled docs that describe the shipped policy precisely.
4. `npm run test:e2e -- --grep @ui-image-loading-regression` and `npm run verify` pass.

## Required checks

- `npm run test:e2e -- --grep @ui-image-loading-regression`
- `npm run verify`

## Evaluator notes

Promote only when the image-loading wave reads as fully closed and regression-protected instead of as a partial card-only tweak.

## Progress log

- 2026-04-13T21:27:12+0900: task created during the post-reference-link continuation planning pass.
