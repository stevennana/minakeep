# Markdown Diagram Rendering

## Goal
Add Mermaid diagrams to the existing note-markdown pipeline without breaking the repo's markdown-native authoring contract.

## Core Rules
- Mermaid support is limited to fenced code blocks whose info string is exactly `mermaid`.
- Markdown remains the only persisted note-body format.
- The shared note renderer stays the source of truth for public note output and owner preview output.
- Mermaid output must be inserted as sanitized static markup, not as executable inline note scripts.

## Rendering Direction
- The next expansion wave should replace further custom-parser growth with one server-safe, library-backed Mermaid rendering boundary that both public note pages and owner preview consume.
- Keep one Mermaid-to-HTML/SVG boundary so owner preview and public reading cannot drift.
- If Minakeep advertises a Mermaid root as supported, the renderer should emit real diagram output for that root rather than a diagram-styled text summary.
- Validation should be strong enough that malformed syntax for a supported Mermaid root reaches the fallback shell instead of being treated as a successful render.
- Flowchart support includes styling and grouping features such as `classDef`, `class`, `subgraph`, `linkStyle`, and `style`, and the shared renderer must preserve Mermaid-owned styling across public note and owner preview surfaces.
- Broader Mermaid root coverage should be staged through deterministic examples, with `classDiagram` and `stateDiagram` / `stateDiagram-v2` as the minimum next roots for this wave.

## Fallback Rules
- Invalid Mermaid source should render a stable fallback shell that explains the diagram could not render without crashing the page.
- Fallbacks should preserve enough escaped source to debug the note while avoiding giant unbounded code slabs on public surfaces.
- Failed Mermaid rendering must not block note save or note publish.

## UI Rules
- Public note pages render Mermaid blocks inline with the article body.
- Editor preview should render the same Mermaid output in both split and preview-only modes.
- Mobile layouts should prefer scaling or contained overflow treatment over horizontal page growth.
- Styled flowcharts and broader Mermaid roots should keep the same bounded shell treatment as the current note markdown renderer instead of introducing route-specific diagram chrome.

## Anti-Goals
- no Mermaid authoring canvas or visual node editor
- no Mermaid support for links or AI summaries
- no interactive pan/zoom chrome in the first wave
- no Mermaid rendering inside homepage showroom cards
