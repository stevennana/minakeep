# Editor and form density

```json taskmeta
{
  "id": "027-editor-and-form-density",
  "title": "Editor and form density",
  "order": 27,
  "status": "completed",
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
  "human_review_triggers": [],
  "completed_at": "2026-03-21T03:43:04.542Z"
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
- 2026-03-21 12:31 KST: Read the required UI, spec, design, and task docs plus the frontend design/responsive skills. Confirmed the current login and note editor rely on oversized route-specific styling and that the required `@ui-forms` Playwright spec was missing.
- 2026-03-21 12:31 KST: Refactored the login page and note editor onto shared intro and form-field primitives, tightened the editor/login surface spacing and typography in `globals.css`, and added deterministic `@ui-forms` coverage for login and note editor desktop/mobile hierarchy plus screenshots.
- 2026-03-21 12:40 KST: Refreshed the affected login screenshot baseline used by `ui-system`, verified `npm run test:e2e -- --grep @ui-forms`, and completed a passing `npm run verify` run. The first verify attempt was blocked by a transient `@ai-real` link test failure, and the second full run passed cleanly without code changes outside this task.
- 2026-03-21T03:43:04.542Z: automatically promoted after deterministic checks and evaluator approval.
