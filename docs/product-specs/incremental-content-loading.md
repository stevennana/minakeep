# Incremental content loading

## Goal
Stop loading the full public showroom and owner note/link collections on first render by switching those surfaces to small initial slices with automatic bottom-of-page continuation.

## Trigger / Entry
- An anonymous visitor opens `/`.
- The owner opens `/app`.
- The owner opens `/app/links`.

## User-Visible Behavior
- The public showroom loads the first 10 matching published items on first render.
- The owner dashboard loads the first 20 notes on first render.
- The owner links route loads the first 20 saved links on first render.
- Each collection keeps a bottom `Load more` control after the visible list.
- When that bottom control becomes visible in the viewport, the next slice loads automatically without forcing the user to click first.
- The bottom control remains as a manual fallback if automatic loading does not fire immediately.
- Public title search still works against the full published archive, but the visible window resets to the first 10 matching results whenever the query changes.
- Archive stats and owner summary counts still reflect the full collection, not only the currently visible slice.

## Validation
- `/`, `/app`, and `/app/links` stop rendering the full note/link collections on first load.
- Public title search still returns matches beyond the initial 10-item slice through automatic continuation.
- Owner note and link actions still work for items that appear after loading more.
- The bottom continuation control sits below the visible list rather than inside the masonry/cards flow.
- `npm run verify` passes.
