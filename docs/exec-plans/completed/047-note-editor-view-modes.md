# Note editor view modes

```json taskmeta
{
  "id": "047-note-editor-view-modes",
  "title": "Note editor view modes",
  "order": 47,
  "status": "completed",
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
  ],
  "completed_at": "2026-03-21T09:11:25.495Z"
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
- 2026-03-21 17:49 KST: Reworked the note editor into a single workbench so desktop `Source`, `Split`, and `Preview` modes switch inside one shell while continuing to render preview through the shared note markdown renderer.
- 2026-03-21 17:49 KST: Added dedicated `@ui-note-editor-modes` Playwright coverage for desktop mode switching plus mobile non-regression, and updated existing editor UI assertions away from the removed standalone preview panel.
- 2026-03-21 18:00 KST: Refined source-pane focus restoration after returning from `Preview` so mode switching stays stable in the full suite, then passed `npm run test:e2e -- --grep @ui-note-editor-modes` and `npm run verify`.
- 2026-03-21 18:09 KST: Tightened post-edit caret restoration with a layout effect so intercepted markdown edits keep the cursor stable after mode switches, aligned the tagged mode test with the documented list-continuation behavior, and repassed `npm run test:e2e -- --grep @ui-note-editor-modes` plus `npm run verify`.
- 2026-03-21T09:11:25.495Z: automatically promoted after deterministic checks and evaluator approval.
