# External note API

## Goal
Let a trusted external server create owner notes through one static environment API key, without introducing multi-user API key management or a second note workflow.

## Trigger / Entry
A trusted external server sends a note-create request to the Minakeep API with the configured `X-API-Key` header.

## User-Visible Behavior
- Minakeep exposes a server-to-server `POST /api/open/notes` endpoint for the external note-create boundary.
- The endpoint authenticates requests with one environment-backed `API_KEY`; there is no UI for creating or rotating per-client keys in this wave.
- If `API_KEY` is unset, the endpoint is disabled and returns a fail-closed response instead of accepting anonymous writes.
- Missing or invalid `X-API-Key` headers are rejected.
- A valid keyed request must send JSON with `title`, `markdown`, and optional `isPublished`.
- A valid keyed request creates a note under the configured single owner account.
- When `isPublished` is omitted, the note stays private.
- When `isPublished` is `true`, the note follows the existing publish flow immediately after create and becomes visible on the public routes.
- API-created notes enter the same AI enrichment lifecycle as UI-created notes.
- The success response returns the created note identity plus the owner edit URL and `publicUrl`; `publicUrl` is `null` when the note stays private and `/notes/[slug]` when the note is published.
- There is no browser-origin auth, CORS support, or multi-key management in this wave.

## Security and boundary rules
- The endpoint is server-to-server only; this wave does not add browser-origin or CORS support.
- If `API_KEY` is unset, the endpoint fails closed instead of silently accepting unauthenticated writes.
- Missing or invalid API keys must not reveal the configured secret or log the full private note payload.
- The endpoint does not weaken owner/demo session rules for `/app` routes; it is a separate write boundary.

## Validation
- If `API_KEY` is unset, `POST /api/open/notes` returns a disabled fail-closed response.
- Missing or invalid `X-API-Key` requests are rejected.
- If `API_KEY` is unset, the route returns `503`; if `X-API-Key` is missing or invalid, the route returns `401`.
- A valid keyed request can create a private note when `isPublished` is omitted.
- A valid keyed request can publish a note immediately when `isPublished` is `true`.
- API-created notes reuse the existing note enrichment lifecycle.
- `npm run verify` passes.
