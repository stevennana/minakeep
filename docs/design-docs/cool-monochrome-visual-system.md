# Cool Monochrome Visual System

## Goal
Replace the current warm paper atmosphere with a cooler monochrome studio that feels sharper, calmer, and more precise.

## Palette Direction
- dominant white and off-white surfaces
- slate, graphite, and charcoal structure
- restrained accents only for state, links, and calls to action
- one accent family per surface; do not stack multiple competing accent hues on the public pages
- avoid beige or warm parchment tone as the main atmosphere

## Typography Direction
- mostly neutral premium sans hierarchy
- noticeably smaller display and heading scale than the current implementation
- strong contrast between UI metadata, titles, and reading copy
- line length should favor reading comfort rather than visual monumentality
- public `h1` treatment should feel deliberate and quiet rather than loud or oversized
- `strong` should emphasize information without reading as heavy black blocks

## Reusable Styling Rules
- centralize color, spacing, type scale, radius, border, and shadow values in shared CSS variables
- prefer shared primitives such as shell, panel, card, note-preview, metadata-row, tag-chip, and button variants
- keep feature logic independent from visual wrappers whenever possible
- a future style refresh should mostly edit shared primitives and tokens, not route logic
- public tag-chip primitives must size to text naturally and handle long labels without overflow
- topbar and search-shell primitives should be visually quieter than the content surfaces they frame

## Anti-Goals
- do not drift into warm editorial parchment again
- do not build one-off route-specific card systems when a shared primitive can cover the case
- do not use oversized hero typography for routine content surfaces
- do not fall back to generic SaaS card rows or glowing AI-purple accents
