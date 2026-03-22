# External note API

## Goal
Let a trusted remote server create owner notes in Minakeep through one static environment API key, without introducing multi-user API key management.

## Trigger / Entry
A trusted external server sends a note-create request to the Minakeep API with the configured `X-API-Key` header.

## User-Visible Behavior
- Minakeep exposes a server-to-server `POST /api/open/notes` endpoint for note creation.
- The endpoint authenticates requests with one environment-backed `API_KEY`; there is no UI for creating or rotating per-client keys in this wave.
- The request body may include `title`, `markdown`, and optional `isPublished`.
- If `isPublished` is omitted, the created note stays private by default.
- If `isPublished` is `true`, the created note is published immediately and follows the existing public-note rules.
- Remote callers do not upload images, set tags, set AI summary, or choose the slug directly in this wave.
- Remote-created notes belong to the single owner account and appear in the same owner surfaces as UI-created notes.
- Note AI enrichment starts automatically after API note creation, using the same pending/ready/failed model as the owner note editor.
- The success response is JSON and includes enough note identifiers for the caller to reference the result without a second lookup.

## Security and boundary rules
- The endpoint is server-to-server only; this wave does not add browser-origin or CORS support.
- If `API_KEY` is unset, the endpoint fails closed instead of silently accepting unauthenticated writes.
- Missing or invalid API keys must not reveal the configured secret or log the full private note payload.
- The endpoint does not weaken owner/demo session rules for `/app` routes; it is a separate write boundary.

## Validation
- A valid `X-API-Key` request creates a private note when `isPublished` is omitted.
- A valid `X-API-Key` request creates a published note when `isPublished` is `true`, and the note is visible on public routes.
- Missing or invalid `X-API-Key` requests are rejected.
- API-created notes still trigger note AI enrichment and visible owner-side enrichment state.
- `npm run verify` passes.
- `npm run test:e2e -- --grep @note-api` passes.
