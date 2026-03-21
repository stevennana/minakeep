# Editor and form density

```json taskmeta
{
  "id": "027-editor-and-form-density",
  "title": "Editor and form density",
  "order": 27,
  "status": "queued",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "028-secondary-owner-surface-pass",
  "prompt_docs": [
    "AGENTS.md",
    "docs/FRONTEND.md",
    "docs/product-specs/owner-workspace-density.md",
    "docs/design-docs/owner-workspace-density.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run verify",
    "npm run test:e2e -- --grep @ui-forms"
  ],
  "required_files": [
    "src/features/notes/components/note-editor.tsx",
    "src/app/login/page.tsx",
    "tests/e2e"
  ],
  "human_review_triggers": []
}
```

## Objective

Make the note editor and login/form surfaces smaller, cleaner, and more reusable without changing their logic.

## Scope

- reduce form bulk and oversized intro treatment
- keep editor preview and controls readable
- rely on shared design primitives instead of one-off styling

## Out of scope

- homepage redesign
- dashboard-specific list density
- links/tags/search-specific layout work

## Exit criteria

1. Owner forms feel materially less oversized.
2. Editor and login screens use the shared design system coherently.
3. `npm run test:e2e -- --grep @ui-forms` passes with desktop/mobile screenshots, visible form hierarchy, and accessibility checks.
4. `npm run verify` passes.

## Required checks

- `npm run verify`
- `npm run test:e2e -- --grep @ui-forms`

## Evaluator notes

Promote when the deterministic UI checks pass and the editor/form surfaces are more concise without hurting usability.

## Progress log

- Start here. Append timestamped progress notes as work lands.
