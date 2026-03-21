# Note image upload and embed

```json taskmeta
{
  "id": "051-note-image-upload-and-embed",
  "title": "Note image upload and embed",
  "order": 51,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "052-note-image-display-and-publish",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/design-docs/media-storage-and-serving.md",
    "docs/product-specs/note-image-attachments.md",
    "docs/product-specs/note-authoring.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @note-image-upload"
  ],
  "required_files": [
    "src/features/notes",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Image upload does not insert markdown automatically.",
    "Uploading an image breaks markdown-native note editing.",
    "Upload failure blocks normal note save or editing."
  ],
  "completed_at": "2026-03-21T12:56:44.532Z"
}
```

## Objective

Let owners upload note images from the editor and embed them into the markdown body automatically.

## Scope

- note-image upload control in note authoring
- automatic markdown image insertion
- preview rendering for uploaded images

## Out of scope

- card-image derivation across list pages
- link favicon work
- generalized attachment manager

## Exit criteria

1. Owners can upload an image from the note editor.
2. Upload inserts valid markdown image syntax into the note body automatically.
3. Uploaded images render in the note preview and saved note content.
4. `npm run test:e2e -- --grep @note-image-upload` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @note-image-upload`

## Evaluator notes

Promote only when upload and markdown insertion feel native to the note editor instead of bolted on.

## Progress log

- 2026-03-21 21:54:01 KST - Added an authenticated note-image upload route, media persistence for uploaded note images, markdown image rendering, and note-save linking so uploaded draft assets attach to the saved note.
- 2026-03-21 21:54:01 KST - Integrated a native upload control into the note editor toolbar with automatic markdown image insertion, owner-visible preview rendering, and non-blocking upload feedback.
- 2026-03-21 21:54:01 KST - Added `@note-image-upload` E2E coverage plus markdown/editor unit coverage, refreshed the affected note-editor UI snapshots, and verified `npm run test:e2e -- --grep @note-image-upload` and `npm run verify`.
- 2026-03-21T12:56:44.532Z: automatically promoted after deterministic checks and evaluator approval.
