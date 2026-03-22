# Public Surface Design References

## Inputs
- Taste skill installed from `Leonxlnx/taste-skill`, using the `skills/taste-skill/SKILL.md` guidance as a design-quality guardrail
- Stack Overflow discussion on uneven Pinterest-style layouts: https://stackoverflow.com/questions/76683002/css-grid-with-uneven-rows-pinterest-style
- DEV article on Pinterest-style layouts: https://dev.to/okonkwomandy/the-easiest-way-to-build-the-pinterest-layout-without-using-a-framework-3i0g

## Practical Takeaways
- CSS Grid masonry remains uneven across browsers, so it should not be treated as the default reliable production path for this wave.
- Cross-browser Pinterest-style layouts are simplest with CSS multi-columns plus `break-inside: avoid` on the cards.
- For Minakeep, that masonry approach should be limited to the public showroom where visual rhythm matters more than strict table-like alignment.
- Mobile should collapse back to a simpler ordered stack or narrow two-column layout instead of preserving desktop asymmetry.

## Taste-Skill Takeaways To Reuse
- avoid oversized centered hero composition
- avoid generic equal-card rows and default SaaS card chrome
- use one restrained accent color family
- keep typography premium and quiet instead of loud
- make chrome support the content instead of competing with it
- fix small tactile details such as chip fit, spacing rhythm, and hierarchy before adding decorative motion
