# Public link new-tab behavior

```json taskmeta
{
  "id": "036-public-link-new-tab-behavior",
  "title": "Public link new-tab behavior",
  "order": 36,
  "status": "queued",
  "next_task_on_success": "037-ui-hierarchy-softening",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-link-publishing.md",
    "docs/SECURITY.md"
  ],
  "required_commands": [
    "npm run verify"
  ],
  "required_files": [
    "src/app/page.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Published links still replace the current page instead of opening a new tab.",
    "Public link behavior weakens the safe-URL contract."
  ]
}
```

## Objective

Ensure published link cards open the saved external URL in a new tab with safe public behavior.

## Scope

- external-link new-tab behavior
- public link-card affordance for external navigation
- preserve safe protocol handling and public/private boundaries

## Out of scope

- public link detail pages
- typography tuning
- owner shell changes

## Exit criteria

1. Clicking a published link card opens the external destination in a new tab.
2. Public link behavior stays consistent with the existing safe URL rules.
3. `npm run verify` passes.

## Required checks

- `npm run verify`

## Evaluator notes

Promote only when published links behave like lightweight public reference items rather than pseudo-note pages.

## Progress log

- Start here. Append timestamped progress notes as work lands.
