# Mermaid renderer foundation

```json taskmeta
{
  "id": "092-mermaid-renderer-foundation",
  "title": "Mermaid renderer foundation",
  "order": 92,
  "status": "active",
  "promotion_mode": "standard",
  "next_task_on_success": "093-public-mermaid-note-surfaces",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/note-authoring.md",
    "docs/product-specs/markdown-editor-workbench.md",
    "docs/product-specs/markdown-mermaid-diagrams.md",
    "docs/design-docs/markdown-editor-workbench.md",
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
    "Mermaid support introduces a second persisted note-body format or rewrites stored markdown behind the author's back.",
    "The renderer depends on inline note scripts, remote embeds, or other unsafe public-page execution paths.",
    "Invalid Mermaid source crashes owner preview, published note rendering, or showroom preview derivation instead of failing soft."
  ]
}
```

## Objective

Extend the shared note-markdown pipeline so Mermaid fenced blocks become a first-class supported note syntax without changing the markdown-native save contract.

## Scope

- Mermaid fenced-block detection in the shared note renderer
- sanitized static diagram output or bounded fallback output
- unit coverage for valid and invalid Mermaid cases
- shared CSS primitives needed for stable rendered-diagram containers

## Out of scope

- public note-page wiring
- showroom card preview wiring
- owner editor preview wiring
- Mermaid authoring helpers or toolbar buttons

## Exit criteria

1. The shared note renderer recognizes fenced `mermaid` blocks and emits stable rendered output or a stable fallback shell.
2. Stored note markdown remains the raw authored fence text.
3. Unit coverage protects both successful and failed Mermaid rendering paths.
4. `npm run test:unit` and `npm run verify` pass.

## Required checks

- `npm run test:unit`
- `npm run verify`

## Evaluator notes

Promote only when Mermaid support is clearly a shared rendering primitive rather than a one-off patch hidden inside one route or component.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-04-04 12:31 KST: Extended `src/features/notes/markdown.ts` so fenced `mermaid` blocks are detected in the shared renderer, produce sanitized static SVG-backed output for supported Mermaid roots, and degrade to a bounded fallback shell when validation fails.
- 2026-04-04 12:31 KST: Added shared Mermaid container primitives in `src/app/globals.css` for bounded overflow, stable panel framing, and readable mobile behavior inside the shared markdown preview surface.
- 2026-04-04 12:31 KST: Added unit coverage in `tests/unit/note-markdown.test.ts` for successful Mermaid rendering, invalid Mermaid fallback behavior, and preserving the raw authored fence text.
- 2026-04-04 12:42 KST: Replaced the faux source-preview Mermaid SVG in `src/features/notes/markdown.ts` with a deterministic static flowchart renderer for `flowchart` and `graph` fences, while preserving the shared fallback shell for invalid or unsupported Mermaid blocks.
- 2026-04-04 12:42 KST: Updated shared Mermaid CSS primitives in `src/app/globals.css` so rendered nodes, edges, and overflow treatment behave consistently anywhere the shared markdown preview styles are used.
- 2026-04-04 12:42 KST: Tightened `tests/unit/note-markdown.test.ts` so the success path now asserts rendered diagram structure and labels instead of accepting a styled source-preview SVG.
