# Owner link publish controls

```json taskmeta
{
  "id": "032-owner-link-publish-controls",
  "title": "Owner link publish controls",
  "order": 32,
  "status": "completed",
  "next_task_on_success": "033-public-mixed-showroom-feed",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-link-publishing.md",
    "docs/product-specs/link-capture.md"
  ],
  "required_commands": [
    "npm run verify"
  ],
  "required_files": [
    "src/app/app/links/page.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Links still cannot be published directly from the owner links manager.",
    "The task drifts into public search or broad visual redesign work."
  ],
  "completed_at": "2026-03-21T05:38:28Z"
}
```

## Objective

Add explicit publish and unpublish controls for links inside the private links manager.

## Scope

- publish/unpublish controls for saved links
- owner-visible status for public versus private links
- preserve private-by-default link creation

## Out of scope

- public homepage search
- public shell cleanup
- typography tuning

## Exit criteria

1. Owners can publish and unpublish links directly from the links manager.
2. Newly created links remain private until explicitly published.
3. `npm run verify` passes.

## Required checks

- `npm run verify`

## Evaluator notes

Promote only when link publishing is as explicit and reliable as note publishing.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 14:38 KST - Marked complete during task `031-public-publishing-foundation` reconciliation after confirming `/app/links` already exposes explicit publish/unpublish controls, owner-visible public/private status, and E2E coverage in `tests/e2e/home.spec.ts`.
