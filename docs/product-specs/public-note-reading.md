# Public note reading

## Goal
Improve the public note page for calmer reading, clearer hierarchy, and cleaner metadata treatment.

## Trigger / Entry
An anonymous visitor opens `/notes/[slug]`.

## User-Visible Behavior
- Reading width and typography feel calmer and more compact than the current implementation.
- Authored note content remains primary.
- Supporting metadata such as date, tags, and AI summary remain visible but quieter.
- The page shares the same cool monochrome visual system as the homepage.

## Validation
- Public note pages feel more reading-first than dashboard-like.
- Metadata hierarchy is clear and non-dominant.
- Mobile reading remains comfortable.
- `npm run verify` passes.
