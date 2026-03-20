# Note authoring

## Goal
Let the owner sign in, create draft markdown notes, edit them, preview the rendered result, and receive AI-generated summary/tag metadata after save inside the private Minakeep area.

## Trigger / Entry
The owner signs in and opens the notes-first private dashboard.

## User-Visible Behavior
- The owner can create a draft note with a title and markdown body.
- The owner can edit an existing draft note.
- The private note editor shows markdown preview alongside editing.
- After save, the note shows visible AI enrichment status and generated summary/tags when available.
- Draft notes remain private by default.

## Validation
- Owner sign-in succeeds and protected note routes are reachable only after authentication.
- A created draft note persists and can be reopened for editing.
- Markdown preview reflects saved content accurately enough for normal note writing.
- When AI env vars are configured, a saved note completes a real-endpoint enrichment flow before the related AI task can promote.
- `npm run verify` passes.
