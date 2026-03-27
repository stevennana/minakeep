# Markdown Editor Workbench

## Goal
Upgrade note authoring from a plain textarea into a compact markdown workbench while preserving markdown as the only saved source format.

## Core Rule
- markdown text remains the only persisted note body format
- editor upgrades must not introduce a second canonical document model

## Preferred Implementation Direction
- use a source-first editor surface with syntax-aware behavior
- keep the shipped textarea-backed highlighted source surface unless a later change solves a concrete fidelity or reliability problem
- any future editor-core swap must preserve the same markdown-string persistence contract and direct markdown transforms
- keep the existing markdown renderer and preview contract as the display source for preview and public note output

## Desktop Interaction Rules
- support `Source`, `Split`, and `Preview` modes
- `Split` should be the most useful mode for longer note drafting
- preview and source panes should feel like one workbench, not two unrelated cards
- scroll sync is desirable in split mode when it can be kept stable

## Toolbar Rules
- toolbar stays compact, not word-processor heavy
- prioritize headings, bold, italic, lists, quote, code, and link actions
- the first toolbar wave should stay to one compact row of source transforms: `H2`, bold, italic, inline code, bullet list, numbered list, quote, code block, link, inline math, and block math
- keyboard shortcuts remain first-class for experienced users
- common shortcut coverage should focus on low-surprise markdown conventions such as bold, italic, link insertion, heading insertion, tab indentation, and enter-based list continuation
- toolbar actions should insert or transform markdown directly and predictably
- math helpers should insert raw `$...$` or `$$...$$` delimiters instead of introducing a separate equation editor state

## Mobile Rules
- avoid permanent split view on phone widths
- support a simple `Edit` / `Preview` toggle
- keep primary authoring actions reachable without overwhelming the screen
- preserve comfortable text entry, selection, and scrolling

## Fidelity Rules
- mode switches must not rewrite markdown unexpectedly
- preview output should match the renderer used in public note reading
- inline and block LaTeX math should be rendered by the same shared note-rendering path used for published notes
- richer editing affordances should improve authoring speed without hiding the underlying markdown too aggressively

## Anti-Goals
- no Notion-style block editor rewrite
- no collaborative editor model
- no route-specific editor theme that ignores the shared design system
