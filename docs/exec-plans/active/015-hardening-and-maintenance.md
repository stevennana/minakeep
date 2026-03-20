# Hardening and maintenance

```json taskmeta
{
  "id": "015-hardening-and-maintenance",
  "title": "Hardening and maintenance",
  "order": 15,
  "status": "active",
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
- 2026-03-20 18:05 KST: Reused the existing `verify`, `start:smoke`, `start:logged`, and Ralph evaluator paths as the baseline, then audited the current startup, auth, and logging behavior against the reliability/security docs before changing code.
- 2026-03-20 18:05 KST: Closed the Playwright artifact logging drift by adding a wrapper server script that honors `MINAKEEP_NEXT_SERVER_LOG`, and reconciled stale hardening copy in the quality, reliability, security, Ralph README, and login-surface docs.
- 2026-03-20 18:08 KST: Confirmed `npm run verify` and `npm run start:smoke` both pass on the updated tree; also confirmed the new Playwright wrapper writes server output when `MINAKEEP_NEXT_SERVER_LOG` is provided, while manual direct wrapper invocations in this sandbox can still hit a local `127.0.0.1:3100` bind restriction outside the required task gates.
