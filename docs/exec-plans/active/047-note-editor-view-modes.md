# Note editor view modes

```json taskmeta
{
  "id": "047-note-editor-view-modes",
  "title": "Note editor view modes",
  "order": 47,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "048-note-editor-mobile-workflow",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/markdown-editor-workbench.md",
    "docs/design-docs/markdown-editor-workbench.md",
    "docs/references/markdown-editor-patterns.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-note-editor-modes"
  ],
  "required_files": [
    "src/features/notes/components/note-editor.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Mode switching loses note content or editor state.",
    "Split mode feels cramped or visually disconnected.",
    "Preview diverges from the actual markdown rendering contract."
  ]
}
```

## Objective

Support clear editor modes so owners can choose between raw editing, split drafting, and preview review.

## Scope

- `Source`, `Split`, and `Preview` modes for desktop note editing
- stable mode switching
- preview continuity with the real note renderer

## Out of scope

- mobile-specific layout rules
- new markdown syntax support unrelated to editor modes
- public note reading changes

## Exit criteria

1. Desktop note editing exposes `Source`, `Split`, and `Preview` modes.
2. Owners can switch modes without losing text or breaking the preview.
3. Split mode is clearly usable for normal drafting work.
4. `npm run test:e2e -- --grep @ui-note-editor-modes` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-note-editor-modes`

## Evaluator notes

Promote only when mode switching is stable and the split view feels like a coherent workbench rather than duplicated panels.

## Progress log

- Start here. Append timestamped progress notes as work lands.
