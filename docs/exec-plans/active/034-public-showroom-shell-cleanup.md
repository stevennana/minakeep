# Public showroom shell cleanup

```json taskmeta
{
  "id": "034-public-showroom-shell-cleanup",
  "title": "Public showroom shell cleanup",
  "order": 34,
  "status": "active",
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
- 2026-03-21 15:00 KST: Read the task contract, public-home spec, frontend guidance, and UI verification contract; confirmed the homepage still shipped both the `Private origin` rail and the `Owner entrance` side panel.
- 2026-03-21 15:06 KST: Collapsed the public homepage shell to a single showroom surface in `src/app/page.tsx`, keeping the archive framing inline and leaving the top navigation as the only owner login entry.
- 2026-03-21 15:06 KST: Updated scoped Playwright coverage to assert the removed complementary panel is gone and to target the top navigation login link for the public home shell/system checks.
- 2026-03-21 15:12 KST: Regenerated the affected deterministic Playwright baselines for `ui-home-shell`, `ui-home-grid`, and `ui-system` after the public shell simplification.
- 2026-03-21 15:18 KST: `npm run test:e2e -- --grep @ui-public-home-shell` passed.
- 2026-03-21 15:22 KST: `npm run verify` passed, including the full E2E suite and startup smoke.
