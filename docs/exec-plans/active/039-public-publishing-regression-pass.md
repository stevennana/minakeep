# Public publishing regression pass

```json taskmeta
{
  "id": "039-public-publishing-regression-pass",
  "title": "Public publishing regression pass",
  "order": 39,
  "status": "active",
  "next_task_on_success": "040-public-wave-hardening",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-note-publishing.md",
    "docs/product-specs/public-link-publishing.md",
    "docs/product-specs/public-showroom-search.md"
  ],
  "required_commands": [
    "npm run verify"
  ],
  "required_files": [
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The mixed publishing model regresses existing note publishing behavior.",
    "Public search or public link behavior leaks unpublished content."
  ]
}
```

## Objective

Verify note publishing, link publishing, public mixed feed behavior, and public title search together as one coherent public model.

## Scope

- note publishing regression checks
- link publishing regression checks
- mixed public showroom behavior
- public title-search regression checks

## Out of scope

- further visual redesign beyond bug-fix level polish
- owner workflow redesign unrelated to public publishing/search

## Exit criteria

1. Existing note publishing still works.
2. Link publishing, public search, and public navigation all behave coherently together.
3. `npm run verify` passes.

## Required checks

- `npm run verify`

## Evaluator notes

Promote only when the new public model works as one coherent system instead of a stack of independent tweaks.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 15:48:12 KST: Reviewed the task docs plus the repo-required architecture/product/frontend docs, audited the mixed public publishing implementation and E2E coverage under `tests/e2e`, and ran `npm run verify` successfully. The regression suite confirmed note publishing, link publishing, mixed public showroom behavior, public title-only search, and related navigation as one coherent public model without requiring code changes in this task.
