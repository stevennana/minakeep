# Note editor hardening

```json taskmeta
{
  "id": "049-note-editor-hardening",
  "title": "Note editor hardening",
  "order": 49,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/note-authoring.md",
    "docs/product-specs/markdown-editor-workbench.md",
    "docs/design-docs/markdown-editor-workbench.md"
  ],
  "required_commands": [
    "npm run verify"
  ],
  "required_files": [
    "docs",
    "src/features/notes/components/note-editor.tsx",
    "tests/e2e",
    "tests/unit"
  ],
  "human_review_triggers": [
    "The richer editor drifts from the markdown persistence contract.",
    "Docs and shipped note-editor behavior diverge.",
    "Regression coverage still misses mode-switch or markdown-fidelity risks."
  ]
}
```

## Objective

Reconcile docs, regression coverage, and markdown-fidelity protection after the richer editor wave lands.

## Scope

- doc alignment for the richer note-editor behavior
- regression and fidelity coverage
- remaining editor debt tracking

## Out of scope

- new editor features beyond the agreed workbench scope
- collaborative note editing
- attachment management

## Exit criteria

1. Docs reflect the shipped source-first editor workbench accurately.
2. Markdown fidelity and mode-switch risks are covered by deterministic checks.
3. Remaining note-editor debt is either fixed or explicitly tracked.
4. `npm run verify` passes.

## Required checks

- `npm run verify`

## Evaluator notes

Promote only when the richer editor wave is documented, protected, and still clearly markdown-native.

## Progress log

- Start here. Append timestamped progress notes as work lands.
