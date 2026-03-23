# Public site origin foundation

```json taskmeta
{
  "id": "087-public-site-origin-foundation",
  "title": "Public site origin foundation",
  "order": 87,
  "status": "active",
  "promotion_mode": "standard",
  "next_task_on_success": "088-public-sitemap-and-robots",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/SECURITY.md",
    "docs/RELIABILITY.md",
    "docs/product-specs/public-sitemap-and-seo.md",
    "docs/product-specs/docker-packaging.md",
    "docs/design-docs/public-discovery-and-indexing.md"
  ],
  "required_commands": [
    "npm run typecheck",
    "npm run test:unit",
    "npm run verify"
  ],
  "required_files": [
    "src/app",
    "src/features",
    "tests/unit",
    ".env.example",
    ".env.compose.example"
  ],
  "human_review_triggers": [
    "The implementation derives canonical public URLs from request headers or ad hoc host guessing instead of one documented operator-owned origin contract.",
    "The new origin/config path overlaps incorrectly with owner-editable site settings.",
    "Missing-origin behavior still advertises crawlable or incorrect public URLs."
  ]
}
```

## Objective

Establish the canonical public-site origin contract for SEO and discovery without weakening the self-hosted deployment boundary.

## Scope

- add the documented runtime config boundary for the canonical public origin, recommended as `SITE_URL`
- define shared helpers or ownership rules for canonical metadata generation
- define fail-closed behavior for missing-origin deployments
- align env and operator docs with the new public-origin requirement

## Out of scope

- full sitemap entry generation
- robots output details beyond the origin/fail-closed contract
- Google Search Console verification or third-party API integration

## Exit criteria

1. The repo has one documented and implemented source of truth for the public canonical site origin.
2. Homepage and note-page canonical generation can rely on that boundary instead of route-local guessing.
3. Missing-origin deployments fail closed for search discovery.
4. `npm run typecheck`, `npm run test:unit`, and `npm run verify` pass.

## Required checks

- `npm run typecheck`
- `npm run test:unit`
- `npm run verify`

## Evaluator notes

Promote only when the SEO foundation clearly separates operator-owned deployment origin from owner-editable branding and does not guess public URLs from runtime request context.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-23 16:05 KST: Added a dedicated `SITE_URL`-backed public-site origin helper with bare-origin validation and fail-closed URL building for canonical/discovery consumers.
- 2026-03-23 16:05 KST: Wired shared public metadata helpers into `/` and `/notes/[slug]`, added unit coverage for configured and missing-origin behavior, and clarified env/operator ownership in settings and env examples.
- 2026-03-23 18:33 KST: Forwarded `SITE_URL` through the shipped `docker-compose.yml` runtime contract and aligned README/Compose operator guidance so self-hosted deployments configure the canonical origin explicitly and fail closed when it is absent.
