# Public note reading

## Goal
Improve the public note page for calmer reading, clearer hierarchy, and cleaner metadata treatment.

## Trigger / Entry
An anonymous visitor opens `/notes/[slug]`.

## User-Visible Behavior
- Reading width and typography feel calmer and more compact than the current implementation.
- The page feels more bespoke and human-made than a generic app detail screen.
- Authored note content remains primary.
- Supporting metadata such as date, tags, and AI summary remain visible but quieter.
- AI summary and AI tags appear directly under the title block so readers can orient themselves before reading the full note.
- The page shares the same cool monochrome visual system as the homepage.
- `h1` and `strong` no longer dominate the page with oversized scale or overly black emphasis.
- Tag chips fit their content and support longer labels without overflow.
- The note title should avoid premature wrapping; when the available page width comfortably fits it, it should stay on one line, while longer desktop titles may wrap to a second line without feeling cramped.

## Validation
- Public note pages feel more reading-first than dashboard-like.
- Metadata hierarchy is clear and non-dominant.
- The title, tags, and AI summary feel refined rather than heavy-handed.
- AI summary and tags appear before the article body.
- Title wrapping feels intentional rather than prematurely narrow, especially on desktop widths.
- Mobile reading remains comfortable.
- `npm run verify` passes.
