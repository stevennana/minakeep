# Owner session continuity

## Goal
Keep the owner’s authenticated state coherent when moving between public and private Minakeep routes.

## Trigger / Entry
An authenticated owner navigates from the private workspace to public routes, or from public routes back to the workspace.

## User-Visible Behavior
- Visiting the public homepage or public note pages does not unexpectedly force the owner to log in again.
- Public top navigation reflects the authenticated owner state appropriately instead of implying the owner is logged out.
- Returning from public routes to the private workspace is direct and does not require a fresh login when the session is still valid.

## Validation
- Owner authentication survives normal switching between `/app`, `/`, and `/notes/[slug]`.
- Public navigation gives the authenticated owner a clear route back to the workspace.
- The change does not expose private controls or private content to anonymous readers.
- `npm run verify` passes.
