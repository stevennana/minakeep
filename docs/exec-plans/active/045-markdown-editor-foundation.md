# Markdown editor foundation

```json taskmeta
{
  "id": "045-markdown-editor-foundation",
  "title": "Markdown editor foundation",
  "order": 45,
  "status": "active",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "046-note-editor-toolbar-and-shortcuts",
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
    "npm run test:e2e -- --grep @ui-note-editor-foundation"
  ],
  "required_files": [
    "src/features/notes/components/note-editor.tsx",
    "src/app/globals.css",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "The editor still behaves like a plain textarea without a workbench upgrade.",
    "The implementation introduces a second non-markdown document model.",
    "The new editing core breaks basic note saving or preview rendering."
  ]
}
```

## Objective

Establish a source-first markdown editor foundation that feels materially better than a plain textarea while preserving markdown as the saved note body.

## Scope

- source-first editor-surface upgrade for note authoring
- syntax-aware editing behavior
- compatibility with existing note save and preview flows

## Out of scope

- toolbar richness beyond the minimum needed to prove the editor foundation
- advanced mobile mode design
- collaboration features or rich-text storage

## Exit criteria

1. The note editor no longer feels like a plain textarea.
2. Note content still saves as markdown text and renders correctly in preview.
3. Existing note create/edit flows remain intact.
4. `npm run test:e2e -- --grep @ui-note-editor-foundation` passes.
5. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-note-editor-foundation`

## Evaluator notes

Promote only when the richer editor foundation is clearly in place without changing the note data model.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-03-21 17:31:14 KST: Replaced the plain note textarea with a source-first markdown workbench surface in `src/features/notes/components/note-editor.tsx`, keeping the existing form action contract and markdown preview renderer intact.
- 2026-03-21 17:31:14 KST: Added syntax-aware editing affordances for indenting and list or blockquote continuation, plus workbench chrome, highlighting, line numbers, and responsive styling in `src/app/globals.css`.
- 2026-03-21 17:31:14 KST: Added scoped Playwright coverage for `@ui-note-editor-foundation` and refreshed the affected editor screenshot baselines after the new workbench layout landed.
