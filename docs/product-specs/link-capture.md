# Link capture

## Goal
Let the owner save private links with a manual URL and title, then receive AI-generated summary and shared tags inside Minakeep.

## Trigger / Entry
The owner opens the private links area and saves a new link.

## User-Visible Behavior
- The owner can create a saved link with URL and title.
- After save, the link shows visible AI enrichment status and generated summary/tags when available.
- Saved links are private by default but may later be published explicitly.
- The owner can review saved links in the private area.
- Links share the same tag vocabulary used by notes.

## Validation
- A saved link persists with its URL and title, and later shows generated summary/tags when enrichment succeeds.
- Newly saved links are not exposed on public routes until explicitly published.
- The private links view shows saved entries clearly enough for later retrieval.
- When AI env vars are configured, a saved link completes a real-endpoint enrichment flow before the related AI task can promote.
- `npm run verify` passes.
