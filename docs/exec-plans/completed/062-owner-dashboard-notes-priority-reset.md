# Owner dashboard notes priority reset

```json taskmeta
{
  "id": "062-owner-dashboard-notes-priority-reset",
  "title": "Owner dashboard notes priority reset",
  "order": 62,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "063-ui-refinement-hardening",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/owner-workspace-density.md",
    "docs/design-docs/owner-workspace-density.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-owner-notes-priority"
  ],
  "required_files": [
    "src/app/app/page.tsx",
    "src/app/globals.css",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The owner dashboard still spends prime desktop width on a route-promotion or owner-tools block instead of Notes.",
    "Removing the block makes navigation or adjacent routes unclear.",
    "The Notes surface does not materially gain usable space."
  ],
  "completed_at": "2026-03-22T02:14:18.920Z"
}
```

## Objective

Reclaim prime desktop dashboard space for the Notes section by removing or demoting the competing owner-tools block.

## Scope

- owner dashboard composition on desktop
- note-list space allocation
- supporting route-entry placement after the block is removed or demoted

## Out of scope

- owner shell navigation changes
- note editor changes
- public showroom layout

## Exit criteria

1. The Notes section gains visibly more prime desktop space.
2. The removed/demoted owner-tools block no longer competes with Notes in the main dashboard view.
3. Navigation to links, tags, and search remains clear.
4. `npm run test:e2e -- --grep @ui-owner-notes-priority` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-owner-notes-priority`

## Evaluator notes

Promote only when the dashboard feels more note-first without reducing owner clarity.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-22 11:04 KST: Removed the standalone owner-tools aside from `/app`, moved links/tags/search access into a compact dashboard shortcut row inside the Notes panel, and widened the desktop note-row content split so Notes owns the main dashboard lane.
- 2026-03-22 11:11 KST: Added `@ui-owner-notes-priority` coverage, refreshed the affected owner dashboard and owner-shell snapshots, and passed `npm run test:e2e -- --grep @ui-owner-notes-priority` plus `npm run verify`.
- 2026-03-22T02:14:18.920Z: automatically promoted after deterministic checks and evaluator approval.
