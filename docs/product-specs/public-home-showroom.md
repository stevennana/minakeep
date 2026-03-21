# Public home showroom

## Goal
Turn the public homepage into a mixed showroom of published notes and published links with dynamic grid rhythm, lighter chrome, and first-screen priority for real content.

## Trigger / Entry
An anonymous visitor opens `/`.

## User-Visible Behavior
- The homepage is led by a mixed showroom of published notes and published links, not by a dominant marketing hero.
- The old “Owner entrance / Private origin” section is removed.
- The homepage header stays compact: a short showroom label, one archive title, and a small archive-count badge replace the older hero-style framing.
- The showroom should be visibly present in the first screen on common desktop and mobile viewports.
- Long explanatory paragraphs above the showroom are removed.
- Note and link previews appear in a grid arrangement with varied heights rather than rigid equal rows.
- The mixed feed sits in one shared archive surface rather than separate note and link sections.
- The layout stays easy to scan quickly.
- Metadata remains compact and secondary to titles and previews.

## Validation
- Mixed public content dominates the first-screen experience.
- The old owner-entrance side section is gone.
- The homepage keeps only compact framing chrome above the feed rather than a hero block or explanatory lede.
- The homepage no longer includes the extra explanatory showroom copy block above the feed.
- The homepage grid feels dynamic without becoming visually chaotic.
- Mobile layouts still scan cleanly.
- `npm run verify` passes.
