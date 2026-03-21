# Link favicon cache and render

```json taskmeta
{
  "id": "053-link-favicon-cache-and-render",
  "title": "Link favicon cache and render",
  "order": 53,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "054-docker-packaging-and-compose",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/design-docs/media-storage-and-serving.md",
    "docs/product-specs/link-favicon-caching.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @link-favicon"
  ],
  "required_files": [
    "src/features/links",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Public link cards hotlink third-party favicon URLs directly at render time.",
    "Link save fails when favicon fetch fails.",
    "There is no stable generic fallback icon path."
  ],
  "completed_at": "2026-03-21T13:40:39.055Z"
}
```

## Objective

Fetch and cache link favicons locally so owner and public link cards can render stable head images.

## Scope

- favicon fetch and local cache
- owner/public link-card favicon rendering
- fallback icon behavior on fetch failure

## Out of scope

- note-image uploads
- periodic favicon recrawling daemon
- Docker packaging

## Exit criteria

1. Minakeep attempts to resolve and cache a favicon when a link is saved or refreshed.
2. Owner and public link cards use the cached favicon when available.
3. Favicon failure falls back cleanly without blocking link save.
4. `npm run test:e2e -- --grep @link-favicon` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @link-favicon`

## Evaluator notes

Promote only when favicon behavior is stable, local-cache based, and failure-tolerant.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 23:20 KST: Added deterministic favicon caching infrastructure for links: owner/public link summaries now expose one cached `faviconAssetId`, background save-triggered refresh writes a local `link-favicon` media asset under the mounted media root, and fetch failures keep link save non-blocking while preserving a stable fallback icon path.
- 2026-03-21 23:20 KST: Updated owner and public link-card rendering to use the cached local favicon when present and `/icons/link-favicon-fallback.svg` otherwise, including a manual owner-side `Refresh favicon` action and focused `@link-favicon` Playwright coverage for cache success, fallback behavior, and refresh recovery.
- 2026-03-21T13:40:39.055Z: automatically promoted after deterministic checks and evaluator approval.
