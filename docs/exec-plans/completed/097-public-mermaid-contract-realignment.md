# Public Mermaid contract realignment

```json taskmeta
{
  "id": "097-public-mermaid-contract-realignment",
  "title": "Public Mermaid contract realignment",
  "order": 97,
  "status": "completed",
  "promotion_mode": "deterministic_only",
  "next_task_on_success": "098-editor-mermaid-regression-closeout",
  "prompt_docs": [
    "AGENTS.md",
    "ARCHITECTURE.md",
    "docs/FRONTEND.md",
    "docs/product-specs/public-note-reading.md",
    "docs/product-specs/markdown-mermaid-diagrams.md",
    "docs/design-docs/markdown-diagram-rendering.md",
    "docs/references/ui-verification-contract.md"
  ],
  "required_commands": [
    "npm run test:e2e -- --grep @ui-public-note-mermaid",
    "npm run verify"
  ],
  "required_files": [
    "src/app/notes/[slug]/page.tsx",
    "src/app/globals.css",
    "tests/e2e"
  ],
  "human_review_triggers": [
    "Published note pages still show generic diagram-summary shells for supported non-flowchart Mermaid roots.",
    "Malformed syntax for a supported Mermaid root still appears as a successful public render instead of a visible fallback.",
    "The stricter public Mermaid renderer causes overflow, unreadable labels, or unstable mobile note reading."
  ],
  "completed_at": "2026-04-04T06:09:03.938Z"
}
```

## Objective

Prove the stricter Mermaid renderer contract holds on published note pages for both supported-root success cases and supported-root failure cases.

## Scope

- public note reading for supported Mermaid roots
- public fallback behavior for malformed supported-root Mermaid
- responsive and screenshot verification for the stricter public note output

## Out of scope

- editor preview mode switching
- new Mermaid roots beyond what task 096 explicitly supports
- homepage/showroom behavior

## Exit criteria

1. Public note pages show real semantic Mermaid output for at least one supported non-flowchart root in addition to flowchart coverage.
2. Public note pages show the documented fallback shell for malformed syntax in a supported Mermaid root.
3. Desktop and mobile public note reading remain bounded and readable under the stricter renderer.
4. `npm run test:e2e -- --grep @ui-public-note-mermaid` and `npm run verify` pass.

## Required checks

- `npm run test:e2e -- --grep @ui-public-note-mermaid`
- `npm run verify`

## Evaluator notes

Promote only when the public note page no longer gives a false impression that non-flowchart Mermaid is implemented by hiding source inside decorative summary art.

## Progress log

- Start here. Append timestamped progress notes as work lands.
- 2026-04-04T05:58:28.850Z: restored as current task after 096-mermaid-semantic-rendering-foundation promotion.
- 2026-04-04T06:22:00.000Z: audited the public note Mermaid path and confirmed the shared markdown renderer already supports `sequenceDiagram`; the task gap was public-contract proof rather than missing renderer plumbing.
- 2026-04-04T06:27:00.000Z: expanded `@ui-public-note-mermaid` coverage to seed three public cases in one note: flowchart success, `sequenceDiagram` success, and malformed `sequenceDiagram` fallback, with assertions against real sequence-diagram SVG structure plus bounded fallback output.
- 2026-04-04T06:29:00.000Z: added a stable public-note article test id and a small public sequence-diagram width rule to keep stricter screenshot/readability checks deterministic across desktop and mobile.
- 2026-04-04T06:09:03.938Z: automatically promoted after deterministic checks and evaluator approval.
