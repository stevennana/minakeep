# Tag chip and public type fit

```json taskmeta
{
  "id": "059-tag-chip-and-public-type-fit",
  "title": "Tag chip and public type fit",
  "order": 59,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "060-public-surface-hardening",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-surface-human-design-reset.md",
    "docs/product-specs/ui-hierarchy-softening.md",
    "docs/design-docs/cool-monochrome-visual-system.md",
    "docs/design-docs/public-surface-taste-rules.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-public-tag-fit"
  ],
  "required_files": [
    "src/app/globals.css",
    "src/components/ui",
    "src/features/public-content/components/public-showroom.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Tag text still overflows or visually escapes the chip background.",
    "Typography softening flattens hierarchy instead of calming it.",
    "The fixes stay local to one route instead of tightening the shared public primitives."
  ],
  "completed_at": "2026-03-22T01:31:33.372Z"
}
```

## Objective

Fix the public-facing tag-chip sizing and finish the calmer type hierarchy across the published surfaces.

## Scope

- tag-chip fit and wrap rules
- public-facing `h1`, `h2`, `strong`, and metadata refinement
- shared public card typography cleanup

## Out of scope

- masonry layout behavior
- owner-surface typography redesign
- search behavior changes

## Exit criteria

1. Public tag chips fit their content without overflow or awkward clipping.
2. Public typography feels calmer and more refined than the current shipped state.
3. The fixes live in shared styling primitives where practical.
4. `npm run test:e2e -- --grep @ui-public-tag-fit` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-public-tag-fit`

## Evaluator notes

Promote only when the small typography and chip details feel genuinely polished rather than superficially adjusted.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-22 10:58 KST: tightened the shared `TagChip` primitive with an inner label wrapper plus fit-content, wrap-safe chip rules so long public tags can wrap without spilling past the chip background.
- 2026-03-22 10:58 KST: softened public-only typography on the showroom and published note page by reducing card/title intensity, lowering metadata contrast, and refining public section-heading treatment without changing masonry or search behavior.
- 2026-03-22 10:58 KST: added `tests/e2e/ui-public-tag-fit.spec.ts` to cover long-tag wrapping on the public showroom and note page plus the calmer public type thresholds for cards and note reading surfaces.
- 2026-03-22 11:41 KST: refreshed the affected public screenshot baselines and aligned the existing public type assertions with the intentionally calmer desktop and mobile heading scale.
- 2026-03-22 11:41 KST: verified the task contract end to end with `npm run test:e2e -- --grep @ui-public-tag-fit` and `npm run verify`; both passed locally.
- 2026-03-22T01:31:33.372Z: automatically promoted after deterministic checks and evaluator approval.
