# Note authoring

## Goal
Let the owner sign in, create draft markdown notes, edit them, and preview the rendered result inside the private Minakeep area.

## Trigger / Entry
The owner signs in and opens the notes-first private dashboard.

## User-Visible Behavior
- The owner can create a draft note with a title and markdown body.
- The owner can edit an existing draft note.
- The private note editor shows markdown preview alongside editing.
- Draft notes remain private by default.

## Validation
- Owner sign-in succeeds and protected note routes are reachable only after authentication.
- A created draft note persists and can be reopened for editing.
- Markdown preview reflects saved content accurately enough for normal note writing.
- `npm run verify` passes.
