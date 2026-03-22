# UI refinement hardening

```json taskmeta
{
  "id": "063-ui-refinement-hardening",
  "title": "UI refinement hardening",
  "order": 63,
  "status": "planned",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-showroom-search.md",
    "docs/product-specs/owner-workspace-density.md",
    "docs/design-docs/public-home-first-screen-density.md",
    "docs/design-docs/owner-workspace-density.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-refinement-hardening"
  ],
  "required_files": [
    "docs",
    "src",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Docs still describe the broken search/dashboard layout after the refinements ship.",
    "Responsive or screenshot regressions remain around the public search row or owner dashboard notes layout.",
    "The fixes pass narrowly but still feel visually awkward in the screenshots."
  ]
}
```

## Objective

Reconcile docs, screenshots, and regression coverage after the public-search and owner-dashboard layout refinements land.

## Scope

- doc alignment
- focused screenshot and responsive regression protection
- remaining UI refinement cleanup for the two targeted layout fixes

## Out of scope

- new public search features
- broader owner dashboard redesign beyond notes-priority reclaim

## Exit criteria

1. Docs match the shipped search-row and owner-dashboard layout behavior.
2. The targeted layout refinements are covered by deterministic regression checks.
3. Desktop and mobile screenshots are stable after the fixes.
4. `npm run test:e2e -- --grep @ui-refinement-hardening` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-refinement-hardening`

## Evaluator notes

Promote only when the layout fixes are protected by stable regression coverage and the docs reflect the new truth.

## Progress log

- Start here. Append timestamped progress notes as work lands.
