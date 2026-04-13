# Image loading priority

## Goal
Make visible note images and link favicons load first without turning the initial route payload into an eager-loaded media flood.

## Trigger / Entry
- An anonymous visitor opens `/`.
- An anonymous visitor opens `/notes/[slug]`.
- The owner opens `/app` or `/app/links`.
- The owner opens the note-editor preview surface.

## User-Visible Behavior
- The first image media a visitor or owner is expected to see on initial render loads ahead of offscreen note-card images, favicons, or later markdown images.
- One shared loading-intent contract drives note-card images, cached favicons, and rendered markdown images so surfaces can choose prioritized versus lazy media without rewriting image URLs or labels.
- Public showroom preview media uses a small capped eager/high-priority budget for the initial first-screen cards instead of marking the whole first 10-item slice as eager.
- Owner dashboard note-card images and owner links favicons prioritize only the top visible media on initial render; lower-list media remains lazy.
- Public note reading and owner preview spend one prioritized-image slot only when the first rendered markdown image lands in the opening viewport band; if opening copy pushes that first image lower, it stays lazy and later markdown images remain lazy too.
- Incremental `Load more` behavior keeps appended card media lazy by default and relies on normal viewport-based loading once those items approach visibility.
- Image fallback states and non-image cards keep the existing layout rhythm and do not introduce blank reserved slots or flashing media chrome.

## Validation
- First-screen note images and favicons use explicit loading hints that are stronger than the offscreen default.
- The same loading-intent contract maps prioritized versus lazy image mode across note cards, favicons, and rendered markdown output, with article surfaces assigning their one-slot budget only when the first rendered image qualifies for the opening viewport band.
- Offscreen card media and later markdown images remain lazy instead of being upgraded wholesale.
- The public showroom, owner dashboard, owner links route, and public note/article preview all keep stable layout and current destination behavior.
- `npm run verify` passes.
