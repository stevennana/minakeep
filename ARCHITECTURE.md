# ARCHITECTURE.md

## Goal
Build Minakeep as an agent-legible codebase with strong boundaries, a short instruction surface, and enough extension seams to support future change without overbuilding v1.

## System Overview
Minakeep is a web application with:
- a public site for published notes and published links
- a public discovery surface for canonical metadata, `robots.txt`, and `sitemap.xml` when a real public site origin is configured
- a private owner area for notes, links, tags, and search
- an optional server-to-server note-create API protected by one environment-backed API key and disabled when `API_KEY` is unset
- an owner-editable site settings surface for shared service branding
- an automatic AI enrichment path for notes and links
- a SQLite-backed persistence layer for content and owner identity
- a mounted media storage path for uploaded note images and cached link favicons
- an upgrade-safe runtime path for self-host and Docker schema changes
- a deterministic operator path with logged startup and Ralph-loop state tracking

## Architectural Priorities
- keep the foundation small and agent-legible
- separate public reading from private authoring clearly
- keep user-visible feature fronts sliced into small plans
- make runtime startup and verification deterministic before unattended loop work
- isolate the external AI client behind a narrow service boundary
- make AI failure visible without letting it block core save flows

## Layered Domain Model
Use a strict forward-only dependency shape inside each domain:

`Types -> Config -> Repo -> Service -> Runtime -> UI`

### Why this matters
The repository is intended to work well with long-running agent loops. Strict boundaries reduce accidental coupling and make failure analysis easier.

## Primary Domains
### Owner access
Single-owner authentication, route protection, and owner-session checks.

### External note API
Static-key server-to-server note creation that writes into the existing single-owner note model without adding multi-user API key management. Requests stay private by default unless they explicitly opt into publish-on-create with `isPublished: true`.

### Notes
Markdown note drafts, publishing state, slugs, public rendering, extracted reference-link rendering, and note-side enrichment state.

### Links
Manual bookmark capture with URL/title plus AI-generated summary and shared tags.

### Site settings
Owner-managed service title/description and the extensible configuration boundary for future settings.

### Media
Uploaded note images, cached link favicons, media visibility rules, and server-backed media delivery.

### Tags and search
Shared tagging plus owner-only filtering and search over titles, URLs, and tags.

### AI enrichment
Automatic summary/tag generation for notes and links through a Mina-hosted OpenAI-compatible endpoint, with explicit enrichment status and retry behavior.

### Visual system
Shared design tokens, layout rules, and component language for public and private surfaces.

### Operations
Prisma runtime prep, startup smoke, operator logging, Docker packaging, Ralph loop state, and operator-managed public discovery configuration through `SITE_URL`.

## Frontend / Backend Shape
### Frontend
- public routes stay read-only and minimal
- the private `/app` area is notes-first, with dedicated routes for links, tags, and search
- server components should be the default for route shells and static surfaces
- interactive owner forms should stay localized to small client components
- large public or owner collections should load through small server-side slices with URL-driven continuation state instead of fetching the entire note/link archive on first render
- first-screen image media on initial route render should use an explicit loading-priority contract so visible note images and favicons load before offscreen media without eager-loading whole collections
- the next wave should converge public and private surfaces on one elegant knowledge-studio visual system

### Server
- Auth.js handles owner sign-in
- route handlers expose health and future server-backed workflows
- the external note-create route should stay narrow, server-only, fail closed when `API_KEY` is missing or wrong, and stay separate from browser-session auth
- public discovery routes should stay narrow and machine-readable, derive only from already-public content, and fail closed when the deployment has no configured canonical public origin
- public discovery support should stay generic to search engines through canonical metadata, `robots.txt`, and `sitemap.xml`, with operator docs pointing to `/sitemap.xml` registration instead of provider-specific APIs
- owner settings and destructive owner actions should stay behind narrow server-side helpers rather than route-local ad hoc mutations
- route handlers or server-backed media endpoints should mediate owner/private media visibility instead of exposing the full media volume directly
- Prisma access stays behind narrow server-side helpers
- server logging stays explicit and avoids secrets or full sensitive payloads
- the external AI client must stay behind a dedicated integration layer and never leak tokens into client-side code

## Persistence Strategy
- SQLite is the v1 source of truth
- Prisma schema defines owner, note, link, and shared tag tables up front, and note/link records carry shared enrichment state fields for status, error, attempt count, and last update time
- uploaded note images and cached favicons should live on a mounted filesystem path rather than inside SQLite blobs
- `db:prepare` must generate the client, sync schema, and seed the owner account
- schema-changing waves must also define how an older working SQLite state upgrades safely before the new runtime serves traffic
- future migrations should extend the existing schema instead of replacing it ad hoc

## Verification Shape
- `npm run verify` is the promotion gate for normal task completion
- `npm run verify` must include lint, typecheck, build, unit tests, E2E tests, and startup smoke
- `npm run start:logged` gives operators a persistent server log path under `logs/`
- future container tasks should add deterministic image-build and startup-proof commands instead of relying on docs alone
- if the app cannot boot against prepared runtime state, the harness is not ready
- external AI tasks must add a real-endpoint E2E check when `LLM_BASE`, `TOKEN`, and `MODEL` are configured, using Playwright coverage tagged `@ai-real`

## Long-Running Agent Readiness
- docs are the system of record
- plans are executable, not aspirational
- domain boundaries are explicit
- repeated issues should be upgraded into tests or static checks
