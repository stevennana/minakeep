# Markdown Mermaid diagrams

## Goal
Let note authors write Mermaid diagrams in markdown once and have Minakeep render them consistently in the editor preview and public note pages.

## Trigger / Entry
The owner writes a fenced code block with the info string `mermaid` inside a note body.

## User-Visible Behavior
- Mermaid support is opt-in through fenced code blocks written as ```` ```mermaid ````.
- The saved note body remains raw markdown; Minakeep does not store a second diagram document model.
- The owner preview renders the Mermaid block as a diagram or a bounded readable fallback when the Mermaid source is invalid.
- Published note pages render the same Mermaid block from the same markdown source instead of showing raw fenced code.
- Supported Mermaid roots should render as real diagram output for that root type; a diagram-themed summary card is not sufficient.
- Flowchart support includes richer styling and grouping features including `classDef`, `class`, `subgraph`, `linkStyle`, and `style`; authors do not need to stay inside a plain node-and-edge subset.
- The next expansion wave should also broaden supported Mermaid roots beyond the current baseline, with deterministic coverage anchored on `classDiagram` and `stateDiagram` / `stateDiagram-v2` in addition to the existing `flowchart` / `graph` and `sequenceDiagram` paths.
- Mermaid rendering must not require third-party iframes, remote image fetches, or inline script execution inside note content.
- Invalid Mermaid syntax does not block note save, publish, or public reading; it degrades to a visible non-crashing fallback state.

## Validation
- A note that contains Mermaid fences persists the original markdown unchanged.
- Owner preview and public note pages use the same Mermaid rendering contract.
- Supported Mermaid roots that Minakeep claims to render do not collapse into generic source-summary shells.
- Invalid Mermaid content fails soft with a readable fallback rather than breaking the page.
- Invalid syntax for supported Mermaid roots also reaches the fallback path instead of appearing as a successful render.
- Styled flowcharts that use `classDef`, `class`, `subgraph`, `linkStyle`, and `style` render consistently in owner preview and published note reading when Minakeep claims support for them.
- Additional Mermaid roots should be documented only when deterministic tests prove their success and fallback behavior end to end.
- Diagram output stays readable on desktop and mobile without overflowing its container.
- `npm run verify` passes.
