# Public wave hardening

```json taskmeta
{
  "id": "040-public-wave-hardening",
  "title": "Public wave hardening",
  "order": 40,
  "status": "queued",
  "next_task_on_success": null,
  "prompt_docs": [
    "AGENTS.md",
    "docs/QUALITY_SCORE.md",
    "docs/RELIABILITY.md",
    "docs/SECURITY.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run start:smoke"
  ],
  "required_files": [
    "scripts/ralph/README.md"
  ],
  "human_review_triggers": [
    "The hardening task expands into fresh feature work.",
    "Public publishing/search boundaries are still under-documented."
  ]
}
```

## Objective

Stabilize the mixed public publishing/search wave and keep the docs, reliability, and security posture aligned.

## Scope

- close obvious public-wave inconsistencies
- reconcile docs and operator guidance with the new public model
- keep remaining debt explicit

## Out of scope

- new feature fronts
- new public content types
- new search modes

## Exit criteria

1. `npm run verify` passes.
2. `npm run start:smoke` passes.
3. Docs, reliability, and security guidance match the shipped public wave.
4. Remaining debt is explicit.

## Required checks

- `npm run verify`
- `npm run start:smoke`

## Evaluator notes

Promote only when the mixed public publishing/search wave is stable enough for the next tranche.

## Progress log

- Start here. Append timestamped progress notes as work lands.
