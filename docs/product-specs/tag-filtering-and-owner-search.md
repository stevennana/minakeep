# Tag filtering and owner search

## Goal
Let the owner organize notes and links with shared tags and basic owner-only search over titles, URLs, and tags.

## Trigger / Entry
The owner opens the tags or search view from the private area.

## User-Visible Behavior
- The owner can add shared tags to notes and links from the private area.
- The owner can filter notes and links by shared tags.
- The owner can search notes by title and links by title or URL.
- Shared tag names can also be used as owner-only search terms.
- Search remains private to the owner area.
- Public readers do not get a search interface in v1.

## Validation
- Tag filters narrow the visible private notes and links accurately.
- Search returns matching private content using the allowed fields.
- Anonymous visitors cannot access owner search routes.
- `npm run verify` passes.
