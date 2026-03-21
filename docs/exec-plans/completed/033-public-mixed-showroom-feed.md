# Public mixed showroom feed

```json taskmeta
{
  "id": "033-public-mixed-showroom-feed",
  "title": "Public mixed showroom feed",
  "order": 33,
  "status": "completed",
  "next_task_on_success": "034-public-showroom-shell-cleanup",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-home-showroom.md",
    "docs/product-specs/public-link-publishing.md"
  ],
  "required_commands": [
    "npm run verify"
  ],
  "required_files": [
    "src/app/page.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Published links are still absent from the public homepage.",
    "Notes and links are mixed without a readable distinction in their preview treatment."
  ],
  "completed_at": "2026-03-21T05:38:28Z"
}
```

## Objective

Show published notes and published links together on the public homepage.

## Scope

- mixed public feed on `/`
- visible differentiation between note cards and link cards
- compact metadata and previews for both item types

## Out of scope

- public search bar
- owner shell changes
- typography-wide softening

## Exit criteria

1. The public homepage shows published notes and published links together.
2. Unpublished links remain absent from the public homepage.
3. `npm run verify` passes.

## Required checks

- `npm run verify`

## Evaluator notes

Promote only when the homepage is a coherent mixed showroom rather than a notes-only archive with links bolted on.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 14:38 KST - Marked complete during task `031-public-publishing-foundation` reconciliation after confirming `/` already renders the mixed published-notes and published-links feed through the shared `public-content` boundary and that E2E coverage verifies unpublished links remain excluded.
