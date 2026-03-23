# Next wave hardening

```json taskmeta
{
  "id": "086-next-wave-hardening",
  "title": "Next wave hardening",
  "order": 86,
  "status": "planned",
  "promotion_mode": "standard",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "docs/SECURITY.md",
    "docs/RELIABILITY.md",
    "docs/FRONTEND.md",
    "docs/product-specs/workspace-settings.md",
    "docs/product-specs/owner-content-deletion.md",
    "docs/product-specs/public-home-showroom.md",
    "docs/product-specs/public-note-reading.md",
    "docs/product-specs/docker-packaging.md"
  ],
  "required_commands": [
    "npm run verify"
  ],
  "required_files": [
    "docs",
    "tests/e2e",
    "tests/unit"
  ],
  "human_review_triggers": [
    "Docs drift from the shipped delete/settings/reading/showroom/upgrade behavior.",
    "Regression coverage misses one of the new feature fronts.",
    "The hardening pass broadens into unrelated product work instead of closing the wave cleanly."
  ]
}
```

## Objective

Harden the full wave by aligning docs, tests, and regression coverage after the feature slices land.

## Scope

- doc alignment across the full wave
- regression coverage review
- cleanup of any wave-level drift

## Out of scope

- new feature fronts beyond this tranche

## Exit criteria

1. The shipped docs match the final behavior across settings, delete, public reading, public showroom, and upgrade safety.
2. Regression coverage protects the new feature fronts.
3. `npm run verify` passes.

## Required checks

- `npm run verify`

## Evaluator notes

Promote only when the full wave reads as one coherent shipped tranche rather than several partially integrated slices.

## Progress log

- Start here. Append timestamped progress notes as work lands.
