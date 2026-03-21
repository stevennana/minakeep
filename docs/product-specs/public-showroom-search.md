# Public showroom search

## Goal
Let anonymous visitors filter the public showroom of published notes and published links through one unified title-only search control that stays compact until needed.

## Trigger / Entry
An anonymous visitor types into the public homepage search bar.

## User-Visible Behavior
- One public title-only search control appears on the homepage.
- The control is collapsed or compact by default on first load as a small row with a search button and a short title-only scope summary.
- The full search input appears only after explicit user expansion.
- The search bar filters published notes and published links together.
- Search matches titles only.
- Closing the expanded search clears the active query and returns the control to its collapsed state.
- There is no type selector and no separate public results route in this wave.
- Search updates the homepage showroom in place.

## Validation
- The homepage does not default to a large open search area that pushes the showroom down.
- Visitors can explicitly expand the search control and then filter the mixed public feed by title.
- Dismissing the expanded search returns the homepage to the compact collapsed-search state without preserving stale filters.
- Title matches for published notes and published links appear in one filtered homepage feed.
- Non-matching public content is removed from the current view as the query changes.
- The search does not expose unpublished content.
- `npm run verify` passes.
