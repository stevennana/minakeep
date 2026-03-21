# Mobile responsive polish

```json taskmeta
{
  "id": "029-mobile-responsive-polish",
  "title": "Mobile responsive polish",
  "order": 29,
  "status": "queued",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "030-ui-hardening-and-regression",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/responsive-ui-behavior.md",
    "docs/design-docs/responsive-ui-rules.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-responsive"
  ],
  "required_files": [
    "src/app/globals.css",
    "tests/e2e"
  ],
  "human_review_triggers": []
}
```

## Objective

Finish the mobile-first responsive pass so the denser desktop redesign still feels easy to read and use on smaller screens.

## Scope

- improve mobile collapse behavior across public and private surfaces
- preserve thumb-friendly controls and readable note previews
- keep responsive behavior consistent through shared layout primitives

## Out of scope

- new product behavior
- broad desktop visual experimentation unrelated to responsive behavior

## Exit criteria

1. Homepage note scanning stays easy on mobile.
2. Owner navigation and primary actions remain usable on mobile widths.
3. Responsive behavior feels intentional across the redesigned surfaces.
4. `npm run test:e2e -- --grep @ui-responsive` passes with `390x844` mobile coverage, screenshots, and accessibility checks.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-responsive`

## Evaluator notes

Promote when the deterministic UI checks pass and mobile quality is clearly preserved rather than inferred from desktop success.

## Progress log

- Start here. Append timestamped progress notes as work lands.
