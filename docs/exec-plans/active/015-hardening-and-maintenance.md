# Hardening and maintenance

```json taskmeta
{
  "id": "015-hardening-and-maintenance",
  "title": "Hardening and maintenance",
  "order": 15,
  "status": "queued",
  "next_task_on_success": null,
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
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
    "The task expands into broad feature work.",
    "Reliability or security docs do not match the actual code."
  ]
}
```

## Objective

Close the reliability, security, and automation gaps after the minakeep feature slices land.

## Scope

- reconcile docs and implementation drift
- keep the deterministic checks healthy
- record remaining debt explicitly

## Out of scope

- major new product features
- unrelated infrastructure expansion

## Exit criteria

1. `npm run verify` passes.
2. `npm run start:smoke` passes.
3. Reliability and security docs match the implementation.
4. Remaining debt is explicit.

## Required checks

- npm run verify
- npm run start:smoke

## Evaluator notes

Promote only when the repository is ready for longer unattended Ralph-loop runs under the current task contract.
Do not promote if the production-style startup path still fails for normal repo reasons such as missing runtime preparation.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- Note when existing partial implementations were found and reused instead of replaced.
