# Homepage Showroom Rhythm

## Goal
Make the public homepage feel like a dynamic showroom of notes rather than a product landing page.

## Composition Rules
- note previews are the primary content, not hero copy
- introductory framing stays present but visually secondary and short
- the topbar and collapsed search affordance must read as support chrome, not as the first focal point
- the first screen should reveal real showroom cards on common desktop and mobile viewports
- the desktop archive should feel dynamic through masonry-style column flow and card-height variation, not through chaotic offsets
- the showroom must remain easy to scan quickly
- search chrome should stay compact by default so it does not dominate the first screen

## Card Rhythm
- cards may vary in height based on preview length, summary presence, tag density, and optional head image presence
- desktop should prefer 3 to 5 columns depending on available width; tablet should step down to 2 columns; narrow mobile should collapse to 1 column
- masonry flow may be implemented with CSS multi-columns plus `break-inside: avoid` for cards, or another deterministic approach that preserves readability
- equal-height rows are not the target
- occasional emphasis cards are acceptable only if they do not break readability, keyboard flow, or mobile collapse

## Content Priority
- title first
- short preview or summary second
- compact date/meta third
- tags last

## Anti-Goals
- no giant hero dominating above-the-fold space
- no multi-paragraph explanatory block above the grid
- no permanently expanded search bar that consumes showroom space by default
- no rigid uniform archive wall
- no two-column desktop layout that still feels like a generic stacked app grid
- no Pinterest-like randomness that hurts note scanning
