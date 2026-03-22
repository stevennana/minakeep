# Public note publishing

## Goal
Let the owner publish or unpublish a note and expose published notes on the mixed public homepage and note pages.

## Trigger / Entry
- The owner opens a note in the private area and chooses to publish it.
- A trusted server-to-server note-create request may also create a note with `isPublished = true`.

## User-Visible Behavior
- The owner can publish or unpublish a note explicitly.
- A trusted external note-create request may publish a note immediately when the request opts into publish-on-create.
- Published notes appear on the public homepage alongside published links when any links are also published.
- Each published note is reachable by a public slug-based route.
- Public note listings may show AI-generated summary when available without replacing the authored note body.
- Unpublished notes are never exposed on public routes.

## Validation
- Publishing a note makes it visible on the public homepage.
- Anonymous readers can open a published note page by slug.
- Unpublishing removes the note from public routes.
- `npm run verify` passes.
