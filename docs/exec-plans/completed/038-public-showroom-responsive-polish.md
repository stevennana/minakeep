# Public showroom responsive polish

```json taskmeta
{
  "id": "038-public-showroom-responsive-polish",
  "title": "Public showroom responsive polish",
  "order": 38,
  "status": "completed",
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
  "human_review_triggers": [],
  "completed_at": "2026-03-21T06:44:09.168Z"
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
- 2026-03-21 15:46 KST: Read the task contract plus public-home/search/frontend docs, then audited the homepage implementation and existing UI coverage. Confirmed the required `@ui-public-showroom` Playwright slice was missing even though other homepage UI tests existed.
- 2026-03-21 15:46 KST: Added a stable homepage test hook and a small responsive hardening rule (`min-width: 0` on the public homepage/search shell children) to prevent long copy from forcing overflow while keeping the current layout intact.
- 2026-03-21 15:50 KST: Added `tests/e2e/ui-public-showroom.spec.ts` with deterministic desktop/mobile coverage for the mixed note+link feed, unified search bar, overflow checks, accessibility checks, and screenshot baselines under the required `@ui-public-showroom` tag.
- 2026-03-21 15:52 KST: Required checks passed locally: `npm run test:e2e -- --grep @ui-public-showroom` and `npm run verify`.
- 2026-03-21T06:44:09.168Z: automatically promoted after deterministic checks and evaluator approval.
