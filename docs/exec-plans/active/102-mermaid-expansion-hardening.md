# Mermaid expansion hardening

```json taskmeta
{
  "id": "102-mermaid-expansion-hardening",
  "title": "Mermaid expansion hardening",
  "order": 102,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/markdown-mermaid-diagrams.md",
    "docs/design-docs/markdown-diagram-rendering.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @ui-mermaid-regression",
    "npm run verify"
  ],
  "required_files": [
    "docs",
    "tests/e2e",
    "tests/unit",
    "src/features/notes"
  ],
  "human_review_triggers": [
    "The bundled Mermaid regression command misses newly supported flowchart styling or broader root surfaces.",
    "Docs, active queue, and shipped Mermaid capabilities drift apart again by the end of the wave.",
    "The full verify gate passes only in isolation but the Mermaid expansion still leaves regression risk unprotected."
  ]
}
```

## Objective

Close the Mermaid expansion wave by proving the library-backed renderer, advanced flowchart features, and broader root support all replay under one deterministic hardening bundle.

## Scope

- bundled Mermaid regression replay
- final doc and queue reconciliation for the expanded Mermaid contract
- remaining fallback and responsive-proof cleanup for the expanded root set

## Out of scope

- additional Mermaid roots beyond what the earlier tasks explicitly shipped
- editor productivity features
- non-note markdown enhancements unrelated to Mermaid

## Exit criteria

1. One Mermaid regression command replays the shipped public-note and owner-preview surfaces for advanced flowcharts and broader roots.
2. Docs and queue history reflect the actual shipped Mermaid contract without overclaiming unsupported syntax.
3. `npm run test:e2e -- --grep @ui-mermaid-regression` and `npm run verify` pass.

## Required checks

- `npm run test:e2e -- --grep @ui-mermaid-regression`
- `npm run verify`

## Evaluator notes

Promote only when the expanded Mermaid wave reads as a finished shipped slice rather than a partially broadened renderer with aspirational docs.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-04-04T16:11:57.064Z: restored as current task after 101-broader-mermaid-root-support promotion.
- 2026-04-05 01:33 KST: audited the existing Mermaid renderer, unit coverage, and `@ui-mermaid-regression` bundle; confirmed the library-backed path, styled flowchart support, and broader roots were already shipped, then found queue drift in `docs/exec-plans/active/index.md`, which still listed `101` as active after completion.
- 2026-04-05 01:33 KST: expanded the bundled public-note and owner-preview Mermaid regression fixtures to include `sequenceDiagram` alongside advanced flowchart styling, `classDiagram`, `stateDiagram-v2`, and malformed-supported-root fallback so the single hardening replay now matches the full documented shipped root set.
- 2026-04-05 01:33 KST: reconciled the Mermaid product/design docs and active queue index with the shipped hardening contract so the docs describe the deterministic replay bundle and no longer imply that completed expansion steps are still active queue items.
- 2026-04-05 01:24 KST: reran the task gates from the current workspace and reconfirmed the shipped hardening bundle without further code changes; `npm run test:e2e -- --grep @ui-mermaid-regression` passed with 4 Mermaid replay tests across owner preview and published note desktop/mobile surfaces, and `npm run verify` passed end to end with lint, typecheck, build, 85 unit tests, 92 Playwright tests, and startup smoke.
- 2026-04-05 01:31 KST: re-audited the live workspace against the task contract, confirmed the shared Mermaid renderer and doc set still match the shipped supported roots and fallback rules, then reran the required gates; `npm run test:e2e -- --grep @ui-mermaid-regression` passed with 4 Mermaid replay tests and `npm run verify` passed again with lint, db prepare, typecheck, build, 85 unit tests, 92 Playwright tests, and startup smoke.
- 2026-04-05 01:38 KST: revalidated task `102` from the current workspace without widening the Mermaid scope. Confirmed the shared renderer still limits deterministic success to `flowchart` / `graph`, `sequenceDiagram`, `classDiagram`, and `stateDiagram` / `stateDiagram-v2`, while the bundled owner-preview and public-note regression specs still prove advanced flowchart styling, broader-root rendering, malformed-supported-root fallback, and mobile containment. `npm run test:e2e -- --grep @ui-mermaid-regression` passed with 4 tests, and `npm run verify` passed with lint, db prepare, typecheck, build, 85 unit tests, 92 Playwright tests, and startup smoke.
