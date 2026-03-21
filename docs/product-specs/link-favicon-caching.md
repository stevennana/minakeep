# Link favicon caching

## Goal
Give saved-link cards a stable head image by fetching and caching the target site favicon locally.

## Trigger / Entry
The owner saves or updates a link in `/app/links`.

## User-Visible Behavior
- Minakeep attempts to resolve and cache a favicon for the saved link.
- Owner and public link cards use the cached favicon as the head image when available.
- If favicon fetch or cache fails, the link still saves successfully.
- Failed favicon fetch falls back to a generic stable icon instead of a broken image.

## Validation
- Link save remains successful even when favicon fetch fails.
- Cached favicons appear on owner and public link cards when available.
- Public link cards do not depend on third-party hotlinked favicon URLs at render time.
- Favicon failure falls back cleanly without broken layout.
- `npm run verify` passes.
