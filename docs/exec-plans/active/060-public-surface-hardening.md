# Public surface hardening

```json taskmeta
{
  "id": "060-public-surface-hardening",
  "title": "Public surface hardening",
  "order": 60,
  "status": "active",
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
- 2026-03-22 10:35 KST: Audited the shipped public homepage and public note implementation against the task docs and existing Playwright coverage. Confirmed the redesign itself was already present, found repo-truth drift in the documented desktop masonry range, and found the task-gated `@ui-public-taste-regression` command was not yet wired to the relevant tests.
- 2026-03-22 10:35 KST: Aligned the public-surface docs with the shipped masonry behavior (`3` to `4` desktop columns, `2` on tablet, `1` on narrow mobile), documented the task-specific regression tag in the UI verification contract, and tagged the existing public chrome, homepage shell, showroom, first-screen density, and public note Playwright cases so one deterministic command now replays the intended public-surface protection set.
- 2026-03-22 10:37 KST: Validation passed locally. `npm run test:e2e -- --grep @ui-public-taste-regression` ran the task-scoped public chrome, homepage, and public note suite successfully, and `npm run verify` completed successfully afterward.
