# Mermaid library renderer foundation

```json taskmeta
{
  "id": "099-mermaid-library-renderer-foundation",
  "title": "Mermaid library renderer foundation",
  "order": 99,
  "status": "active",
  "promotion_mode": "standard",
  "next_task_on_success": "100-flowchart-advanced-mermaid-features",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/markdown-mermaid-diagrams.md",
    "docs/design-docs/markdown-diagram-rendering.md"
  ],
  "required_commands": [
    "npm run test:unit",
    "npm run verify"
  ],
  "required_files": [
    "package.json",
    "src/features/notes/markdown.ts",
    "src/app/globals.css",
    "tests/unit"
  ],
  "human_review_triggers": [
    "The new Mermaid renderer still relies on the hand-built faux-diagram path for roots that the docs claim as supported.",
    "The library-backed path introduces client-side script execution, unsafe raw markup, or a second persisted diagram model.",
    "Malformed Mermaid input no longer reaches a bounded fallback shell."
  ]
}
```

## Objective

Replace the hand-built Mermaid subset with one server-safe, library-backed rendering boundary that public note pages and owner preview can both trust.

## Scope

- Mermaid renderer foundation in `src/features/notes/markdown.ts`
- safe dependency and sanitization boundary for library-backed Mermaid rendering
- shared fallback behavior for unsupported or malformed Mermaid input
- unit coverage for successful render and fallback behavior under the new renderer

## Out of scope

- flowchart styling-specific assertions beyond foundation-level smoke coverage
- broader-root UI screenshots
- Mermaid authoring helpers or toolbar actions

## Exit criteria

1. The shared renderer uses one library-backed Mermaid path rather than continuing to grow the custom hand-built subset.
2. Public note pages and owner preview still consume the same shared Mermaid rendering contract.
3. Invalid Mermaid input still fails soft with a bounded fallback.
4. `npm run test:unit` and `npm run verify` pass.

## Required checks

- `npm run test:unit`
- `npm run verify`

## Evaluator notes

Promote only when the renderer foundation clearly shifts the repo onto a library-backed Mermaid path instead of hiding the old custom subset behind new docs wording.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-04-04 22:03 KST: Replaced the custom Mermaid parser/SVG subset with a shared Mermaid library boundary. `markdown.ts` now emits one bounded Mermaid shell contract, public note pages and owner preview both upgrade that contract through the same client-side Mermaid renderer, unsupported roots stay on the fallback shell, and unit coverage now targets library render success plus fallback behavior.
