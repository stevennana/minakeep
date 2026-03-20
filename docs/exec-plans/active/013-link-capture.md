# Link capture

```json taskmeta
{
  "id": "013-link-capture",
  "title": "Link capture",
  "order": 13,
  "status": "active",
  "next_task_on_success": "014-tag-filtering-and-owner-search",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/link-capture.md"
  ],
  "required_commands": [
    "npm run verify"
  ],
  "required_files": [],
  "human_review_triggers": [
    "The task broadens into unrelated feature work.",
    "The deterministic checks do not actually prove the claimed behavior."
  ]
}
```

## Objective

Let the owner save private links with a manual title, summary, and shared tags inside Minakeep.

## Scope

- The owner can create a saved link with URL, title, summary, and tags.
- Saved links remain private in v1.
- The owner can review saved links in the private area.
- Links share the same tag vocabulary used by notes.

## Out of scope

- unrelated feature fronts
- future product expansion beyond this feature

## Exit criteria

1. A saved link persists with its URL, title, summary, and tags.
2. Saved links are not exposed on public routes.
3. The private links view shows saved entries clearly enough for later retrieval.
4. `npm run verify` passes.

## Required checks

- npm run verify

## Evaluator notes

Promote only when the link capture behavior works end-to-end in substance.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- Note when existing partial implementations were found and reused instead of replaced.
- 2026-03-20 17:31 KST: Reused the existing Prisma `Link` and shared `Tag` models plus the staged `/app/links` route shell instead of replacing them with parallel structures.
- 2026-03-20 17:31 KST: Added the links repo/service/action flow, implemented the private `/app/links` capture and review UI, and wired comma-separated tags into the shared tag table through `connectOrCreate`.
- 2026-03-20 17:31 KST: Extended automated coverage with unit tests for link normalization and an E2E journey that saves a tagged link, confirms it appears in the private links view, and confirms it does not appear on `/`.
- 2026-03-20 17:36 KST: Confirmed the existing link capture implementation satisfied the feature scope, then tightened the E2E assertions to scope tag checks to the saved-link entry so verification stays deterministic when shared tags already exist.
