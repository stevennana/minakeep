# Public showroom title search

```json taskmeta
{
  "id": "035-public-showroom-title-search",
  "title": "Public showroom title search",
  "order": 35,
  "status": "active",
  "next_task_on_success": "036-public-link-new-tab-behavior",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-showroom-search.md"
  ],
  "required_commands": [
    "npm run verify"
  ],
  "required_files": [
    "src/app/page.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Search still requires a type selector or a separate public results route.",
    "The filter matches summary/body content instead of title only.",
    "Unpublished content leaks into public search results."
  ]
}
```

## Objective

Add one unified title-only live search bar for the mixed public showroom.

## Scope

- one public search input on `/`
- live in-place filtering of published notes and published links
- title-only matching

## Out of scope

- owner search changes
- public full-text search
- separate public results routes

## Exit criteria

1. The public homepage exposes one unified search bar without a type selector.
2. The search filters published notes and published links by title only.
3. `npm run verify` passes.

## Required checks

- `npm run verify`

## Evaluator notes

Promote only when the public search behavior is lightweight, predictable, and does not broaden beyond title-only matching.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 15:00 KST: Added a client-side public showroom filter on `/` that matches published note and link titles only while keeping the server data source limited to published content.
- 2026-03-21 15:00 KST: Added focused Playwright coverage for unified live homepage filtering, including title-only matching and unpublished-content exclusion.
- 2026-03-21 15:10 KST: Hardened public UI regression seeds against cross-test link leakage, refreshed the affected mobile home-shell snapshot, and confirmed `npm run verify` passes.
