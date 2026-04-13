# Markdown reference renderer foundation

```json taskmeta
{
  "id": "103-markdown-reference-renderer-foundation",
  "title": "Markdown reference renderer foundation",
  "order": 103,
  "status": "active",
  "promotion_mode": "standard",
  "next_task_on_success": "104-reference-link-note-surfaces",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/markdown-reference-links.md",
    "docs/product-specs/note-authoring.md",
    "docs/product-specs/public-note-reading.md",
    "docs/design-docs/markdown-reference-link-rendering.md"
  ],
  "required_commands": [
    "npm run test:unit",
    "npm run verify"
  ],
  "required_files": [
    "src/features/notes/markdown.ts",
    "src/features/notes/components",
    "tests/unit",
    "docs"
  ],
  "human_review_triggers": [
    "The implementation claims reference-link support but still leaves supported definitions duplicated inside the visible article body.",
    "Reference extraction mutates the saved markdown source or introduces a second persisted note-reference model.",
    "Unsafe URLs or malformed reference definitions can escape through the new rendering path."
  ]
}
```

## Objective

Teach the shared markdown renderer to recognize the supported footnote-style reference-link syntax and emit one reusable article-plus-references render contract.

## Scope

- shared markdown parsing and rendering for `[^label]` markers plus `[^label]: [Title](url)` definitions
- reusable extracted-reference structure for owner preview and published note reading
- unit coverage for reference ordering, duplicate-label reuse, and safe fallback behavior
- doc alignment for the shipped supported syntax

## Out of scope

- broader arbitrary markdown-footnote compatibility
- screenshot and responsive verification for the rendered reference section
- toolbar helpers or authoring affordances beyond raw markdown syntax

## Exit criteria

1. The shared note renderer supports the documented reference-link syntax without changing the stored markdown body.
2. Supported definitions render once in a bottom `References` section instead of remaining duplicated in the article body.
3. Reused reference labels resolve to one stable rendered entry.
4. `npm run test:unit` and `npm run verify` pass.

## Required checks

- `npm run test:unit`
- `npm run verify`

## Evaluator notes

Promote only when the renderer contract is narrow, explicit, and safe rather than a partial parser change that still leaves body/reference duplication or undefined malformed-syntax behavior.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-04-13 16:56 KST: Extended the shared note markdown renderer with a narrow article-plus-references render contract that extracts only `[^label]: [Title](url)` definitions, reorders references by first use, and reuses one rendered entry per label.
- 2026-04-13 16:56 KST: Wired owner preview and published note reading through the shared render contract so supported definitions no longer remain in the visible article body and unsupported syntax can fall back safely.
- 2026-04-13 16:56 KST: Added unit coverage for first-use ordering, duplicate-label reuse, malformed-definition fallback, and unsafe URL sanitization for extracted references.
