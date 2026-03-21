# Public home wave hardening

```json taskmeta
{
  "id": "044-public-home-wave-hardening",
  "title": "Public home wave hardening",
  "order": 44,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-home-showroom.md",
    "docs/product-specs/public-showroom-search.md",
    "docs/design-docs/public-home-first-screen-density.md"
  ],
  "required_commands": [
    "npm run verify"
  ],
  "required_files": [
    "docs",
    "src/app/page.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Docs and shipped homepage behavior drift apart.",
    "The public-home copy or search chrome still leaves unresolved density debt."
  ]
}
```

## Objective

Reconcile docs, debt tracking, and any remaining public-home polish after the narrow density slices land.

## Scope

- docs alignment for the refined public-home behavior
- debt cleanup related to homepage density and chrome
- final regression check for the compact public-home shell

## Out of scope

- new publishing features
- owner-workspace redesign
- broader search-product changes

## Exit criteria

1. The docs describe the shipped collapsed-search and first-screen-showroom behavior accurately.
2. Remaining public-home density debt is either resolved or explicitly tracked.
3. `npm run verify` passes.

## Required checks

- `npm run verify`

## Evaluator notes

Promote only when the docs and task history match the shipped public-home behavior and no hidden homepage density drift remains.

## Progress log

- Start here. Append timestamped progress notes as work lands.
