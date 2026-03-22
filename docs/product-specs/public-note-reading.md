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
- The page shares the same cool monochrome visual system as the homepage.
- `h1` and `strong` no longer dominate the page with oversized scale or overly black emphasis.
- Tag chips fit their content and support longer labels without overflow.

## Validation
- Public note pages feel more reading-first than dashboard-like.
- Metadata hierarchy is clear and non-dominant.
- The title, tags, and AI summary feel refined rather than heavy-handed.
- Mobile reading remains comfortable.
- `npm run verify` passes.
