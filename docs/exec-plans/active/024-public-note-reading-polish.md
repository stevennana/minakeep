# Public note reading polish

```json taskmeta
{
  "id": "024-public-note-reading-polish",
  "title": "Public note reading polish",
  "order": 24,
  "status": "queued",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "025-owner-shell-density-reset",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-note-reading.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-public-note"
  ],
  "required_files": [
    "src/app/notes/[slug]/page.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": []
}
```

## Objective

Tighten the public note page into a calmer, more compact reading experience.

## Scope

- reduce oversized note-page framing
- improve reading width and typography hierarchy
- quiet supporting metadata and AI summary/tag treatment

## Out of scope

- homepage redesign
- owner workspace redesign
- broad theme-system refactors not needed for the note page

## Exit criteria

1. Public note pages feel more reading-first than dashboard-like.
2. Metadata remains visible without competing with the authored note body.
3. `npm run test:e2e -- --grep @ui-public-note` passes with desktop/mobile screenshots, visible reading hierarchy, and accessibility checks.
4. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-public-note`

## Evaluator notes

Promote when the deterministic UI checks pass and the public note page is materially calmer and easier to read than before.

## Progress log

- Start here. Append timestamped progress notes as work lands.
