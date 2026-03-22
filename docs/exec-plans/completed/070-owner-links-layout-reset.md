# Owner links layout reset

```json taskmeta
{
  "id": "070-owner-links-layout-reset",
  "title": "Owner links layout reset",
  "order": 70,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "071-owner-session-continuity",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/link-capture.md",
    "docs/product-specs/owner-workspace-density.md",
    "docs/design-docs/owner-workspace-density.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-owner-links-layout"
  ],
  "required_files": [
    "src/app/app/links/page.tsx",
    "src/app/globals.css",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The saved-links list is still compressed beside the short static capture form.",
    "The growing list still leaves wasted dead space under the capture panel.",
    "The reset harms the add-link workflow or mobile usability."
  ],
  "completed_at": "2026-03-22T03:23:44.591Z"
}
```

## Objective

Restructure the owner links page so the saved-links list gets the dominant growing layout space.

## Scope

- owner links page layout composition
- relationship between capture form and saved-links list
- responsive behavior of the links page

## Out of scope

- link capture behavior changes
- publishing logic
- dashboard overview layout

## Exit criteria

1. The saved-links list gets the dominant continuous space on desktop.
2. The short capture form no longer wastes a tall adjacent column.
3. Mobile remains straightforward and touch-friendly.
4. `npm run test:e2e -- --grep @ui-owner-links-layout` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-owner-links-layout`

## Evaluator notes

Promote only when the links surface scales naturally as the saved-links list grows.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-22 12:19 KST: Read the required docs, inspected the current links route, and confirmed the existing desktop layout still pinned the short capture form beside the growing saved-links list.
- 2026-03-22 12:19 KST: Reset `/app/links` so the capture form stays compact above the list, added route-specific capture-field spacing for desktop/mobile, and tagged the owner-links Playwright coverage with `@ui-owner-links-layout`.
- 2026-03-22T03:23:44.591Z: automatically promoted after deterministic checks and evaluator approval.
