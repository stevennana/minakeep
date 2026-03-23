# SECURITY.md

## Purpose
Define the security posture for Minakeep's current shipped slice.

## Core Security Rules
- keep `/app` routes private to the owner account
- when enabled, keep `/app` routes accessible to the demonstration user in read-only mode only
- expose only explicitly published notes and explicitly published links on public routes
- do not log secrets, passwords, session tokens, or full private note/link payloads
- validate owner credentials on the server only
- validate demonstration credentials on the server only
- validate external note-create requests on the server only through the configured `API_KEY`
- store only the owner password hash in SQLite
- require owner-only auth for destructive note/link deletion and reject delete attempts for still-published content
- accept saved-link URLs only for `http` and `https`
- keep AI provider tokens and base URLs server-only
- do not send private note or link content to unconfigured or fallback endpoints silently
- visible AI failure copy may name missing env keys, but it must never echo configured secret values
- public routes must fail closed on malformed or unsafe published-link URLs, even if stale SQLite data exists
- uploaded note images must not become public solely because they were uploaded; public access must stay tied to published-note visibility rules
- published note images are public only when the published note still references that `/media/:assetId` URL in markdown
- cached favicons may be public only through already-published links; a saved private link must not leak its favicon through the public media route

## Secrets and Config
- keep `AUTH_SECRET`, `DATABASE_URL`, `OWNER_USERNAME`, and `OWNER_PASSWORD` in environment configuration only
- keep any `DEMO_USERNAME` and `DEMO_PASSWORD` values in environment configuration only
- keep `API_KEY` in environment configuration only when the external note API is enabled
- keep `SITE_URL` in environment configuration only when the public sitemap/canonical discovery surface is enabled
- keep `SITE_URL` limited to the bare public origin; never use a path, preview host, localhost, or Docker-internal hostname as the canonical discovery target
- keep `LLM_BASE`, `TOKEN`, and `MODEL` in shell or local environment only
- never commit seeded credentials or secret values
- document required environment variables in `.env.example` and runtime docs
- if AI config is partial, surface only which keys are missing and keep save behavior local and deterministic
- the real-endpoint `@ai-real` gate must use those same local-only AI env vars and must not introduce a fallback or client-side copy of them
- mounted media, SQLite, and log volumes must be operator-configurable rather than hardcoded into the image
- the shipped Compose path fixes the container-internal mount points at `/app/data`, `/app/media`, and `/app/logs`; operators may still change the host-side bind targets in Compose without changing the image

## Public Surfaces
- `/` is public and may show published notes plus published links
- `/notes/[slug]` is public for published notes
- `/login` is public but only for owner authentication
- `/app/*` routes are private
- `/api/open/notes` is publicly reachable but must fail closed unless a valid `X-API-Key` matches the configured `API_KEY`
- `/api/open/notes` returns `503` when `API_KEY` is unset and `401` when `X-API-Key` is missing or invalid
- `/sitemap.xml` and `/robots.txt` are public machine-readable routes and must never enumerate private routes, unpublished notes, unpublished links, or owner-only URLs
- public discovery remains generic search-engine support only; v1 does not expose search-provider verification files or API integration
- `/app/settings` is private and may expose owner-editable service configuration
- public title search must only query published content
- public link cards must open only the already-saved external URL in a new tab
- API health checks must expose only non-sensitive readiness information
- public note images must be resolvable only through notes that are actually published
- cached favicons should be served from Minakeep only for published links, rather than hotlinking third-party icon URLs directly on public pages

## Verification
- private routes redirect unauthenticated users to `/login`
- private mutating actions must reject the demonstration user explicitly
- unpublished notes and unpublished links never render on public routes
- unsafe saved-link URL schemes are rejected before persistence
- no secrets appear in logs, docs examples, or test fixtures
- owner auth and route protection stay covered by automated checks before promotion
- destructive owner actions must require explicit confirmation in the UI and still enforce the unpublished-only guard server-side
- external note-create auth must reject missing or invalid `X-API-Key` headers without leaking the configured secret
- valid keyed external note-create requests that omit `isPublished` must keep the note private; only explicit publish-on-create may expose it publicly
- sitemap and robots output must fail closed when `SITE_URL` is unset so the app does not advertise localhost, preview, or otherwise incorrect origins for search indexing
- sitemap output must include only `/` plus published note routes in v1; published links remain homepage-only public records and must not be exposed as fake internal detail URLs
- AI integration must prove that tokens stay server-side and that failure paths do not leak raw endpoint credentials or full private payloads
- missing or incomplete AI env config must record a visible failed enrichment state instead of silently falling back to another endpoint
- server logs may record HTTP status or high-level failure class for the Mina endpoint, but not request bodies, tokens, or full private note/link payloads
- real-endpoint AI verification must fail or skip based on missing `LLM_BASE`, `TOKEN`, and `MODEL`, not by substituting committed defaults
- the shared public-content boundary must revalidate published-link URLs before public rendering so seeded `javascript:` or malformed URLs stay hidden
- media access rules must prove that draft-note images are not publicly retrievable, published referenced note images remain publicly renderable, unreferenced note images stay dark, and link favicons become public only when the linked bookmark is published
