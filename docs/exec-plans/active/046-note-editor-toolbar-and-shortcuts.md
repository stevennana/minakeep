# Note editor toolbar and shortcuts

```json taskmeta
{
  "id": "046-note-editor-toolbar-and-shortcuts",
  "title": "Note editor toolbar and shortcuts",
  "order": 46,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "047-note-editor-view-modes",
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
    "npm run test:e2e -- --grep @ui-note-editor-toolbar"
  ],
  "required_files": [
    "src/features/notes/components/note-editor.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Toolbar controls feel bloated like a word processor.",
    "Toolbar actions insert broken markdown or hide the underlying source too aggressively.",
    "Keyboard-driven editing gets worse for experienced markdown users."
  ]
}
```

## Objective

Add compact authoring aids that make common markdown operations faster without turning the note editor into a heavy rich-text UI.

## Scope

- compact formatting toolbar
- markdown insertion or transformation helpers
- keyboard-shortcut friendly behavior

## Out of scope

- split/preview mode orchestration
- mobile-specific workflow polish beyond baseline usability
- image upload or attachment support

## Exit criteria

1. Owners can apply common markdown structures quickly through compact controls.
2. Toolbar actions produce predictable markdown output.
3. Experienced keyboard-first editing still feels natural.
4. `npm run test:e2e -- --grep @ui-note-editor-toolbar` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-note-editor-toolbar`

## Evaluator notes

Promote only when the toolbar improves speed without bloating the note editor or compromising source transparency.

## Progress log

- Start here. Append timestamped progress notes as work lands.
