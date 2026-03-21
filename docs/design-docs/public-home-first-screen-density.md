# Public Home First-Screen Density

## Goal
Keep the public homepage centered on published content by default, with optional search and minimal framing chrome.

## Desktop Rules
- the first viewport should show the public header and at least part of the showroom grid without scrolling
- search starts as a compact collapsed affordance rather than a fully expanded field block
- supporting copy above the grid should be omitted unless it adds real utility; decorative explanation is not enough

## Mobile Rules
- the first viewport should still show the top navigation and at least the beginning of the showroom feed
- search expansion should be explicit and reversible
- expanded search should not trap the visitor in a header-only state before they can return to content

## Copy Rules
- do not restate obvious publishing model details in a long paragraph above the grid
- prioritize concise labels over explanatory marketing copy
- the showroom itself should communicate the product through visible published items

## Testing Implications
- screenshot checks should confirm that the first row of public content remains visible at `1440x900` and `390x844`
- UI checks should cover both collapsed and expanded search states
- accessibility checks should confirm that the collapsed search affordance remains discoverable and operable
