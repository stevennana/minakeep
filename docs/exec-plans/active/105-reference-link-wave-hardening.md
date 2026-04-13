# Reference-link wave hardening

```json taskmeta
{
  "id": "105-reference-link-wave-hardening",
  "title": "Reference-link wave hardening",
  "order": 105,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/markdown-reference-links.md",
    "docs/design-docs/markdown-reference-link-rendering.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @ui-reference-link-regression",
    "npm run verify"
  ],
  "required_files": [
    "docs",
    "tests/e2e",
    "tests/unit",
    "src/features/notes"
  ],
  "human_review_triggers": [
    "The bundled reference-link regression command misses repeated-reference, malformed-definition, or mobile reading cases.",
    "Docs, queue history, and shipped renderer capabilities drift apart by the end of the wave.",
    "The full verify gate passes, but the new reference-link experience is still only partially protected."
  ]
}
```

## Objective

Close the markdown reference-link wave by bundling the renderer, public-note, and owner-preview coverage into one durable regression contract and reconciling the docs/queue with the shipped feature.

## Scope

- bundled regression replay for supported reference-link behavior
- final doc and queue reconciliation for the shipped syntax and UI contract
- malformed-syntax and repeated-reference regression cleanup that remains after the first two slices

## Out of scope

- richer academic-citation tooling beyond the documented markdown syntax
- non-note markdown enhancements unrelated to reference links
- future generalized markdown-library migration work

## Exit criteria

1. One deterministic reference-link regression command replays the shipped public-note and owner-preview reference experience.
2. Docs and queue history reflect the actual shipped supported syntax and fallback behavior without overclaiming broader markdown-footnote compatibility.
3. `npm run test:e2e -- --grep @ui-reference-link-regression` and `npm run verify` pass.

## Required checks

- `npm run test:e2e -- --grep @ui-reference-link-regression`
- `npm run verify`

## Evaluator notes

Promote only when the reference-link wave reads as closed and regression-protected rather than as a one-off parser tweak with unfinished verification.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-04-13T12:12:54.173Z: restored as current task after 104-reference-link-note-surfaces promotion.
- 2026-04-13 22:08 KST: tightened the shared renderer fallback so duplicate unused supported definitions now stay visible exactly as authored instead of being rewritten to the first matching definition line.
- 2026-04-13 22:08 KST: expanded unit regression coverage for duplicate unused definitions and unsupported multi-line definitions, then reconciled the product/design/queue docs to describe the shipped narrow syntax and fallback contract without implying broader Markdown footnote support.
- 2026-04-13 21:19 UTC: `npm run test:e2e -- --grep @ui-reference-link-regression` passed with 4 tests, and `npm run verify` passed with lint, db prepare, typecheck, build, 91 unit tests, 96 Playwright tests, and startup smoke.
