# Link capture

## Goal
Let the owner save private links with a manual title, summary, and shared tags inside Minakeep.

## Trigger / Entry
The owner opens the private links area and saves a new link.

## User-Visible Behavior
- The owner can create a saved link with URL, title, summary, and tags.
- Saved links remain private in v1.
- The owner can review saved links in the private area.
- Links share the same tag vocabulary used by notes.

## Validation
- A saved link persists with its URL, title, summary, and tags.
- Saved links are not exposed on public routes.
- The private links view shows saved entries clearly enough for later retrieval.
- `npm run verify` passes.
