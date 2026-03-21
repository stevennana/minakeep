# Public search collapsed default

```json taskmeta
{
  "id": "041-public-search-collapsed-default",
  "title": "Public search collapsed default",
  "order": 41,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "042-public-showroom-first-screen-priority",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-showroom-search.md",
    "docs/design-docs/public-home-first-screen-density.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-public-search-collapse"
  ],
  "required_files": [
    "src/app/page.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The public search input is still fully expanded on first load.",
    "The collapsed affordance is hard to discover or unusable on touch screens.",
    "The search broadens beyond title-only matching."
  ],
  "completed_at": "2026-03-21T07:28:34.636Z"
}
```

## Objective

Keep the public title-search control available without letting it dominate the homepage by default.

## Scope

- collapsed or compact default search state on `/`
- explicit expand interaction for the public search input
- preserve current title-only mixed-feed filtering behavior after expansion

## Out of scope

- new public search capabilities
- owner search changes
- broader showroom shell copy changes

## Exit criteria

1. The public homepage no longer opens with a large expanded search area.
2. Visitors can explicitly expand the public search control and then filter the mixed published feed by title.
3. The collapsed search state remains clear and usable on desktop and mobile.
4. `npm run test:e2e -- --grep @ui-public-search-collapse` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-public-search-collapse`

## Evaluator notes

Promote only when the default collapsed search state improves first-screen content visibility without hiding search discoverability.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 16:24 KST: Changed the public homepage search to a collapsed-by-default toggle with explicit open/close actions, preserved title-only mixed-feed filtering when expanded, updated the public search E2E flow, and tagged the public showroom UI checks for `@ui-public-search-collapse`.
- 2026-03-21T07:28:34.636Z: automatically promoted after deterministic checks and evaluator approval.
