# Note image attachments

## Goal
Let the owner upload images into notes, embed them as markdown automatically, and surface the first embedded image across owner and public note cards.

## Trigger / Entry
The owner opens `/app/notes/new` or `/app/notes/[id]/edit`.

## User-Visible Behavior
- The owner can upload an image while editing a note.
- Uploading inserts markdown image syntax that points at Minakeep's server-backed `/media/:assetId` route automatically.
- The uploaded image renders in the editor preview and in the saved note body.
- The first embedded markdown image becomes the note card image on owner lists and the public showroom.
- The first visible derived card image should load ahead of lower card media, and the first rendered article image should load ahead of later note images only when it lands in the opening viewport band; otherwise article images stay lazy.
- If the note is unpublished, uploaded images stay owner-visible only and anonymous requests for those `/media/:assetId` URLs return not found.
- When the note is published, only images still referenced in the published markdown become publicly renderable with the note.
- Uploaded note-image assets that are no longer referenced in published markdown stay dark on public routes.

## Validation
- Upload inserts valid `/media/:assetId` markdown image syntax into the note body.
- Uploaded images render correctly in preview and saved note content.
- Owner note cards use the first embedded image when present.
- Published note cards and note pages render referenced images publicly.
- Loading hints come from the shared image-loading intent contract so note cards and rendered markdown can distinguish first-visible note images from later offscreen note images without changing media URLs or alt text.
- Draft-note images do not leak on public routes.
- Unreferenced note-image assets do not become public just because the note is published.
- `npm run verify` passes.
