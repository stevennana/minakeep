# Public note human reading polish

```json taskmeta
{
  "id": "058-public-note-human-reading-polish",
  "title": "Public note human reading polish",
  "order": 58,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "059-tag-chip-and-public-type-fit",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-note-reading.md",
    "docs/product-specs/public-surface-human-design-reset.md",
    "docs/design-docs/public-surface-taste-rules.md",
    "docs/design-docs/cool-monochrome-visual-system.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-public-note-taste"
  ],
  "required_files": [
    "src/app/notes/[slug]",
    "src/app/globals.css",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Public note pages still read like dashboard panels rather than published reading surfaces.",
    "The title or metadata remains visually aggressive after the redesign.",
    "Reading comfort regresses on mobile."
  ],
  "completed_at": "2026-03-22T01:13:05.738Z"
}
```

## Objective

Refine the public note page into a calmer, more bespoke reading surface that matches the upgraded showroom.

## Scope

- public note title and metadata hierarchy
- reading measure and note body presentation
- public note image and summary placement polish

## Out of scope

- homepage masonry implementation
- owner note editor or owner dashboard changes
- new public note features

## Exit criteria

1. Public note pages feel more human-made and reading-first than the current shipped surface.
2. Headings, metadata, and AI summary no longer compete with the authored note body.
3. Mobile reading remains comfortable.
4. `npm run test:e2e -- --grep @ui-public-note-taste` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-public-note-taste`

## Evaluator notes

Promote only when the public note page feels calmer and more intentional without becoming visually dull.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-22 10:09 KST: Refined the public note route into a quieter reading surface by softening the utility row, tightening the title scale, narrowing the reading measure, and moving summary/tags into a more recessive appendix treatment in `src/app/notes/[slug]` and `src/app/globals.css`.
- 2026-03-22 10:09 KST: Added the missing `@ui-public-note-taste` tag to the dedicated Playwright spec, refreshed the public note desktop/mobile snapshots, and confirmed `npm run test:e2e -- --grep @ui-public-note-taste` passes locally.
- 2026-03-22T01:13:05.738Z: automatically promoted after deterministic checks and evaluator approval.
