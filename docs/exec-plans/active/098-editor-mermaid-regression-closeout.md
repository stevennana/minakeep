# Editor Mermaid regression closeout

```json taskmeta
{
  "id": "098-editor-mermaid-regression-closeout",
  "title": "Editor Mermaid regression closeout",
  "order": 98,
  "status": "queued",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "NONE",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/note-authoring.md",
    "docs/product-specs/markdown-editor-workbench.md",
    "docs/product-specs/markdown-mermaid-diagrams.md",
    "docs/design-docs/markdown-diagram-rendering.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @ui-note-editor-mermaid",
    "npm run test:e2e -- --grep @ui-mermaid-regression",
    "npm run verify"
  ],
  "required_files": [
    "src/features/notes/components/note-editor.tsx",
    "src/app/globals.css",
    "tests/e2e",
    "docs"
  ],
  "human_review_triggers": [
    "Owner preview still diverges from the stricter public Mermaid contract for supported roots or supported-root failures.",
    "Preview mode or save flows rewrite authored Mermaid fences while adapting to the stricter renderer.",
    "The hardening pass leaves docs, active queue, or regression tags behind the actual shipped Mermaid behavior."
  ]
}
```

## Objective

Carry the stricter Mermaid renderer contract through the owner preview path and close the next Mermaid wave with one deterministic replay path.

## Scope

- editor preview parity for supported Mermaid roots and supported-root failures
- deterministic Mermaid regression replay across public note and editor surfaces
- final doc and queue alignment for the stricter Mermaid contract

## Out of scope

- Mermaid authoring productivity features
- new public surfaces beyond published note reading
- broader markdown rendering changes unrelated to Mermaid

## Exit criteria

1. Owner preview matches the stricter public Mermaid contract for supported roots and supported-root fallback behavior.
2. Saving and reopening notes still preserves the raw Mermaid fence text unchanged.
3. One Mermaid regression command replays the shipped public-note and editor Mermaid surfaces under the stricter contract.
4. `npm run test:e2e -- --grep @ui-note-editor-mermaid`, `npm run test:e2e -- --grep @ui-mermaid-regression`, and `npm run verify` pass.

## Required checks

- `npm run test:e2e -- --grep @ui-note-editor-mermaid`
- `npm run test:e2e -- --grep @ui-mermaid-regression`
- `npm run verify`

## Evaluator notes

Promote only when the next Mermaid wave closes with the docs, queue, and regression bundle all describing the same stricter renderer that actually shipped.

## Progress log

- Start here. Append timestamped progress notes as work lands.
