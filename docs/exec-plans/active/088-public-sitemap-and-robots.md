# Public sitemap and robots

```json taskmeta
{
  "id": "088-public-sitemap-and-robots",
  "title": "Public sitemap and robots",
  "order": 88,
  "status": "active",
  "promotion_mode": "standard",
  "next_task_on_success": "089-public-seo-discovery-hardening",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/SECURITY.md",
    "docs/RELIABILITY.md",
    "docs/product-specs/public-sitemap-and-seo.md",
    "docs/product-specs/public-note-publishing.md",
    "docs/product-specs/public-link-publishing.md",
    "docs/design-docs/public-discovery-and-indexing.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @seo-discovery",
    "npm run verify"
  ],
  "required_files": [
    "src/app",
    "src/features",
    "tests/e2e",
    "tests/unit"
  ],
  "human_review_triggers": [
    "Sitemap output leaks unpublished notes, private routes, or fake link-detail URLs.",
    "Robots output and canonical route helpers diverge from the same configured public origin.",
    "The slice relies on manual operator edits instead of automatically reflecting publish/unpublish changes."
  ]
}
```

## Objective

Ship the public discovery routes and canonical metadata behavior needed for search-engine indexing of the homepage and published notes.

## Scope

- add `/sitemap.xml`
- add `/robots.txt`
- include `/` plus published note detail pages only
- exclude published links as standalone URLs in v1
- wire canonical URLs on the public homepage and public note pages
- keep discovery output automatically aligned with note publish, unpublish, and slug changes

## Out of scope

- Google Search Console verification ownership
- per-search-engine metadata extensions beyond core sitemap/robots/canonical behavior
- new public detail pages for links

## Exit criteria

1. The sitemap contains only first-party public URLs that actually exist.
2. Robots output advertises the sitemap when the canonical origin is configured and fails closed when it is not.
3. Public home and note pages emit canonical URLs built from the same shared origin contract.
4. `npm run test:e2e -- --grep @seo-discovery` passes.
5. `npm run verify` passes.

## Required checks

- `npm run test:e2e -- --grep @seo-discovery`
- `npm run verify`

## Evaluator notes

Promote only when the discovery routes feel like a strict extension of the existing public-content boundary rather than a second looser publishing system.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-23T09:41:01.068Z: restored as current task after 087-public-site-origin-foundation promotion.
- 2026-03-23T09:48:41Z: added shared public discovery helpers, wired `src/app/sitemap.ts` and `src/app/robots.ts`, extended note revalidation to cover `/sitemap.xml`, and added Playwright-only `SITE_URL` override support for deterministic discovery coverage.
- 2026-03-23T09:51:15Z: `npm run test:e2e -- --grep @seo-discovery` and `npm run verify` both passed; sitemap, robots, and canonical metadata now ship through the shared public-origin contract.
- 2026-03-23T18:59:00+09:00: extended link-side public mutations to revalidate `/sitemap.xml` too, because the homepage sitemap `lastmod` depends on published link timestamps even though links stay homepage-only.
- 2026-03-23T18:59:00+09:00: added `@seo-discovery` regression coverage that proves the homepage sitemap entry refreshes after publishing and unpublishing a link without ever emitting a standalone first-party link URL.
