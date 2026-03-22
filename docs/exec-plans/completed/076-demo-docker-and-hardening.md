# Demo Docker and hardening

```json taskmeta
{
  "id": "076-demo-docker-and-hardening",
  "title": "Demo Docker and hardening",
  "order": 76,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "docs/SECURITY.md",
    "docs/RELIABILITY.md",
    "docs/product-specs/demo-workspace-user.md",
    "docs/product-specs/docker-packaging.md",
    "docs/design-docs/workspace-auth-roles.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @demo-user",
    "docker compose config"
  ],
  "required_files": [
    "README.md",
    "docker-compose.yml",
    ".env.compose.example",
    "docs",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Docker/runtime docs omit the demo-user contract.",
    "Regression coverage misses the read-only guarantee or authenticated demo access path.",
    "Compose config drifts from the documented env contract."
  ],
  "completed_at": "2026-03-22T06:01:00.082Z"
}
```

## Objective

Harden the demo-user wave through Docker/env documentation and regression coverage.

## Scope

- Docker and env-doc alignment
- README/operator guidance
- demo-user regression coverage and cleanup

## Out of scope

- new auth roles beyond owner/demo
- public marketing/demo pages

## Exit criteria

1. Docker and README docs explain the demo-user env contract clearly.
2. Demo-user regression coverage protects both access and read-only enforcement.
3. `docker compose config` passes under the shipped contract.
4. `npm run test:e2e -- --grep @demo-user` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @demo-user`
- `docker compose config`

## Evaluator notes

Promote only when the demo-user feature is documented, protected, and operator-usable.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-22 14:58:13 KST - Tightened the shipped demo-user operator contract across `README.md`, `.env.compose.example`, `docker-compose.yml`, `docs/product-specs/docker-packaging.md`, and `docs/design-docs/workspace-auth-roles.md` so Compose docs now state the both-or-neither demo env rule, the `DEMO_USERNAME != OWNER_USERNAME` requirement, the runtime-only/read-only demo identity, and that optional AI vars may remain unset in the Compose example.
- 2026-03-22 14:58:13 KST - Hardened `tests/e2e/demo-user.spec.ts` by extending the read-only route coverage to published-state surfaces, including the published link `Unpublish unavailable` control and the published note edit surface with read-only inputs plus disabled save/unpublish actions.
- 2026-03-22 14:58:13 KST - Verified the task contract in the current repo state: `docker compose config` passed, `npm run test:e2e -- --grep @demo-user` passed, and `npm run verify` passed.
- 2026-03-22T06:01:00.082Z: automatically promoted after deterministic checks and evaluator approval.
