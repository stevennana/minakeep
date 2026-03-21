# Public showroom search

## Goal
Let anonymous visitors filter the public showroom of published notes and published links through one unified title-only search bar.

## Trigger / Entry
An anonymous visitor types into the public homepage search bar.

## User-Visible Behavior
- One public search bar appears on the homepage.
- The search bar filters published notes and published links together.
- Search matches titles only.
- There is no type selector and no separate public results route in this wave.
- Search updates the homepage showroom in place.

## Validation
- Title matches for published notes and published links appear in one filtered homepage feed.
- Non-matching public content is removed from the current view as the query changes.
- The search does not expose unpublished content.
- `npm run verify` passes.
