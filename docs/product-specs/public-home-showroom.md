# Public home showroom

## Goal
Turn the public homepage into a mixed showroom of published notes and published links with dynamic grid rhythm, lighter chrome, and first-screen priority for real content.

## Trigger / Entry
An anonymous visitor opens `/`.

## User-Visible Behavior
- The homepage is led by a mixed showroom of published notes and published links, not by a dominant marketing hero.
- The old “Owner entrance / Private origin” section is removed.
- The homepage header stays compact: a short showroom label, one archive title, and a small archive-count badge replace the older hero-style framing.
- Topbar and search chrome are visually quieter than the archive itself.
- The showroom should be visibly present in the first screen on common desktop and mobile viewports.
- Long explanatory paragraphs above the showroom are removed.
- Note and link previews appear in a masonry-style arrangement with varied heights rather than rigid equal rows.
- Desktop widths should feel more dynamic than a simple two-column grid, while mobile collapse remains strict and readable.
- The mixed feed sits in one shared archive surface rather than separate note and link sections.
- The showroom loads the first 10 published items on first render, then continues from a bottom `Load more` control as visitors reach it.
- The layout stays easy to scan quickly.
- Metadata remains compact and secondary to titles and previews.
- Published note preview images open the same note detail page as the note title.
- Published link preview image areas open the same external destination as the link title, in a new tab.

## Validation
- Mixed public content dominates the first-screen experience.
- The old owner-entrance side section is gone.
- The homepage keeps only compact framing chrome above the feed rather than a hero block or explanatory lede.
- The homepage no longer includes the extra explanatory showroom copy block above the feed.
- The homepage grid feels dynamic without becoming visually chaotic.
- The homepage avoids loading the full published archive on first render while still continuing automatically at the bottom of the feed.
- Desktop does not collapse back into a generic two-column app grid.
- Mobile layouts still scan cleanly.
- Preview-image click targets match the same destinations as the related note/link titles.
- `npm run verify` passes.
