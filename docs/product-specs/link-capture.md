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
- An unpublished link may be permanently deleted after explicit confirmation.
- Links share the same tag vocabulary used by notes.
- On the owner links screen, the saved-links list keeps the dominant continuous layout space instead of being compressed beside a short static capture form.
- A demonstration user may inspect the links workspace in read-only mode but cannot save, refresh, publish, unpublish, or retry link actions.

## Validation
- A saved link persists with its URL and title, and later shows generated summary/tags when enrichment succeeds.
- Newly saved links are not exposed on public routes until explicitly published.
- The private links view shows saved entries clearly enough for later retrieval.
- The owner links screen scales cleanly as the saved-links list grows.
- Demonstration users cannot mutate links even if they reach the same route and UI surfaces.
- When AI env vars are configured, a saved link completes a real-endpoint enrichment flow before the related AI task can promote.
- `npm run verify` passes.
