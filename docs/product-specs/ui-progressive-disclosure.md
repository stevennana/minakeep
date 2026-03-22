# UI progressive disclosure

## Goal
Reduce redundant instructional copy across Minakeep so the interface feels intuitive without forcing users to read internal workflow explanations.

## Trigger / Entry
Any user opens a core public or owner surface.

## User-Visible Behavior
- Obvious controls such as search fields, save actions, and section headings are not surrounded by repetitive explanatory labels.
- Large intro/help blocks are removed when they do not materially help the user complete the task.
- Guidance that is truly necessary remains available through lighter disclosure such as tooltips, compact inline hints, or optional detail reveals.
- Internal implementation details such as storage, seeding, or route architecture are not presented as user-facing copy.

## Validation
- Public and owner screens feel lighter and more intuitive.
- Critical workflow guidance remains discoverable without becoming dominant chrome.
- The interface no longer requires reading multiple descriptive panels before using obvious controls.
- `npm run verify` passes.
