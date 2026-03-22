# Owner workspace density

## Goal
Make the owner workspace feel tighter, more professional, and more content-dense on desktop without harming clarity or mobile usability.

## Trigger / Entry
The owner signs in and uses `/app` plus the related owner routes.

## User-Visible Behavior
- Desktop owner pages use a slimmer structural shell than the current oversized panel treatment.
- Dashboard, editor, links, tags, and search show more useful content above the fold.
- The owner dashboard prioritizes the Notes section and does not keep a competing “owner-only tools” block when that block reduces visible note space.
- The Notes section does not repeat `Links`, `Tags`, and `Search` as in-panel shortcuts when those routes already exist in the left navigation.
- On the links surface, the compact capture form stays above the saved-links list so the growing list keeps the dominant continuous lane instead of sharing a tall side-by-side split with a short form.
- Typography scale is smaller and more human-friendly than the current implementation.
- Shared presentational components keep the workspace visually consistent.

## Validation
- Desktop owner surfaces feel materially denser than the current implementation.
- The owner dashboard gives the Notes section materially more prime desktop space than secondary route promotion.
- Navigation to links, tags, and search remains clear through the shell without needing redundant dashboard shortcuts.
- The links surface keeps capture straightforward without compressing the growing saved-links list into a secondary lane.
- The owner shell and route hierarchy remain easy to understand.
- Existing owner flows remain usable on mobile.
- `npm run verify` passes.
