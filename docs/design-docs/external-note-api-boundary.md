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
- the route authenticates the `X-API-Key` header and returns:
  - `503` when `API_KEY` is unset
  - `401` when the header is missing or invalid
  - `400` when the JSON body is missing or malformed, or required fields are invalid
  - `201` when the note is created successfully
- the request body accepts only owner-authored fields: `title`, `markdown`, and optional `isPublished`
- the success payload includes the created note identity plus owner and public route URLs

## Content ownership rules
- the external caller provides only owner-authored note fields such as title and markdown
- slug generation remains server-owned and must reuse the existing note-slug rules
- AI summary and tags remain server-owned and must follow the existing enrichment lifecycle
- image upload, image embedding, manual tags, and manual summary injection stay out of scope

## Failure model
- if `API_KEY` is unset, the route fails closed with a disabled-style response rather than silently allowing anonymous writes
- missing or invalid keys return auth failures without revealing the configured key
- request-shape validation rejects malformed or non-conforming JSON before persistence
- AI enrichment failure must not block note save, matching the existing note-save contract

## Operational rules
- this route is server-to-server only; do not add CORS support in this wave
- do not log the API key or full private note payloads
- revalidation and enrichment scheduling should reuse the existing note-save path instead of creating a parallel workflow
