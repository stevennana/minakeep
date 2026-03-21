# Public link publishing

## Goal
Let the owner publish or unpublish links and expose published links on the public homepage alongside published notes.

## Trigger / Entry
The owner opens the private links area and chooses to publish or unpublish a saved link.

## User-Visible Behavior
- The owner can publish or unpublish a link explicitly from the links manager.
- Published links appear in the public showroom alongside published notes.
- Public link cards show title, summary, and tags.
- Clicking a published link card opens the saved external URL in a new tab.
- Unpublished links never appear on public routes.

## Validation
- Publishing a link makes it visible on the public homepage.
- Unpublishing removes the link from the public homepage.
- Public link cards open the external destination in a new tab instead of replacing the current page.
- `npm run verify` passes.
