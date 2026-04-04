# Mermaid semantic rendering foundation

```json taskmeta
{
  "id": "096-mermaid-semantic-rendering-foundation",
  "title": "Mermaid semantic rendering foundation",
  "order": 96,
  "status": "active",
  "promotion_mode": "standard",
  "next_task_on_success": "097-public-mermaid-contract-realignment",
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
    "src/features/notes/markdown.ts",
    "src/app/globals.css",
    "tests/unit"
  ],
  "human_review_triggers": [
    "Supported Mermaid roots still render as diagram-themed text summaries instead of semantic diagram output.",
    "The renderer claims success for malformed syntax in a supported Mermaid root instead of reaching the fallback shell.",
    "The new shared Mermaid path introduces client-only script execution or mutates stored markdown."
  ]
}
```

## Objective

Reset the shared Mermaid renderer so every Mermaid root Minakeep treats as supported has a real semantic rendering path, while malformed syntax for supported roots reliably falls back.

## Scope

- shared Mermaid renderer contract in `src/features/notes/markdown.ts`
- supported-root validation and fallback rules
- unit coverage for real rendered output versus fallback across flowchart and non-flowchart roots
- shared CSS adjustments only where the stricter renderer needs different container treatment

## Out of scope

- public note page route wiring beyond consuming the shared renderer
- editor mode behavior beyond consuming the shared renderer
- Mermaid authoring helpers or toolbar additions

## Exit criteria

1. Supported Mermaid roots that Minakeep claims to render no longer collapse into generic summary cards.
2. Malformed syntax for supported Mermaid roots reaches the fallback shell rather than appearing as a successful render.
3. The shared renderer contract remains markdown-native and server-safe.
4. `npm run test:unit` and `npm run verify` pass.

## Required checks

- `npm run test:unit`
- `npm run verify`

## Evaluator notes

Promote only when the shared renderer contract is materially stricter than the shipped faux-diagram implementation and the new supported-root behavior is protected by unit tests rather than narrative claims.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-04-04 14:32:31 KST: Replaced the faux generic Mermaid success path in `src/features/notes/markdown.ts` with a stricter supported-root contract. Minakeep now treats only `flowchart`, `graph`, and `sequenceDiagram` as supported roots, preserving the existing semantic flowchart renderer and adding a semantic SVG renderer for `sequenceDiagram`.
- 2026-04-04 14:32:31 KST: Added unit coverage proving rendered output for supported flowchart and sequence diagrams, fallback for unsupported roots, and fallback for malformed syntax in supported roots. Updated shared Mermaid SVG styling in `src/app/globals.css` for the new sequence renderer without changing route wiring.
