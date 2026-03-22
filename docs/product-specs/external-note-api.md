# External note API

## Goal
Establish the server-to-server auth boundary for future owner note creation through one static environment API key, without introducing multi-user API key management.

## Trigger / Entry
A trusted external server sends a note-create request to the Minakeep API with the configured `X-API-Key` header.

## User-Visible Behavior
- Minakeep exposes a server-to-server `POST /api/open/notes` endpoint for the external note-create boundary.
- The endpoint authenticates requests with one environment-backed `API_KEY`; there is no UI for creating or rotating per-client keys in this wave.
- If `API_KEY` is unset, the endpoint is disabled and returns a fail-closed response instead of accepting anonymous writes.
- Missing or invalid `X-API-Key` headers are rejected.
- A request with a valid `X-API-Key` reaches a `501 Not implemented` skeleton response in this wave.
- This auth-foundation slice does not yet persist notes, publish notes on create, parse the request body, or start AI enrichment.
- There is no browser-origin auth, CORS support, or multi-key management in this wave.

## Security and boundary rules
- The endpoint is server-to-server only; this wave does not add browser-origin or CORS support.
- If `API_KEY` is unset, the endpoint fails closed instead of silently accepting unauthenticated writes.
- Missing or invalid API keys must not reveal the configured secret or log the full private note payload.
- The endpoint does not weaken owner/demo session rules for `/app` routes; it is a separate write boundary.

## Validation
- If `API_KEY` is unset, `POST /api/open/notes` returns a disabled fail-closed response.
- Missing or invalid `X-API-Key` requests are rejected.
- A valid `X-API-Key` request reaches the route skeleton without persisting a note yet.
- `npm run verify` passes.
