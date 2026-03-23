# Site settings UI

```json taskmeta
{
  "id": "081-site-settings-ui",
  "title": "Site settings UI",
  "order": 81,
  "status": "completed",
  "promotion_mode": "standard",
  "next_task_on_success": "082-public-showroom-clickable-media",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/workspace-settings.md",
    "docs/design-docs/site-configuration-architecture.md",
    "docs/design-docs/owner-workspace-density.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep settings",
    "npm run verify"
  ],
  "required_files": [
    "src/app/app",
    "src/features/navigation",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The settings route feels like an isolated admin page rather than part of the owner workspace.",
    "Saved title/description changes do not actually propagate to the shell surfaces they claim to control.",
    "Demo users can mutate settings."
  ],
  "completed_at": "2026-03-23T03:40:05.762Z"
}
```

## Objective

Expose the owner-facing settings surface for title and description and apply those values across the shipped shell branding.

## Scope

- `/app/settings` route
- owner navigation entry
- owner form for title and description
- demo-user read-only handling
- site-wide branding propagation

## Out of scope

- delete flows
- public showroom image behavior
- public note detail metadata placement

## Exit criteria

1. The owner can edit title and description from the workspace settings route.
2. The saved values appear where the current fixed service branding is shown.
3. Demo users can inspect but not save settings.
4. `npm run test:e2e -- --grep settings` passes.
5. `npm run verify` passes.

## Required checks

- `npm run test:e2e -- --grep settings`
- `npm run verify`

## Evaluator notes

Promote only when the settings surface feels native to the owner workspace and the branding propagation is real, not partial.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-23T03:27:13.746Z: restored as current task after 080-site-settings-foundation promotion.
- 2026-03-23T03:31:39Z: Audited the existing settings route and shared branding reads. Confirmed the owner nav entry, `/app/settings` surface, demo-user UI disablement, and root-shell branding propagation were already implemented from the foundation wave.
- 2026-03-23T03:31:39Z: Added dedicated Playwright coverage in `tests/e2e/settings.spec.ts` for owner save flow, public/private shell branding propagation, browser metadata updates, and demo-user read-only enforcement including blocked direct server-action submission.
- 2026-03-23T03:31:39Z: Updated the product/design index docs to mark workspace settings and site-configuration architecture as confirmed after the shipped UI and task-specific E2E contract passed.
- 2026-03-23T03:35:10Z: `npm run test:e2e -- --grep settings` and `npm run verify` both passed after adding cleanup to the new settings E2E so later UI snapshots return to the default seeded branding state.
- 2026-03-23T03:40:05.762Z: automatically promoted after deterministic checks and evaluator approval.
