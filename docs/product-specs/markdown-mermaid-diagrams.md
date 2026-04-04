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
- Mermaid rendering must not require third-party iframes, remote image fetches, or inline script execution inside note content.
- Invalid Mermaid syntax does not block note save, publish, or public reading; it degrades to a visible non-crashing fallback state.

## Validation
- A note that contains Mermaid fences persists the original markdown unchanged.
- Owner preview and public note pages use the same Mermaid rendering contract.
- Invalid Mermaid content fails soft with a readable fallback rather than breaking the page.
- Diagram output stays readable on desktop and mobile without overflowing its container.
- `npm run verify` passes.
