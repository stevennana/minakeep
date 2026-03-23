# Public SEO discovery hardening

```json taskmeta
{
  "id": "089-public-seo-discovery-hardening",
  "title": "Public SEO discovery hardening",
  "order": 89,
  "status": "active",
  "promotion_mode": "standard",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "docs/SECURITY.md",
    "docs/RELIABILITY.md",
    "docs/product-specs/public-sitemap-and-seo.md",
    "docs/product-specs/docker-packaging.md",
    "docs/design-docs/public-discovery-and-indexing.md",
    "README.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @seo-discovery",
    "npm run verify",
    "npm run start:smoke"
  ],
  "required_files": [
    "docs",
    "README.md",
    ".env.example",
    ".env.compose.example",
    "tests/e2e",
    "tests/unit"
  ],
  "human_review_triggers": [
    "Operator docs do not clearly explain how to configure the canonical public origin and submit the sitemap to Google Search Console.",
    "Regression coverage misses the fail-closed missing-origin path or the published-link exclusion rule.",
    "The final docs imply Google-specific API integration that the shipped feature does not actually provide."
  ]
}
```

## Objective

Harden the sitemap/SEO wave through operator guidance, regression coverage, and final docs alignment for self-host and Docker users.

## Scope

- final doc alignment across README, architecture, security, reliability, and Docker/self-host guidance
- regression coverage for sitemap contents, robots behavior, canonical metadata, and missing-origin fail-closed behavior
- explicit operator instructions for Search Console registration after `SITE_URL` is configured

## Out of scope

- Google verification HTML files, DNS records, or API automation
- analytics, schema.org, or broader SEO feature expansion

## Exit criteria

1. Self-host and Docker docs explain how to configure the canonical public origin and submit `/sitemap.xml`.
2. Regression coverage protects the discovery contract, including fail-closed behavior and link exclusion.
3. The shipped feature remains generic search-engine discovery rather than Google-specific integration.
4. `npm run test:e2e -- --grep @seo-discovery`, `npm run verify`, and `npm run start:smoke` pass.

## Required checks

- `npm run test:e2e -- --grep @seo-discovery`
- `npm run verify`
- `npm run start:smoke`

## Evaluator notes

Promote only when the SEO/discovery feature is operator-usable for real self-hosted deployments and the docs do not overclaim beyond sitemap, robots, and canonical support.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-23T10:44:56.760Z: restored as current task after 088-public-sitemap-and-robots promotion.
- 2026-03-23T19:46:53+0900: audited the shipped discovery implementation, env examples, README, and task contract; confirmed the remaining work is docs/operator alignment plus narrower regression assertions rather than new route behavior.
- 2026-03-23T19:51:55+0900: aligned README, architecture, security, reliability, and env-example guidance around `SITE_URL`, bare-origin requirements, and `/sitemap.xml` registration for direct Node and Docker/Compose operators without adding provider-specific integration claims.
- 2026-03-23T19:51:55+0900: tightened discovery regression coverage so unit tests pin invalid-origin fail-closed behavior plus homepage-only link exclusion, and `@seo-discovery` E2E also asserts the expected robots meta tags alongside canonical behavior.
- 2026-03-23T19:51:55+0900: required checks passed: `npm run test:e2e -- --grep @seo-discovery`, `npm run verify`, and a clean standalone `npm run start:smoke` rerun after avoiding an initial overlapping-build collision.
