# Public showroom shell cleanup

```json taskmeta
{
  "id": "034-public-showroom-shell-cleanup",
  "title": "Public showroom shell cleanup",
  "order": 34,
  "status": "queued",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "035-public-showroom-title-search",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-home-showroom.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-public-home-shell"
  ],
  "required_files": [
    "src/app/page.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": []
}
```

## Objective

Remove the public “Owner entrance / Private origin” side section and simplify the homepage shell around the mixed showroom.

## Scope

- remove the old owner-entrance side section
- keep the top owner login entry as the only owner call-to-action on the public page
- simplify public framing around the mixed feed

## Out of scope

- public search implementation
- link publishing logic
- typography-wide hierarchy tuning

## Exit criteria

1. The old owner-entrance side section is gone.
2. The public page still provides owner login via the top navigation only.
3. `npm run test:e2e -- --grep @ui-public-home-shell` passes with desktop/mobile screenshots, visible hierarchy anchors, and accessibility checks.
4. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-public-home-shell`

## Evaluator notes

Promote when the deterministic UI checks pass and the public shell is cleaner without losing core navigation clarity.

## Progress log

- Start here. Append timestamped progress notes as work lands.
