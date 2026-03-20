# Tag filtering and owner search

```json taskmeta
{
  "id": "014-tag-filtering-and-owner-search",
  "title": "Tag filtering and owner search",
  "order": 14,
  "status": "queued",
  "next_task_on_success": "015-hardening-and-maintenance",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/tag-filtering-and-owner-search.md"
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

Let the owner organize notes and links with shared tags and basic owner-only search over titles, URLs, and tags.

## Scope

- The owner can filter notes and links by shared tags.
- The owner can search notes by title and links by title or URL.
- Search remains private to the owner area.
- Public readers do not get a search interface in v1.

## Out of scope

- unrelated feature fronts
- future product expansion beyond this feature

## Exit criteria

1. Tag filters narrow the visible private notes and links accurately.
2. Search returns matching private content using the allowed fields.
3. Anonymous visitors cannot access owner search routes.
4. `npm run verify` passes.

## Required checks

- npm run verify

## Evaluator notes

Promote only when the tag filtering and owner search behavior works end-to-end in substance.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- Note when existing partial implementations were found and reused instead of replaced.
