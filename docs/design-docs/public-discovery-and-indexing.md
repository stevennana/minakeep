# Public discovery and indexing

## Goal
Define how Minakeep exposes search-engine discovery without weakening the private-vault boundary or inventing public URLs that do not really exist.

## Canonical Public Origin
- Search discovery must use one operator-owned canonical public origin, recommended as `SITE_URL`.
- The canonical public origin belongs to deployment/runtime configuration, not to owner-editable workspace settings.
- This value should be absolute, stable, and production-facing so Minakeep never emits localhost, Docker-internal, or preview-host URLs as canonical public pages.

## Discovery Surface
- `robots.txt` and `sitemap.xml` are the only crawler-facing discovery routes in v1.
- The homepage `/` is a valid sitemap URL because it is a stable first-party public page.
- Published note detail pages are valid sitemap URLs because they have durable internal routes.
- Published links are not valid sitemap URLs in v1 because Minakeep opens them externally and does not provide a public internal detail page for them.
- Discovery routes should reuse the same published-content boundary as the public site instead of enumerating records through a separate looser query path.

## Fail-Closed Rules
- If `SITE_URL` is missing, discovery should fail closed rather than emit broken or misleading absolute URLs.
- The recommended fail-closed behavior is:
  - `robots.txt` returns a crawler-disallowing policy
  - `sitemap.xml` returns no public URLs
  - canonical tags are omitted rather than guessed from request headers
- Private, owner-only, demo-only, API, and unpublished routes must never appear in sitemap output.

## Metadata Ownership
- Canonical URL generation belongs near the shared public-site config boundary rather than being re-implemented independently on each route.
- Homepage canonical generation and note-page canonical generation should share the same origin helper and route-construction rules.
- Sitemap URL generation should use the same route helpers used by canonical metadata where possible so slug/path drift does not fork.

## Operator Contract
- Self-host and Docker docs should explain that Google Search Console registration depends on setting `SITE_URL` first.
- Operator docs should point to the exact registration target: `https://<site>/sitemap.xml`.
- The SEO feature should stay useful without tying Minakeep to Google-specific APIs or verification flows in v1.

## Verification Implications
- Route-level tests should prove that sitemap and robots output stay aligned with the canonical-origin contract.
- E2E coverage should prove:
  - configured canonical tags on `/` and `/notes/[slug]`
  - sitemap includes published notes only
  - published links remain excluded as standalone URLs
  - fail-closed discovery behavior when the origin is missing
