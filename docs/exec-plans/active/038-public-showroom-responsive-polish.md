# Public showroom responsive polish

```json taskmeta
{
  "id": "038-public-showroom-responsive-polish",
  "title": "Public showroom responsive polish",
  "order": 38,
  "status": "queued",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "039-public-publishing-regression-pass",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-home-showroom.md",
    "docs/product-specs/public-showroom-search.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-public-showroom"
  ],
  "required_files": [
    "src/app/page.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": []
}
```

## Objective

Keep the mixed public showroom and unified search clean on both desktop and mobile.

## Scope

- responsive mixed feed behavior
- responsive search bar behavior
- no overflow or collapsed-layout regressions on the public homepage

## Out of scope

- owner workspace redesign
- new public route additions
- additional search capabilities

## Exit criteria

1. The mixed public showroom remains easy to scan on desktop and mobile.
2. The unified title-only search bar remains usable and visually clear on mobile.
3. `npm run test:e2e -- --grep @ui-public-showroom` passes with desktop/mobile screenshots and accessibility checks.
4. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-public-showroom`

## Evaluator notes

Promote when the deterministic UI checks pass and the public showroom/search remain clean across breakpoints.

## Progress log

- Start here. Append timestamped progress notes as work lands.
