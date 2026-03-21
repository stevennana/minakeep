# UI hardening and regression

```json taskmeta
{
  "id": "030-ui-hardening-and-regression",
  "title": "UI hardening and regression",
  "order": 30,
  "status": "queued",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": null,
  "prompt_docs": [
    "AGENTS.md",
    "docs/QUALITY_SCORE.md",
    "docs/RELIABILITY.md",
    "docs/DESIGN.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-regression",
    "npm run start:smoke"
  ],
  "required_files": [
    "scripts/ralph/README.md",
    "tests/e2e"
  ],
  "human_review_triggers": []
}
```

## Objective

Stabilize the UI-only redesign wave and keep the reusable design system, responsive behavior, and docs aligned.

## Scope

- close obvious visual inconsistencies
- ensure reusable primitives are actually the styling source of truth
- keep docs and operator guidance aligned with the shipped UI wave
- record remaining UI debt explicitly

## Out of scope

- new product features
- new AI behavior
- a second redesign direction

## Exit criteria

1. `npm run verify` passes.
2. `npm run test:e2e -- --grep @ui-regression` passes with desktop/mobile screenshots, no obvious overflow regressions, and accessibility checks.
3. `npm run start:smoke` passes.
4. Shared primitives, responsive rules, and route styling are aligned.
5. Remaining UI debt is explicit.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-regression`
- `npm run start:smoke`

## Evaluator notes

Promote when the deterministic UI checks pass and the redesigned system feels coherent and maintainable rather than merely different.

## Progress log

- Start here. Append timestamped progress notes as work lands.
