# Public note publishing

## Goal
Let the owner publish or unpublish a note and expose published notes on the public homepage and note pages.

## Trigger / Entry
The owner opens a note in the private area and chooses to publish it.

## User-Visible Behavior
- The owner can publish or unpublish a note explicitly.
- The public homepage lists only published notes.
- Each published note is reachable by a public slug-based route.
- Public note listings may show AI-generated summary when available without replacing the authored note body.
- Unpublished notes are never exposed on public routes.

## Validation
- Publishing a note makes it visible on the public homepage.
- Anonymous readers can open a published note page by slug.
- Unpublishing removes the note from public routes.
- `npm run verify` passes.
