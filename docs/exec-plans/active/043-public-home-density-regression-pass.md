# Public home density regression pass

```json taskmeta
{
  "id": "043-public-home-density-regression-pass",
  "title": "Public home density regression pass",
  "order": 43,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "044-public-home-wave-hardening",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-home-showroom.md",
    "docs/product-specs/public-showroom-search.md",
    "docs/design-docs/public-home-first-screen-density.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-public-home-density"
  ],
  "required_files": [
    "src/app/page.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": []
}
```

## Objective

Prove that the new public-home density rules stay stable across responsive and accessibility checks.

## Scope

- desktop and mobile screenshot stability for the public homepage
- collapsed and expanded search-state coverage
- accessibility coverage for the compact public-home chrome

## Out of scope

- new homepage features
- owner-surface regressions outside shared typography and chrome

## Exit criteria

1. The public homepage remains readable and content-first at `1440x900` and `390x844`.
2. UI checks cover both the collapsed search state and the explicit expanded state.
3. Accessibility checks pass for the compact search affordance and showroom-first layout.
4. `npm run test:e2e -- --grep @ui-public-home-density` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-public-home-density`

## Evaluator notes

Promote only when the new density changes are protected by deterministic responsive and accessibility coverage.

## Progress log

- Start here. Append timestamped progress notes as work lands.
