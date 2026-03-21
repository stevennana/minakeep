# Note image attachments

## Goal
Let the owner upload images into notes, embed them as markdown automatically, and surface the first embedded image across owner and public note cards.

## Trigger / Entry
The owner opens `/app/notes/new` or `/app/notes/[id]/edit`.

## User-Visible Behavior
- The owner can upload an image while editing a note.
- Uploading inserts markdown image syntax into the note body automatically.
- The uploaded image renders in the editor preview and in the saved note body.
- The first embedded markdown image becomes the note card image on owner lists and the public showroom.
- If the note is unpublished, uploaded images stay owner-visible only.
- When the note is published, referenced images become publicly renderable with the note.

## Validation
- Upload inserts valid markdown image syntax into the note body.
- Uploaded images render correctly in preview and saved note content.
- Owner note cards use the first embedded image when present.
- Published note cards and note pages render referenced images publicly.
- Draft-note images do not leak on public routes.
- `npm run verify` passes.
