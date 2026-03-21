# Markdown Editor Workbench

## Goal
Upgrade note authoring from a plain textarea into a compact markdown workbench while preserving markdown as the only saved source format.

## Core Rule
- markdown text remains the only persisted note body format
- editor upgrades must not introduce a second canonical document model

## Preferred Implementation Direction
- use a source-first editor surface with syntax-aware behavior
- prefer a CodeMirror-based editing core over a full rich-text document model
- keep the existing markdown renderer and preview contract as the display source for preview and public note output

## Desktop Interaction Rules
- support `Source`, `Split`, and `Preview` modes
- `Split` should be the most useful mode for longer note drafting
- preview and source panes should feel like one workbench, not two unrelated cards
- scroll sync is desirable in split mode when it can be kept stable

## Toolbar Rules
- toolbar stays compact, not word-processor heavy
- prioritize headings, bold, italic, lists, quote, code, and link actions
- keyboard shortcuts remain first-class for experienced users
- toolbar actions should insert or transform markdown directly and predictably

## Mobile Rules
- avoid permanent split view on phone widths
- support a simple `Edit` / `Preview` toggle
- keep primary authoring actions reachable without overwhelming the screen
- preserve comfortable text entry, selection, and scrolling

## Fidelity Rules
- mode switches must not rewrite markdown unexpectedly
- preview output should match the renderer used in public note reading
- richer editing affordances should improve authoring speed without hiding the underlying markdown too aggressively

## Anti-Goals
- no Notion-style block editor rewrite
- no collaborative editor model
- no route-specific editor theme that ignores the shared design system
