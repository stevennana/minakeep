# Owner workspace density

## Goal
Make the owner workspace feel tighter, more professional, and more content-dense on desktop without harming clarity or mobile usability.

## Trigger / Entry
The owner signs in and uses `/app` plus the related owner routes.

## User-Visible Behavior
- Desktop owner pages use a slimmer structural shell than the current oversized panel treatment.
- Dashboard, editor, links, tags, and search show more useful content above the fold.
- The owner dashboard prioritizes the Notes section and does not keep a competing “owner-only tools” block when that block reduces visible note space.
- Typography scale is smaller and more human-friendly than the current implementation.
- Shared presentational components keep the workspace visually consistent.

## Validation
- Desktop owner surfaces feel materially denser than the current implementation.
- The owner dashboard gives the Notes section materially more prime desktop space than secondary route promotion.
- The owner shell and route hierarchy remain easy to understand.
- Existing owner flows remain usable on mobile.
- `npm run verify` passes.
