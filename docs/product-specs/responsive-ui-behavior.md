# Responsive UI behavior

## Goal
Keep the redesigned UI mobile-compatible and easy to scan while allowing denser layouts on desktop.

## Trigger / Entry
Visitors and owners use the core routes on smaller viewports.

## User-Visible Behavior
- Homepage note previews collapse gracefully on mobile.
- Owner navigation and core actions remain obvious and thumb-friendly.
- Dense desktop layouts simplify correctly on smaller screens instead of shrinking in place.
- Reusable layout primitives control responsive behavior consistently across routes.

## Validation
- Public and private surfaces remain usable on mobile widths.
- No critical route depends on desktop-only layout assumptions.
- Responsive behavior remains consistent across homepage, public note pages, and owner routes.
- `npm run verify` passes.
