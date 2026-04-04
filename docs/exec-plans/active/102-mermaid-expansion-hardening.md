# Mermaid expansion hardening

```json taskmeta
{
  "id": "102-mermaid-expansion-hardening",
  "title": "Mermaid expansion hardening",
  "order": 102,
  "status": "queued",
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
