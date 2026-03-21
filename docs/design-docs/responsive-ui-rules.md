# Responsive UI Rules

## Goal
Keep the redesigned UI mobile-compatible from the start, with reading and scanning prioritized on smaller screens.

## Mobile-First Rules
- design base layout for small screens first, then enhance for tablet and desktop
- preserve note preview readability before introducing multi-column density
- keep interactive targets thumb-friendly

## Homepage Rules
- dynamic note showroom collapses into a clean single-column or narrow two-column pattern based on width
- the collapsed search affordance should not consume enough vertical space to push the first row of cards out of view
- note previews should remain readable without horizontal compression

## Owner Rules
- desktop sidebar/rail collapses cleanly into stacked navigation on mobile
- secondary metadata may reduce or reorder on mobile, but primary actions must remain visible
- owner surfaces should favor scanning and quick navigation over desktop-parity density

## Testing Rules
- verify desktop density on large viewports
- verify homepage note scanning on phone widths
- verify owner navigation and actions remain usable on touch screens
