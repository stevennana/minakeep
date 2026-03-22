# Demo write protection

```json taskmeta
{
  "id": "075-demo-write-protection",
  "title": "Demo write protection",
  "order": 75,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "076-demo-docker-and-hardening",
  "prompt_docs": [
    "AGENTS.md",
    "docs/SECURITY.md",
    "docs/product-specs/demo-workspace-user.md",
    "docs/design-docs/workspace-auth-roles.md",
    "docs/product-specs/note-authoring.md",
    "docs/product-specs/link-capture.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @demo-user"
  ],
  "required_files": [
    "src/app/app",
    "src/app/api",
    "src/features",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Any server-side mutation path still succeeds for the demonstration user.",
    "The implementation depends on hidden buttons alone rather than authz checks.",
    "Read-only protection weakens owner or public behavior."
  ]
}
```

## Objective

Reject all data mutations for the demonstration user at the server boundary.

## Scope

- note create/update/publish/unpublish/retry protection
- link create/publish/unpublish/retry/favicon-refresh protection
- note-image upload and other mutation-path protection

## Out of scope

- broader role system beyond owner vs demo
- new public product features

## Exit criteria

1. Demo-user write attempts are rejected server-side across all covered mutation paths.
2. Demo-user read access still works.
3. Owner write paths remain functional.
4. `npm run test:e2e -- --grep @demo-user` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @demo-user`

## Evaluator notes

Promote only when the demo mode is genuinely read-only even under direct request attempts.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-22 14:47:51 KST: Added a shared writable-session guard for note and link server actions so demo-authenticated mutation attempts are rejected before any repository or enrichment work runs.
- 2026-03-22 14:47:51 KST: Tightened `/api/notes/images` to return `403` for demo uploads and expanded `@demo-user` E2E coverage to replay real server-action payloads for note/link create, update, publish, unpublish, retry, favicon refresh, and note-image upload without allowing stored data to change.
