# Site settings UI

```json taskmeta
{
  "id": "081-site-settings-ui",
  "title": "Site settings UI",
  "order": 81,
  "status": "planned",
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
  ]
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
