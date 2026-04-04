# Mermaid wave hardening

```json taskmeta
{
  "id": "095-mermaid-wave-hardening",
  "title": "Mermaid wave hardening",
  "order": 95,
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
    "src/features/notes",
    "src/features/public-content",
    "tests/e2e",
    "tests/unit"
  ],
  "human_review_triggers": [
    "The Mermaid wave still relies on stale queue/docs wording that no longer matches shipped behavior.",
    "Cross-surface Mermaid coverage passes only in isolation but still drifts in the full verify path.",
    "Fallback, screenshot, or responsive regressions remain unprotected after the feature wave lands."
  ]
}
```

## Objective

Close the Mermaid tranche by proving the renderer, public note reading, and editor preview stay aligned under one deterministic replay path.

## Scope

- Mermaid regression bundle for public note reading and editor preview
- final doc and queue alignment for the shipped Mermaid wave
- snapshot and responsive proof for the new diagram surfaces

## Out of scope

- new diagram syntaxes beyond Mermaid fences
- additional editor productivity features
- non-note markdown rendering changes

## Exit criteria

1. One Mermaid regression command replays the shipped public and owner diagram surfaces.
2. Supporting docs and the active/completed queue reflect the actual Mermaid implementation shape.
3. The full repo gate still passes after Mermaid coverage joins the suite.
4. `npm run test:e2e -- --grep @ui-mermaid-regression` and `npm run verify` pass.

## Required checks

- `npm run test:e2e -- --grep @ui-mermaid-regression`
- `npm run verify`

## Evaluator notes

Promote only when the Mermaid wave reads as a finished shipped slice with stable regression coverage instead of a feature branch that never reconciled its queue and docs.

## Progress log

- Start here. Append timestamped progress notes as work lands.
