# Public surface taste foundation

```json taskmeta
{
  "id": "056-public-surface-taste-foundation",
  "title": "Public surface taste foundation",
  "order": 56,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "057-public-showroom-masonry-reset",
  "prompt_docs": [
    "AGENTS.md",
    "docs/PRODUCT_SENSE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-surface-human-design-reset.md",
    "docs/design-docs/cool-monochrome-visual-system.md",
    "docs/design-docs/public-surface-taste-rules.md",
    "docs/references/public-surface-design-references.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-public-taste-foundation"
  ],
  "required_files": [
    "src/app/globals.css",
    "src/components/ui",
    "src/app/layout.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The new public foundation still reads like generic SaaS chrome instead of a content-first archive.",
    "New visual rules require route-level logic changes instead of shared primitives or tokens.",
    "The public topbar or search shell remains more visually dominant than the published content."
  ],
  "completed_at": "2026-03-22T00:50:10.825Z"
}
```

## Objective

Establish the reusable public-surface design foundation for the new taste-led wave before rebuilding specific pages.

## Scope

- shared public typography and spacing tokens
- calmer public topbar and shell primitives
- public-surface card/chip primitive cleanup
- no route-model or feature-logic changes

## Out of scope

- full masonry showroom implementation
- public note page layout rewrite
- owner-workspace redesign

## Exit criteria

1. Shared public-facing primitives and CSS rules reflect the calmer taste-led direction.
2. Public chrome reads as support structure rather than the primary focal point.
3. Typography and tag-chip primitives are ready for the later page slices.
4. `npm run test:e2e -- --grep @ui-public-taste-foundation` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-public-taste-foundation`

## Evaluator notes

Promote only when the new public foundation is visibly different from generic AI-slop patterns and is implemented through reusable styling layers.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-22 09:47 KST: Reworked the shared public foundation in `src/app/globals.css`, `src/app/layout.tsx`, and `src/components/ui/primitives.tsx` toward the cooler monochrome direction: quieter topbar, calmer public shell surfaces, reduced public heading scale, and cleaner card/chip styling without route or feature-logic changes.
- 2026-03-22 09:47 KST: Added task-gated public foundation coverage by tagging the desktop public chrome, mixed showroom, and public note Playwright cases with `@ui-public-taste-foundation`, plus explicit chip-fit assertions in the public showroom and public note tests.
- 2026-03-22 09:47 KST: Refreshed the affected deterministic UI snapshots after the shared shell density change and verified the full promotion gate. `npm run test:e2e -- --grep @ui-public-taste-foundation` passed and `npm run verify` passed.
- 2026-03-22T00:50:10.825Z: automatically promoted after deterministic checks and evaluator approval.
