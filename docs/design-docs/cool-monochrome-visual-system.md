# Cool Monochrome Visual System

## Goal
Replace the current warm paper atmosphere with a cooler monochrome studio that feels sharper, calmer, and more precise.

## Palette Direction
- dominant white and off-white surfaces
- slate, graphite, and charcoal structure
- restrained accents only for state, links, and calls to action
- avoid beige or warm parchment tone as the main atmosphere

## Typography Direction
- mostly neutral sans hierarchy
- noticeably smaller display and heading scale than the current implementation
- strong contrast between UI metadata, titles, and reading copy
- line length should favor reading comfort rather than visual monumentality

## Reusable Styling Rules
- centralize color, spacing, type scale, radius, border, and shadow values in shared CSS variables
- prefer shared primitives such as shell, panel, card, note-preview, metadata-row, tag-chip, and button variants
- keep feature logic independent from visual wrappers whenever possible
- a future style refresh should mostly edit shared primitives and tokens, not route logic

## Anti-Goals
- do not drift into warm editorial parchment again
- do not build one-off route-specific card systems when a shared primitive can cover the case
- do not use oversized hero typography for routine content surfaces
