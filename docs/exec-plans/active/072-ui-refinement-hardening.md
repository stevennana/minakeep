# UI refinement hardening

```json taskmeta
{
  "id": "072-ui-refinement-hardening",
  "title": "UI refinement hardening",
  "order": 72,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/ui-progressive-disclosure.md",
    "docs/product-specs/public-showroom-search.md",
    "docs/product-specs/owner-workspace-density.md",
    "docs/product-specs/owner-session-continuity.md",
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
    "Docs still describe superseded verbose UI or broken layout and session behavior.",
    "Responsive or screenshot regressions remain around the refined surfaces.",
    "The fixes are technically present but still feel cluttered or awkward in the captured UI."
  ]
}
```

## Objective

Reconcile docs, screenshots, and regression coverage after the refinement wave lands.

## Scope

- doc alignment
- screenshot and responsive regression protection
- final cleanup for information density, owner layout, links layout, and session continuity

## Out of scope

- new product features beyond the agreed refinements
- major redesign beyond the targeted fixes

## Exit criteria

1. Docs match the shipped refinement behavior accurately.
2. The targeted refinements are covered by deterministic regression checks.
3. Desktop and mobile screenshots remain stable after the wave.
4. `npm run test:e2e -- --grep @ui-refinement-hardening` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-refinement-hardening`

## Evaluator notes

Promote only when the refinement wave is protected by regression coverage and the product truth is updated.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-22 12:36 KST: Expanded `@ui-refinement-hardening` coverage to include the shipped progressive-disclosure, public-search, owner-links-layout, and owner-session-continuity surfaces instead of replaying only the owner dashboard slice.
- 2026-03-22 12:36 KST: Restored desktop/mobile screenshot assertions for the links surface, refreshed the links snapshot baselines to the current shipped layout, updated the owner-workspace-density spec to describe the stacked capture-and-list behavior, and passed `npm run test:e2e -- --grep @ui-refinement-hardening` plus `npm run verify`.
