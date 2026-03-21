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
- 2026-03-21 18:29:29 KST: Aligned the note-authoring and markdown-workbench docs with the shipped source-first editor behavior, including desktop split-by-default, mobile `Edit` / `Preview`, and the textarea-backed highlighted source surface.
- 2026-03-21 18:29:29 KST: Extracted the note editor's markdown transform and viewport-mode sync logic into a pure notes helper, added deterministic unit coverage for reversible markdown actions, indentation, list/quote continuation, and viewport mode syncing, and tracked the remaining split-view scroll-sync debt explicitly in the tech-debt tracker.
