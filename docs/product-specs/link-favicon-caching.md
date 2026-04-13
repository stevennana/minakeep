# Link favicon caching

## Goal
Give saved-link cards a stable head image by fetching and caching the target site favicon locally.

## Trigger / Entry
The owner saves a link or manually refreshes its favicon in `/app/links`.

## User-Visible Behavior
- Minakeep attempts to resolve and cache a favicon for the saved link.
- The owner can request a manual favicon refresh for an existing saved link.
- Owner and public link cards use the cached Minakeep-served favicon as the head image when available.
- The first visible favicon on the homepage or owner links route should load ahead of lower-list favicons, while the rest remain lazy.
- If favicon fetch or cache fails, the link still saves successfully.
- Failed favicon fetch falls back to the stable generic icon at `/icons/link-favicon-fallback.svg` instead of a broken image.
- Cached favicons become publicly reachable only through published links; private saved links keep their favicon private.

## Validation
- Link save remains successful even when favicon fetch fails.
- Cached favicons appear on owner and public link cards when available.
- Public link cards do not depend on third-party hotlinked favicon URLs at render time.
- Loading hints come from the shared image-loading intent contract so favicon helpers can distinguish first-visible favicons from later offscreen favicons without changing the cached asset path.
- Favicon failure falls back cleanly without broken layout.
- Manual favicon refresh can recover from a prior fallback state.
- `npm run verify` passes.
