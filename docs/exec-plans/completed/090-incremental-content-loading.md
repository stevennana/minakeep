# Incremental content loading

```json taskmeta
{
  "id": "090-incremental-content-loading",
  "title": "Incremental content loading",
  "order": 90,
  "status": "completed",
  "promotion_mode": "standard",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/incremental-content-loading.md",
    "docs/product-specs/public-home-showroom.md",
    "docs/product-specs/owner-workspace-density.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @incremental-loading",
    "npm run test:unit",
    "npm run typecheck"
  ],
  "required_files": [
    "docs",
    "src/app",
    "src/components",
    "src/features",
    "tests/e2e",
    "tests/unit"
  ],
  "human_review_triggers": [
    "The public title search stops finding matches beyond the first slice.",
    "Owner note or link actions break for items that appear after automatic continuation.",
    "The bottom continuation control no longer sits below the collection flow."
  ],
  "completed_at": "2026-03-26T00:00:00+09:00"
}
```

## Objective

Ship real paging policy for the public showroom, owner dashboard notes, and owner links list so those routes stop loading full note/link collections on first render.

## Scope

- server-side initial limits for public and owner collections
- bottom `Load more` affordance with automatic continuation when it enters the viewport
- public title-search compatibility with incremental loading
- regression coverage for initial slice size and automatic continuation

## Out of scope

- owner search, tags, or note editor paging
- public full-text search or public type filtering
- virtualized scrolling or background prefetch beyond the bottom continuation behavior

## Exit criteria

1. `/` loads the first 10 matching public items and keeps title search working across the full published archive.
2. `/app` and `/app/links` load the first 20 owner items and continue automatically from the bottom load-more affordance.
3. Continuation stays server-backed rather than preloading the full collection into the client.
4. `npm run test:e2e -- --grep @incremental-loading`, `npm run test:unit`, and `npm run typecheck` pass.

## Required checks

- `npm run test:e2e -- --grep @incremental-loading`
- `npm run test:unit`
- `npm run typecheck`

## Evaluator notes

Promote only when the new loading policy reduces first-render collection size without regressing the current public search semantics or owner mutation controls.

## Progress log

- 2026-03-26T00:00:00+09:00: task created for the next public/owner loading wave.
- 2026-03-26T00:00:00+09:00: documented the new incremental loading contract in architecture, frontend, and product specs, then added a dedicated feature spec for shared slice sizing and bottom-triggered continuation.
- 2026-03-26T00:00:00+09:00: added server-backed limit/count helpers for public content, owner notes, and owner links; public search now resets to the first 10 matching items instead of filtering only the already-rendered list.
- 2026-03-26T00:00:00+09:00: added a reusable bottom observer control plus targeted unit and `@incremental-loading` Playwright coverage for public showroom, owner dashboard notes, and owner links continuation.
- 2026-03-26T00:00:00+09:00: required checks passed: `npm run lint`, `npm run typecheck`, `npm run test:unit`, and `npm run test:e2e -- --grep @incremental-loading`.
