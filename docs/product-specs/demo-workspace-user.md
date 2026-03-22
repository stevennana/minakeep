# Demo workspace user

## Goal
Let a demonstration user inspect the full owner workspace without being able to mutate Minakeep data.

## Trigger / Entry
A visitor signs in with the configured demonstration credentials.

## User-Visible Behavior
- A demonstration user can sign in and access the private workspace routes.
- The demonstration user can browse notes, links, tags, search, and published-state surfaces in read-only mode.
- Mutating actions such as create, edit, publish, unpublish, retry, upload, and other data-changing operations are unavailable or clearly disabled for the demonstration user.
- Existing content remains visible enough to demonstrate the product’s real capabilities.
- The UI makes it clear that the demonstration workspace is read-only.

## Validation
- Demonstration login succeeds when demo credentials are configured.
- Demo access reaches `/app`, `/app/links`, `/app/tags`, `/app/search`, and note-edit surfaces in read-only mode.
- Server-side write attempts from the demonstration user are rejected even if the UI is bypassed.
- `npm run verify` passes.
