# Public surface hardening

```json taskmeta
{
  "id": "060-public-surface-hardening",
  "title": "Public surface hardening",
  "order": 60,
  "status": "planned",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-surface-human-design-reset.md",
    "docs/product-specs/public-home-showroom.md",
    "docs/product-specs/public-note-reading.md",
    "docs/design-docs/public-surface-taste-rules.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-public-taste-regression"
  ],
  "required_files": [
    "docs",
    "src",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The docs still describe the old public visual contract after implementation.",
    "Responsive or screenshot regressions remain unresolved in the public wave.",
    "The final public surfaces still read as generic AI-generated layouts."
  ]
}
```

## Objective

Reconcile docs, screenshots, responsive behavior, and regression coverage after the public-surface redesign lands.

## Scope

- doc alignment
- public-surface screenshot and responsive hardening
- regression-proofing for homepage and public note surfaces

## Out of scope

- new public features beyond the approved redesign
- owner-surface redesign follow-ups

## Exit criteria

1. Docs match the shipped public-surface design rules accurately.
2. Public homepage and public note regressions are covered deterministically.
3. The redesigned public surfaces remain stable on desktop and mobile.
4. `npm run test:e2e -- --grep @ui-public-taste-regression` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-public-taste-regression`

## Evaluator notes

Promote only when the new public visual language is protected by regression coverage and documented as the repo truth.

## Progress log

- Start here. Append timestamped progress notes as work lands.
