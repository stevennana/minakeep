# UI hardening and regression

```json taskmeta
{
  "id": "030-ui-hardening-and-regression",
  "title": "UI hardening and regression",
  "order": 30,
  "status": "active",
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
- 2026-03-21 13:24 KST: Added `@ui-regression` to the existing deterministic UI Playwright specs so `npm run test:e2e -- --grep @ui-regression` now replays the full public/private redesign suite with desktop/mobile screenshots, overflow checks, and accessibility structure checks.
- 2026-03-21 13:24 KST: Moved compact panel spacing into the shared `Surface` primitive via `density="compact"` and removed route-level `ui-intro-surface` / `ui-form-surface` styling flags from login, editor, links, tags, and search so reusable primitives remain the styling source of truth.
- 2026-03-21 13:24 KST: Updated the UI verification contract, quality score, Ralph operator README, and tech-debt tracker to reflect the shipped hardening pass and the remaining explicit UI debt.
- 2026-03-21 13:27 KST: Verified the full task contract locally. `npm run test:e2e -- --grep @ui-regression`, `npm run verify`, and `npm run start:smoke` all passed after the primitive and documentation hardening updates.
