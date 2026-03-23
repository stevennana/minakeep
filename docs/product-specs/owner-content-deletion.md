# Owner content deletion

## Goal
Let the owner permanently remove notes and links from the private workspace, while protecting published content from accidental deletion.

## Trigger / Entry
The owner views an existing note or link in the private workspace and chooses to remove it.

## User-Visible Behavior
- Notes and links may be deleted only when they are already unpublished.
- If an item is published, the delete control is unavailable until the owner unpublishes it first.
- Delete uses an explicit confirmation step before the mutation runs.
- The confirmation copy states clearly that the content will be permanently removed.
- This wave does not add a trash, archive, or restore flow.
- Demonstration users may not delete notes or links.

## Validation
- An unpublished note can be permanently deleted after confirmation.
- An unpublished link can be permanently deleted after confirmation.
- Published notes and links cannot be deleted directly.
- Demonstration users cannot delete content even if they reach the same surface.
- `npm run verify` passes.

