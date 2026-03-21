# UI hierarchy softening

```json taskmeta
{
  "id": "037-ui-hierarchy-softening",
  "title": "UI hierarchy softening",
  "order": 37,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "038-public-showroom-responsive-polish",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/ui-hierarchy-softening.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-public-type"
  ],
  "required_files": [
    "src/app/globals.css",
    "tests/e2e"
  ],
  "human_review_triggers": []
}
```

## Objective

Tone down the oversized and overly strong feel of `h1` and `strong` text across public and owner surfaces.

## Scope

- reduce heading scale
- reduce overly dark or aggressive `strong` treatment
- preserve readable hierarchy

## Out of scope

- public publishing logic
- search logic
- route-level content changes unrelated to hierarchy

## Exit criteria

1. `h1` and `strong` feel materially calmer across public and owner surfaces.
2. Hierarchy remains clear after the softening.
3. `npm run test:e2e -- --grep @ui-public-type` passes with desktop/mobile screenshots and accessibility checks.
4. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-public-type`

## Evaluator notes

Promote when the deterministic UI checks pass and the hierarchy is calmer without becoming flat.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 15:26:17 KST: Reduced shared `h1` scale and softened `strong` label styling in `src/app/globals.css`, then tagged the public homepage and public note Playwright specs with `@ui-public-type` and added computed-style checks so the required UI command proves the calmer hierarchy directly.
- 2026-03-21 15:33:03 KST: Refreshed the affected deterministic UI screenshot baselines and re-ran `npm run test:e2e -- --grep @ui-public-type` plus `npm run verify`; both commands pass locally with the softened hierarchy in place.
