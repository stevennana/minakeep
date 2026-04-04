# Flowchart advanced Mermaid features

```json taskmeta
{
  "id": "100-flowchart-advanced-mermaid-features",
  "title": "Flowchart advanced Mermaid features",
  "order": 100,
  "status": "queued",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "101-broader-mermaid-root-support",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/markdown-mermaid-diagrams.md",
    "docs/design-docs/markdown-diagram-rendering.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @ui-public-note-mermaid",
    "npm run test:e2e -- --grep @ui-note-editor-mermaid",
    "npm run verify"
  ],
  "required_files": [
    "src/features/notes/markdown.ts",
    "src/app/globals.css",
    "tests/e2e",
    "tests/unit"
  ],
  "human_review_triggers": [
    "Flowcharts using `classDef`, `class`, `subgraph`, `linkStyle`, or `style` still degrade unexpectedly or fall back without the docs saying so.",
    "Styled flowcharts render differently between public note reading and owner preview.",
    "Advanced flowchart styling causes overflow, clipping, or unreadable labels on mobile."
  ]
}
```

## Objective

Extend Mermaid flowchart support so styled and grouped flowcharts render as real diagrams instead of requiring users to stay within the basic node-and-edge subset.

## Scope

- `classDef`, `class`, `subgraph`, `linkStyle`, and `style` for Mermaid flowcharts
- public note and owner preview verification for the styled flowchart path
- deterministic screenshot and responsive coverage for advanced flowcharts

## Out of scope

- broader Mermaid root families
- Mermaid click handlers or other interactive commands
- homepage/showroom rendering

## Exit criteria

1. Flowcharts that use `classDef`, `class`, `subgraph`, `linkStyle`, and `style` render successfully through the shared Mermaid renderer.
2. Owner preview and public note pages present the same styled flowchart output from the same markdown source.
3. Desktop and mobile surfaces remain bounded and readable.
4. `npm run test:e2e -- --grep @ui-public-note-mermaid`, `npm run test:e2e -- --grep @ui-note-editor-mermaid`, and `npm run verify` pass.

## Required checks

- `npm run test:e2e -- --grep @ui-public-note-mermaid`
- `npm run test:e2e -- --grep @ui-note-editor-mermaid`
- `npm run verify`

## Evaluator notes

Promote only when flowchart styling support is demonstrably broader than the current subset and is protected by deterministic coverage rather than one hand-tested sample.

## Progress log

- Start here. Append timestamped progress notes as work lands.
