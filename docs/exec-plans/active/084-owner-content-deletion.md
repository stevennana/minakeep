# Owner content deletion

```json taskmeta
{
  "id": "084-owner-content-deletion",
  "title": "Owner content deletion",
  "order": 84,
  "status": "planned",
  "promotion_mode": "standard",
  "next_task_on_success": "085-self-host-upgrade-safety",
  "prompt_docs": [
    "AGENTS.md",
    "docs/SECURITY.md",
    "docs/RELIABILITY.md",
    "docs/product-specs/owner-content-deletion.md",
    "docs/product-specs/note-authoring.md",
    "docs/product-specs/link-capture.md",
    "docs/design-docs/owner-workspace-density.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep delete",
    "npm run verify"
  ],
  "required_files": [
    "src/app/app",
    "src/features/notes",
    "src/features/links",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Published content can still be deleted directly.",
    "Delete lacks an explicit permanent-removal confirmation step.",
    "The implementation introduces a hidden trash/archive flow instead of the documented hard delete."
  ]
}
```

## Objective

Add permanent delete for unpublished notes and links with explicit confirmation and server-side unpublished-only enforcement.

## Scope

- note delete
- link delete
- confirmation UX
- demo-user and published-content guards

## Out of scope

- trash/archive/restore
- settings and public-reading changes

## Exit criteria

1. Unpublished notes can be permanently deleted after confirmation.
2. Unpublished links can be permanently deleted after confirmation.
3. Published items cannot be deleted until unpublished first.
4. Demo users cannot delete content.
5. `npm run test:e2e -- --grep delete` passes.
6. `npm run verify` passes.

## Required checks

- `npm run test:e2e -- --grep delete`
- `npm run verify`

## Evaluator notes

Promote only when destructive behavior is explicit, guarded, and clearly permanent.

## Progress log

- Start here. Append timestamped progress notes as work lands.
