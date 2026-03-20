# Note authoring

```json taskmeta
{
  "id": "011-note-authoring",
  "title": "Note authoring",
  "order": 11,
  "status": "completed",
  "next_task_on_success": "012-public-note-publishing",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/note-authoring.md"
  ],
  "required_commands": [
    "npm run verify"
  ],
  "required_files": [],
  "human_review_triggers": [
    "The task broadens into unrelated feature work.",
    "The deterministic checks do not actually prove the claimed behavior."
  ],
  "completed_at": "2026-03-20T08:09:55.689Z"
}
```

## Objective

Let the owner sign in, create draft markdown notes, edit them, and preview the rendered result inside the private Minakeep area.

## Scope

- The owner can create a draft note with a title and markdown body.
- The owner can edit an existing draft note.
- The private note editor shows markdown preview alongside editing.
- Draft notes remain private by default.

## Out of scope

- unrelated feature fronts
- future product expansion beyond this feature

## Exit criteria

1. Owner sign-in succeeds and protected note routes are reachable only after authentication.
2. A created draft note persists and can be reopened for editing.
3. Markdown preview reflects saved content accurately enough for normal note writing.
4. `npm run verify` passes.

## Required checks

- npm run verify

## Evaluator notes

Promote only when the note authoring behavior works end-to-end in substance.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- Note when existing partial implementations were found and reused instead of replaced.
- 2026-03-20T08:35:00Z: Reused the existing Auth.js credentials flow, `/app` route protection, Prisma `Note` model, and slug helper instead of replacing them; implemented private draft creation/editing pages, a shared markdown preview renderer, and notes-first dashboard listing for task 011.
- 2026-03-20T08:09:55.689Z: automatically promoted after deterministic checks and evaluator approval.
