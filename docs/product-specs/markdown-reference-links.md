# Markdown reference links

## Goal
Let note authors keep dense citation-style links out of the prose by writing footnote-style markdown references that render as easy-to-scan reference links at the bottom of the note.

## Trigger / Entry
The owner writes or previews a note that uses footnote-style reference syntax, or an anonymous reader opens a published note that contains those references.

## User-Visible Behavior
- The shared note markdown renderer accepts footnote-style references written as `[^label]` inside prose.
- The shared note markdown renderer accepts matching reference definitions written as `[^label]: [Reference title](https://example.com)` in the note body.
- Supported extraction is intentionally narrow: only single-line definitions whose body is one markdown link move into the rendered `References` section.
- Duplicate supported-looking definition lines do not expand the contract into full Markdown footnotes; they stay visible as authored unless an inline marker uses that label, in which case Minakeep extracts one reference entry and removes the duplicated definition lines from the article body.
- In owner preview and on published note pages, inline `[^label]` markers render as compact superscript-style reference affordances instead of raw bracket syntax.
- Matching reference definitions do not remain duplicated inside the visible article body; Minakeep collects them into one bottom-of-note `References` section.
- The bottom `References` section lists references in first-use order so readers can scan them without hunting through the note source.
- Reference entries keep a readable link title and open the linked destination in a new tab.
- Reusing the same reference label multiple times in the note reuses the same bottom reference entry instead of duplicating it.
- Readers can move from an inline reference marker to the matching bottom reference entry easily on desktop and mobile.
- Owner preview uses the same extracted-reference rendering rules as the published note page.
- A supported-looking reference definition that is never used by any inline `[^label]` marker stays visible in the article body instead of disappearing silently.
- Unsupported multi-line or otherwise malformed reference definitions stay visible in the article body, and unmatched inline markers remain raw `[^label]` text instead of corrupting surrounding prose.

## Validation
- Notes can stay readable even when they contain many source links.
- The main article body no longer ends with repeated inline raw URLs when the author uses supported reference syntax.
- The same reference label can appear more than once without creating duplicate bottom entries.
- Supported reference links render consistently in owner preview and on published note pages.
- Mobile readers can reach and activate reference links without cramped hit targets or broken scroll jumps.
- Unsupported or malformed reference syntax degrades safely without breaking the rest of the note render.
- `npm run verify` passes.
