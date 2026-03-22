# Demo Docker and hardening

```json taskmeta
{
  "id": "076-demo-docker-and-hardening",
  "title": "Demo Docker and hardening",
  "order": 76,
  "status": "planned",
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
  ]
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
