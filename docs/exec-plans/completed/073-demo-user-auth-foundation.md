# Demo user auth foundation

```json taskmeta
{
  "id": "073-demo-user-auth-foundation",
  "title": "Demo user auth foundation",
  "order": 73,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "074-demo-workspace-read-only-shell",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/SECURITY.md",
    "docs/RELIABILITY.md",
    "docs/product-specs/demo-workspace-user.md",
    "docs/design-docs/workspace-auth-roles.md",
    "docs/product-specs/docker-packaging.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @demo-user"
  ],
  "required_files": [
    "src/auth.ts",
    "src/lib/auth",
    ".env.example",
    ".env.compose.example",
    "docker-compose.yml",
    "README.md",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The demo role only exists in UI and is not represented in server-side auth or runtime config.",
    "Docker/env docs drift from the shipped auth contract.",
    "The demo role changes owner behavior when demo credentials are absent."
  ],
  "completed_at": "2026-03-22T05:13:13.210Z"
}
```

## Objective

Introduce the demonstration-user role and its environment contract across auth, runtime, and Docker/operator surfaces.

## Scope

- auth role contract
- env and seed contract for demo credentials
- Docker and README contract updates

## Out of scope

- read-only UI treatment across all routes
- complete server-side write blocking for all actions

## Exit criteria

1. Demo credentials are optional and documented.
2. The app can authenticate a demonstration user without changing owner-only startup when demo credentials are absent.
3. Docker/operator docs reflect the new env contract.
4. `npm run test:e2e -- --grep @demo-user` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @demo-user`

## Evaluator notes

Promote only when the demo-user role is a real runtime concept, not a loose UI idea.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-22 14:06 KST: Added an `owner | demo` auth role contract in the NextAuth session/JWT flow, made demo credentials optional env-only runtime config with both-or-neither validation, and kept owner seeding as the only SQLite credential persistence path.
- 2026-03-22 14:06 KST: Wired the dashboard auth path to accept a demo session for the landing route, added deterministic Playwright demo credentials plus a new `@demo-user` E2E, and updated env/Compose/README/operator docs for the demo credential contract.
- 2026-03-22 14:10 KST: `npm run test:e2e -- --grep @demo-user` passed, `npm run verify` passed, and the shipped contract still boots owner-only when demo credentials are omitted outside the Playwright test harness.
- 2026-03-22T05:13:13.210Z: automatically promoted after deterministic checks and evaluator approval.
