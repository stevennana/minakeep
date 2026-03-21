# UI hierarchy softening

```json taskmeta
{
  "id": "037-ui-hierarchy-softening",
  "title": "UI hierarchy softening",
  "order": 37,
  "status": "queued",
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
