# Markdown reference-link rendering

## Goal
Add citation-style reference-link support to the shared note-markdown pipeline without breaking the repo's markdown-native note contract or the existing public/owner renderer parity.

## Core Rules
- Reference-link support is limited to footnote-style markers written as `[^label]` plus matching definitions written as `[^label]: [Link title](https://example.com)`.
- The saved note body remains one markdown string; Minakeep does not persist a separate references table or transformed note body.
- The shared note renderer stays the source of truth for owner preview and public note output.
- Reference extraction must preserve the authored paragraph flow while moving supported definitions into one rendered `References` section below the article body.

## Rendering Direction
- Supported reference definitions should be collected in first-use order, not source-definition order, so the visible list matches how readers encounter the citations.
- Repeated use of the same reference label should resolve to one rendered reference entry with one stable target id.
- The rendered reference list should support the common research-note case where the definition body is a single markdown link; broader arbitrary footnote content is out of scope for this wave.
- Inline reference markers should render as compact superscript anchors that are easy to tap and do not overpower the prose rhythm.
- The renderer should preserve safe inline markdown within the link title, but it should not allow unsafe raw HTML or javascript URLs through the new path.

## Fallback Rules
- If a reference marker has no matching supported definition, the note should stay readable rather than dropping surrounding prose.
- If a definition is malformed or uses unsupported multi-paragraph footnote content, Minakeep should fall back safely instead of corrupting the rest of the note body.
- If a supported one-line definition has no matching inline marker, Minakeep should leave that authored line visible in the article body rather than dropping it silently.
- If the author repeats a supported-looking definition line for the same label, Minakeep should not claim broader footnote merge behavior; unused duplicates stay visible as authored, while used duplicates collapse to the same one extracted reference entry.
- Failed reference extraction must not block note save or note publish.

## UI Rules
- Public note pages should render the `References` section after the authored article body and before the page ends, with enough spacing that the section reads as supporting material rather than a second article.
- Owner preview should render the same bottom reference section in both split and preview-only modes.
- Inline reference markers and bottom entries should support straightforward in-page navigation with stable ids and readable focus treatment.
- Mobile layouts should keep superscript markers tappable and bottom reference entries easy to scan without causing horizontal overflow.

## Anti-Goals
- no standalone link bibliography pages
- no support for arbitrary multi-block footnote bodies in this wave
- no separate authoring sidebar or citation manager
- no reference extraction for links, summaries, or showroom cards
