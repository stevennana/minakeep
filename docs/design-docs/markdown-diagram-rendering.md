# Markdown Diagram Rendering

## Goal
Add Mermaid diagrams to the existing note-markdown pipeline without breaking the repo's markdown-native authoring contract.

## Core Rules
- Mermaid support is limited to fenced code blocks whose info string is exactly `mermaid`.
- Markdown remains the only persisted note-body format.
- The shared note renderer stays the source of truth for public note output and owner preview output.
- Mermaid output must be inserted as sanitized static markup, not as executable inline note scripts.

## Rendering Direction
- Extend the existing `src/features/notes/markdown.ts` pipeline rather than introducing a separate markdown stack for one syntax.
- Keep one Mermaid-to-HTML/SVG boundary so owner preview and public reading cannot drift.

## Fallback Rules
- Invalid Mermaid source should render a stable fallback shell that explains the diagram could not render without crashing the page.
- Fallbacks should preserve enough escaped source to debug the note while avoiding giant unbounded code slabs on public surfaces.
- Failed Mermaid rendering must not block note save or note publish.

## UI Rules
- Public note pages render Mermaid blocks inline with the article body.
- Editor preview should render the same Mermaid output in both split and preview-only modes.
- Mobile layouts should prefer scaling or contained overflow treatment over horizontal page growth.

## Anti-Goals
- no Mermaid authoring canvas or visual node editor
- no Mermaid support for links or AI summaries
- no interactive pan/zoom chrome in the first wave
- no Mermaid rendering inside homepage showroom cards
