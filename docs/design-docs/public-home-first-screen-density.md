# Public Home First-Screen Density

## Goal
Keep the public homepage centered on published content by default, with optional search and minimal framing chrome.

## Desktop Rules
- the first viewport should show the public header and at least part of the showroom grid without scrolling
- search starts as a compact collapsed affordance rather than a fully expanded field block
- the collapsed search row should carry both the trigger and a short scope summary without becoming a second hero strip
- expanding search should still leave the first row of showroom cards visibly present in the opening viewport
- when expanded, search should claim one clean full-width row beneath the archive header instead of becoming a narrow tile beside the archive count
- supporting copy above the grid should be omitted unless it adds real utility; decorative explanation is not enough
- archive framing above the grid should stay limited to a compact label/title/count treatment rather than a large intro block

## Mobile Rules
- the first viewport should still show the top navigation and at least the beginning of the showroom feed
- search expansion should be explicit and reversible
- expanded search should not trap the visitor in a header-only state before they can return to content
- the collapsed search row and archive count should stack cleanly without forcing the first card below the fold

## Copy Rules
- do not restate obvious publishing model details in a long paragraph above the grid
- prioritize concise labels over explanatory marketing copy
- the showroom itself should communicate the product through visible published items

## Testing Implications
- screenshot checks should confirm that the first row of public content remains visible at `1440x900` and `390x844`
- UI checks should cover both collapsed and expanded search states
- UI checks should confirm that dismissing expanded search returns the compact shell to its default state
- accessibility checks should confirm that the collapsed search affordance remains discoverable and operable
