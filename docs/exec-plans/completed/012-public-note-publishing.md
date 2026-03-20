# Public note publishing

```json taskmeta
{
  "id": "012-public-note-publishing",
  "title": "Public note publishing",
  "order": 12,
  "status": "completed",
  "next_task_on_success": "013-link-capture",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-note-publishing.md"
  ],
  "required_commands": [
    "npm run verify"
  ],
  "required_files": [],
  "human_review_triggers": [
    "The task broadens into unrelated feature work.",
    "The deterministic checks do not actually prove the claimed behavior."
  ],
  "completed_at": "2026-03-20T08:26:13.388Z"
}
```

## Objective

Let the owner publish or unpublish a note and expose published notes on the public homepage and note pages.

## Scope

- The owner can publish or unpublish a note explicitly.
- The public homepage lists only published notes.
- Each published note is reachable by a public slug-based route.
- Unpublished notes are never exposed on public routes.

## Out of scope

- unrelated feature fronts
- future product expansion beyond this feature

## Exit criteria

1. Publishing a note makes it visible on the public homepage.
2. Anonymous readers can open a published note page by slug.
3. Unpublishing removes the note from public routes.
4. `npm run verify` passes.

## Required checks

- npm run verify

## Evaluator notes

Promote only when the public note publishing behavior works end-to-end in substance.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- Note when existing partial implementations were found and reused instead of replaced.
- 2026-03-20 17:13 KST: Reused the existing note slug, draft editor, and Prisma publication fields. Confirmed `/` and `/notes/[slug]` were honest placeholders rather than competing implementations.
- 2026-03-20 17:13 KST: Added explicit publish/unpublish actions in the notes slice, replaced the public placeholders with published-note reads, and extended E2E coverage to verify publish, public read, and unpublish removal end to end.
- 2026-03-20T08:26:13.388Z: automatically promoted after deterministic checks and evaluator approval.
