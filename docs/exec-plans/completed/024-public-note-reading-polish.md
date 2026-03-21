# Public note reading polish

```json taskmeta
{
  "id": "024-public-note-reading-polish",
  "title": "Public note reading polish",
  "order": 24,
  "status": "completed",
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
  "human_review_triggers": [],
  "completed_at": "2026-03-21T02:14:07.880Z"
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
- 2026-03-21 11:03 KST: Reviewed task contract, frontend guidance, public-note spec, and existing note-page implementation. Confirmed the route was still using oversized explanatory framing and there was no dedicated `@ui-public-note` Playwright spec yet.
- 2026-03-21 11:03 KST: Reworked the public note page into a tighter reading-first layout by shrinking the frame, removing the competing explanatory lede, moving AI summary/tags into a quieter footer below the markdown body, and tightening the metadata/back-link treatment.
- 2026-03-21 11:03 KST: Added dedicated `@ui-public-note` desktop/mobile deterministic coverage with accessibility, overflow, hierarchy, and screenshot assertions. During `npm run verify`, refreshed one stale `@ui-system` public-hero screenshot baseline that no longer matched the current rendered homepage chrome.
- 2026-03-21T02:14:07.880Z: automatically promoted after deterministic checks and evaluator approval.
