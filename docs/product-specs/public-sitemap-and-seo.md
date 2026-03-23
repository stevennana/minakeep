# Public sitemap and SEO

## Goal
Expose a search-console-ready discovery surface for Minakeep so public note pages can be indexed cleanly without leaking private or non-canonical URLs.

## Trigger / Entry
- An operator wants to register the site with Google Search Console or another search engine.
- A crawler requests `/robots.txt`, `/sitemap.xml`, `/`, or `/notes/[slug]`.

## User-Visible Behavior
- Minakeep exposes a public `robots.txt` route for crawler rules.
- Minakeep exposes a public `sitemap.xml` route for crawl discovery.
- The sitemap includes only first-party public pages:
  - `/`
  - published note detail routes under `/notes/[slug]`
- Published links do not get standalone sitemap URLs in v1 because they do not have first-party internal detail pages.
- Public homepage and published note pages emit canonical URLs based on the configured public site origin.
- Sitemap entries update automatically when notes are published, unpublished, or change slug.
- Sitemap entries should carry `lastmod` values that reflect meaningful public content change.
- The feature is controlled by an operator-configured canonical public origin such as `SITE_URL`, not by an owner-editable workspace setting.
- If the canonical public origin is unset, search-engine discovery fails closed:
  - `robots.txt` should disallow crawling
  - `sitemap.xml` should not advertise incorrect localhost or preview URLs
- Operator docs should state how to submit `https://<site>/sitemap.xml` to Google Search Console after the canonical site origin is configured.

## Validation
- `robots.txt` exists and advertises the sitemap only when the canonical public origin is configured.
- `sitemap.xml` exists and contains only the homepage plus published note URLs.
- Unpublished notes, private routes, API routes, and owner routes never appear in the sitemap.
- Published links remain excluded as standalone URLs.
- Home and note pages emit canonical URLs that use the configured public origin.
- `npm run verify` passes.
