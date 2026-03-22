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
- accept JSON only
- request fields:
  - `title`
  - `markdown`
  - optional `isPublished`
- response fields should include:
  - `id`
  - `title`
  - `slug`
  - `isPublished`
  - `enrichmentStatus`
  - `editUrl`
  - `publicUrl` when published

## Content ownership rules
- the external caller provides only owner-authored note fields: title and markdown
- slug generation stays server-owned and reuses the existing note-slug rules
- AI summary and tags stay server-owned and follow the existing enrichment lifecycle
- image upload, image embedding, manual tags, and manual summary injection stay out of scope

## Failure model
- if `API_KEY` is unset, the route fails closed with a disabled-style response rather than silently allowing anonymous writes
- missing or invalid keys return auth failures without revealing the configured key
- invalid JSON or malformed field types return request-shape failures
- note persistence should still succeed even if AI enrichment later fails, matching the existing note-save contract

## Operational rules
- this route is server-to-server only; do not add CORS support in this wave
- do not log the API key or full private note payloads
- revalidation and enrichment scheduling should reuse the existing note-save path instead of creating a parallel workflow
