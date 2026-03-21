# Owner dashboard density

```json taskmeta
{
  "id": "026-owner-dashboard-density",
  "title": "Owner dashboard density",
  "order": 26,
  "status": "queued",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "027-editor-and-form-density",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/owner-workspace-density.md",
    "docs/design-docs/owner-workspace-density.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-owner-dashboard"
  ],
  "required_files": [
    "src/app/app/page.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": []
}
```

## Objective

Tighten the owner dashboard so it feels compact and professional without becoming visually cramped.

## Scope

- reduce heading scale and padding
- make note-list density more practical on desktop
- keep AI metadata visible but visually secondary

## Out of scope

- note editor and login forms
- links/tags/search redesign
- homepage work

## Exit criteria

1. The dashboard shows more useful note content without feeling cluttered.
2. Typography and spacing feel more human-scaled than the current implementation.
3. `npm run test:e2e -- --grep @ui-owner-dashboard` passes with desktop/mobile screenshots, visible hierarchy, and accessibility checks.
4. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-owner-dashboard`

## Evaluator notes

Promote when the deterministic UI checks pass and the dashboard reads like a compact tool rather than an oversized card wall.

## Progress log

- Start here. Append timestamped progress notes as work lands.
