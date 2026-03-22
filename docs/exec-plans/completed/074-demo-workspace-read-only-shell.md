# Demo workspace read-only shell

```json taskmeta
{
  "id": "074-demo-workspace-read-only-shell",
  "title": "Demo workspace read-only shell",
  "order": 74,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "075-demo-write-protection",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/demo-workspace-user.md",
    "docs/design-docs/workspace-auth-roles.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @demo-user"
  ],
  "required_files": [
    "src/app/login",
    "src/app/app",
    "src/features",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The demo user cannot actually inspect the real owner workspace routes.",
    "Read-only mode is unclear or visually misleading.",
    "The shell diverges into a fake demo site instead of showing the actual product surfaces."
  ],
  "completed_at": "2026-03-22T05:37:17.112Z"
}
```

## Objective

Let the demonstration user enter the real owner workspace with read-only treatment across the shell and route surfaces.

## Scope

- login flow for demo credentials
- read-only route access across `/app`, `/app/links`, `/app/tags`, `/app/search`, and note-edit views
- visible read-only treatment for mutating controls

## Out of scope

- full server-side write blocking for every action
- owner account behavior changes

## Exit criteria

1. Demo login reaches the owner workspace routes.
2. Demo UI clearly reads as read-only.
3. Existing owner workflow remains intact.
4. `npm run test:e2e -- --grep @demo-user` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @demo-user`

## Evaluator notes

Promote only when the demo user can inspect the real workspace without being mistaken for the owner.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-22 14:25 KST: Enabled demo-role access to `/app`, `/app/links`, `/app/tags`, `/app/search`, and note edit routes while keeping owner-only write entry points unchanged.
- 2026-03-22 14:25 KST: Added shell, login, dashboard, links, search, and note-editor read-only treatment so demo sessions are labeled clearly and mutating controls render disabled.
- 2026-03-22 14:25 KST: Expanded `@demo-user` Playwright coverage to verify demo login, route traversal, and disabled mutation affordances across the required workspace surfaces.
- 2026-03-22T05:37:17.112Z: automatically promoted after deterministic checks and evaluator approval.
