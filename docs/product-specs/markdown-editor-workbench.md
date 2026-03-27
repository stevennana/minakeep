# Markdown editor workbench

## Goal
Make note writing feel faster and more deliberate through a source-first markdown workbench instead of a plain textarea.

## Trigger / Entry
The owner opens `/app/notes/new` or `/app/notes/[id]/edit`.

## User-Visible Behavior
- The note editor keeps markdown text as the source of truth.
- The editing surface keeps raw markdown visible while adding a syntax-aware highlighted source layer so it no longer feels like a plain textarea.
- A compact formatting toolbar helps with headings, emphasis, lists, quotes, code, links, and note math.
- The compact toolbar exposes direct helpers for `H2`, bold, italic, inline code, bullet list, numbered list, quote, code block, link insertion, inline math, and block math.
- Desktop supports `Source`, `Split`, and `Preview` modes, with `Split` as the default workbench view on load.
- Mobile uses a simpler `Edit` / `Preview` toggle instead of a cramped side-by-side layout.
- Keyboard shortcuts and insert helpers speed up common markdown actions without forcing toolbar-only usage.
- `Tab` still indents, `Shift+Tab` outdents, `Enter` continues lists or blockquotes, and `Ctrl/Cmd+B`, `Ctrl/Cmd+I`, `Ctrl/Cmd+K`, and `Ctrl/Cmd+Alt+2` trigger common inline or heading transforms.
- Returning from preview restores the source pane and keeps the draft text intact.
- The rendered preview continues to reflect the same markdown rendering rules used elsewhere in Minakeep.
- Pipe-style markdown tables should render as readable tables in preview and on published note pages instead of showing raw `|` syntax.
- Inline LaTeX math written as `$...$` and block LaTeX math written as `$$...$$` render in preview while the saved note body stays raw markdown.

## Validation
- Note content still persists as markdown text, not a second document schema.
- Owners can switch between the supported editor modes without losing text.
- Toolbar actions and shortcuts insert, remove, or continue valid markdown predictably.
- Math insertion helpers produce valid raw markdown delimiters without introducing a separate equation editor state.
- Desktop split mode remains readable and useful during normal note writing.
- Mobile authoring stays usable without horizontal compression.
- `npm run verify` passes.
