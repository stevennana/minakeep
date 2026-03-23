# Public note reading top summary

```json taskmeta
{
  "id": "083-public-note-reading-top-summary",
  "title": "Public note reading top summary",
  "order": 83,
  "status": "planned",
  "promotion_mode": "standard",
  "next_task_on_success": "084-owner-content-deletion",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-note-reading.md",
    "docs/design-docs/public-surface-taste-rules.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep public-note",
    "npm run verify"
  ],
  "required_files": [
    "src/app/notes",
    "src/app/globals.css",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "AI summary/tags still sit below the body or otherwise fail to orient the reader early.",
    "Title wrapping still feels prematurely narrow on wide note pages.",
    "The change makes AI metadata more visually dominant than the authored note body."
  ]
}
```

## Objective

Move AI support metadata above the public note body and improve title fitting on the public detail page.

## Scope

- top-of-page AI summary/tags placement
- title-fit and line-wrapping polish
- desktop/mobile note-detail regression coverage

## Out of scope

- public showroom card click behavior
- owner delete/settings work

## Exit criteria

1. AI summary and AI tags appear beneath the title and above the body.
2. Title wrapping feels intentional and uses the available width before breaking into more lines.
3. Public note reading remains calm and body-first after the layout change.
4. `npm run test:e2e -- --grep public-note` passes.
5. `npm run verify` passes.

## Required checks

- `npm run test:e2e -- --grep public-note`
- `npm run verify`

## Evaluator notes

Promote only when the top-of-page metadata improves orientation without turning the note detail page into a metadata-first surface.

## Progress log

- Start here. Append timestamped progress notes as work lands.
