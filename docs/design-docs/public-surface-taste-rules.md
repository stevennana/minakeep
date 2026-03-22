# Public Surface Taste Rules

## Goal
Define the next-wave public-surface design rules so the published homepage and public note page feel content-first, bespoke, and less like default LLM output.

## Operating Taste
- use the installed Taste-skill guidance as a design guardrail for public-surface work
- favor human-made restraint over dramatic chrome
- keep the public experience lighter and more editorial than the owner workspace, but still grounded in software-quality UI discipline

## Public-Surface Defaults
- design variance on desktop should be moderately high through masonry rhythm and asymmetry, then collapse sharply on mobile
- motion should stay low-to-medium; layout and typography should carry the design more than animation
- visual density should stay moderate so the archive feels alive without becoming a dense cockpit

## Hard Rules
- the published content must attract the first glance before the nav, counters, or search shell
- avoid centered-hero composition for the public homepage
- avoid generic equal-card marketing rows
- use one restrained accent family only
- avoid glows, neon, and AI-purple/blue clichés
- use premium sans typography for public UI and note-reading hierarchy
- public tags must feel like well-fitted metadata labels rather than decorative pills

## Showroom Layout Decision
- use a masonry-style desktop archive rather than a rigid row-and-column card grid
- the preferred cross-browser path is CSS multi-columns with `break-inside: avoid` on cards when that keeps the implementation simple and deterministic
- mobile must fall back to a strict ordered stack or narrow two-column variant to protect readability and touch-scanning

## Published Note Direction
- public note pages should feel quieter than the homepage
- the note title should be toned down further than a typical marketing `h1`
- metadata, AI summary, and tags should sit below the authored content in visual dominance
- uploaded images should support the reading experience without turning the page into an image gallery

## Anti-Goals
- do not let the topbar become a hero strip
- do not make the collapsed search row look heavier than a card
- do not use oversized black headings or thick black tag pills
- do not turn bookmark cards into image-first Pinterest clones; Minakeep is text-led even when images exist
