# Owner shell density reset

```json taskmeta
{
  "id": "025-owner-shell-density-reset",
  "title": "Owner shell density reset",
  "order": 25,
  "status": "queued",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "026-owner-dashboard-density",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/owner-workspace-density.md",
    "docs/design-docs/owner-workspace-density.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-owner-shell"
  ],
  "required_files": [
    "src/app/app/layout.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": []
}
```

## Objective

Introduce the tighter owner-shell structure for desktop and mobile before route-specific owner pages are redesigned.

## Scope

- slim down the owner-frame proportions
- prefer a tighter structural shell and navigation hierarchy
- keep mobile collapse behavior clear

## Out of scope

- dashboard content density details
- note editor density
- secondary owner surfaces

## Exit criteria

1. The owner shell feels materially tighter on desktop.
2. Navigation remains clear on both desktop and mobile.
3. `npm run test:e2e -- --grep @ui-owner-shell` passes with desktop/mobile screenshots, visible nav/actions, and accessibility checks.
4. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-owner-shell`

## Evaluator notes

Promote when the deterministic UI checks pass and the shell sets up later owner-page density work instead of remaining hero-heavy.

## Progress log

- Start here. Append timestamped progress notes as work lands.
