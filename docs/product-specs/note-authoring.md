# Note authoring

## Goal
Let the owner sign in, create draft markdown notes, edit them, preview the rendered result, and receive AI-generated summary/tag metadata after save inside the private Minakeep area.

## Trigger / Entry
The owner signs in and opens the notes-first private dashboard.

## User-Visible Behavior
- The owner can create a draft note with a title and markdown body.
- The owner can edit an existing draft note.
- The private note editor keeps one markdown body as the saved source while showing a rendered preview from that same source.
- On desktop, the editor opens as a split workbench so source and preview can be reviewed together.
- On mobile, the editor uses an `Edit` / `Preview` toggle instead of forcing both panes into the same width.
- The private note editor remains markdown-native even as richer editor controls are added.
- After save, the note shows visible AI enrichment status and generated summary/tags when available.
- Draft notes remain private by default.

## Validation
- Owner sign-in succeeds and protected note routes are reachable only after authentication.
- A created draft note persists and can be reopened for editing.
- Markdown preview reflects saved content accurately enough for normal note writing.
- Desktop and mobile mode changes keep the same markdown body intact.
- When AI env vars are configured, a saved note completes a real-endpoint enrichment flow before the related AI task can promote.
- `npm run verify` passes.
