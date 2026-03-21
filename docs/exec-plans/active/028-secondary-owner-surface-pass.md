# Secondary owner surface pass

```json taskmeta
{
  "id": "028-secondary-owner-surface-pass",
  "title": "Secondary owner surface pass",
  "order": 28,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "029-mobile-responsive-polish",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/owner-workspace-density.md",
    "docs/product-specs/responsive-ui-behavior.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-owner-secondary"
  ],
  "required_files": [
    "src/app/app/links/page.tsx",
    "src/app/app/tags/page.tsx",
    "src/app/app/search/page.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": []
}
```

## Objective

Bring links, tags, and search into the same tighter owner-system rhythm as the redesigned dashboard and editor.

## Scope

- align secondary owner surfaces with the new design system
- reduce oversized cards and spacing
- keep scanning and retrieval clear

## Out of scope

- homepage work
- public note page work
- final mobile-specific polish beyond what these surfaces immediately need

## Exit criteria

1. Links, tags, and search feel like part of the same owner workspace family.
2. Desktop density improves without reducing retrieval clarity.
3. `npm run test:e2e -- --grep @ui-owner-secondary` passes with desktop/mobile screenshots, visible retrieval anchors, and accessibility checks.
4. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-owner-secondary`

## Evaluator notes

Promote when the deterministic UI checks pass and the secondary owner routes no longer feel like oversized leftovers from the old UI.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 13:00 KST: Reworked `/app/links`, `/app/tags`, and `/app/search` into the tighter owner-system language using compact intro blocks, denser panels, dashboard-style note rows, and slimmer link/tag/search layouts without changing route logic.
- 2026-03-21 13:00 KST: Added deterministic `@ui-owner-secondary` Playwright coverage with seeded owner content, desktop/mobile screenshots, hierarchy checks, overflow guards, and accessibility assertions.
- 2026-03-21 13:00 KST: Verified `npm run test:e2e -- --grep @ui-owner-secondary` and `npm run verify` both pass on the final implementation.
