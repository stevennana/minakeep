# Owner dashboard notes priority reset

```json taskmeta
{
  "id": "069-owner-dashboard-notes-priority-reset",
  "title": "Owner dashboard notes priority reset",
  "order": 69,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "070-owner-links-layout-reset",
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
    "Links, Tags, and Search remain repeated beside the Notes heading even though the sidebar already exposes them.",
    "The Notes surface does not materially gain usable space."
  ],
  "completed_at": "2026-03-22T03:15:46.863Z"
}
```

## Objective

Reclaim prime desktop dashboard space for the Notes section by removing the competing owner-tools block and redundant quick-route links.

## Scope

- owner dashboard composition on desktop
- note-list space allocation
- removal of redundant `Links`, `Tags`, and `Search` shortcuts inside the Notes surface

## Out of scope

- owner shell navigation changes
- note editor changes
- public showroom layout

## Exit criteria

1. The Notes section gains visibly more prime desktop space.
2. The removed or demoted owner-tools block no longer competes with Notes in the main dashboard view.
3. Redundant `Links`, `Tags`, and `Search` shortcuts are removed from the Notes area.
4. `npm run test:e2e -- --grep @ui-owner-notes-priority` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-owner-notes-priority`

## Evaluator notes

Promote only when the dashboard feels more note-first without reducing owner clarity.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-22 12:10 KST: Re-read the dashboard/frontend/task docs, confirmed the owner-tools side panel was already gone, and identified the remaining Notes-header shortcut nav as the scope blocker.
- 2026-03-22 12:10 KST: Removed the in-panel `Links`, `Tags`, and `Search` shortcuts from `/app`, deleted the related dashboard shortcut CSS, and updated owner dashboard UI assertions to require a notes-only main surface.
- 2026-03-22 12:13 KST: Verified the reset with `npm run test:e2e -- --grep @ui-owner-notes-priority`, refreshed the owner-dashboard screenshots, and passed the full `npm run verify` gate including startup smoke.
- 2026-03-22T03:15:46.863Z: automatically promoted after deterministic checks and evaluator approval.
