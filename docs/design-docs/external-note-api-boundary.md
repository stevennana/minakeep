# External note API boundary

## Goal
Define the narrow server-side boundary for remote note creation without introducing a second account system or a general API platform.

## Authentication model
- use one server-only `API_KEY` environment variable
- accept that key through the `X-API-Key` header
- do not add API key CRUD, per-client identities, or per-key scopes in this wave
- keep this auth path separate from owner/demo browser sessions

## Route contract
- expose `POST /api/open/notes`
- in the auth-foundation wave, the route only authenticates the `X-API-Key` header and returns:
  - `503` when `API_KEY` is unset
  - `401` when the header is missing or invalid
  - `501` for the authorized stub path
- request-body parsing, note persistence, publish-on-create, and success-payload fields are deferred to the next implementation wave

## Content ownership rules
- when note creation ships, the external caller will provide only owner-authored note fields such as title and markdown
- slug generation remains server-owned and must reuse the existing note-slug rules
- AI summary and tags remain server-owned and must follow the existing enrichment lifecycle
- image upload, image embedding, manual tags, and manual summary injection stay out of scope

## Failure model
- if `API_KEY` is unset, the route fails closed with a disabled-style response rather than silently allowing anonymous writes
- missing or invalid keys return auth failures without revealing the configured key
- request-shape validation is deferred until note-create behavior ships
- once note persistence ships, AI enrichment failure must not block note save, matching the existing note-save contract

## Operational rules
- this route is server-to-server only; do not add CORS support in this wave
- do not log the API key or full private note payloads
- revalidation and enrichment scheduling should reuse the existing note-save path instead of creating a parallel workflow
