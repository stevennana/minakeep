# UI information density reset

```json taskmeta
{
  "id": "067-ui-information-density-reset",
  "title": "UI information density reset",
  "order": 67,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "068-public-search-expanded-row-reset",
  "prompt_docs": [
    "AGENTS.md",
    "docs/PRODUCT_SENSE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/ui-progressive-disclosure.md",
    "docs/design-docs/progressive-disclosure-rules.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-information-density"
  ],
  "required_files": [
    "src/app",
    "src/features",
    "src/app/globals.css",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Screens still force users to read multi-line workflow explanations before using obvious controls.",
    "Critical guidance disappears entirely instead of moving to lighter disclosure.",
    "Internal implementation details remain visible in user-facing copy."
  ]
}
```

## Objective

Reduce redundant explanatory UI across the product and move truly necessary guidance into lighter disclosure patterns.

## Scope

- owner and public helper-copy reduction
- intro-panel and section-copy simplification
- tooltip or lighter-disclosure treatment where guidance is still necessary

## Out of scope

- public search row placement
- owner links page structural layout
- auth/session behavior

## Exit criteria

1. Obvious actions are no longer surrounded by repetitive explanatory text.
2. Internal implementation details are removed from user-facing UI.
3. Necessary guidance remains available in a lighter form where appropriate.
4. `npm run test:e2e -- --grep @ui-information-density` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-information-density`

## Evaluator notes

Promote only when the product feels more intuitive and less talkative without becoming ambiguous.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-22 11:51 KST: Removed implementation-heavy login and workspace helper copy, collapsed owner/public intro text into compact status rows, added a reusable disclosure primitive for optional guidance, and added task-specific Playwright coverage for the lighter-disclosure expectations.
