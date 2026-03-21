# Markdown Editor Pattern Notes

Updated: 2026-03-21

## Recommendation
Minakeep should adopt a **source-first markdown workbench** rather than a full WYSIWYG editor.

Best-fit pattern blend:
- GitHub-style lightweight formatting toolbar and shortcut-friendly editing
- Obsidian-style `Source` / `Live Preview` mindset with mode switching
- StackEdit or HackMD-style split editing and preview behavior on desktop

## Why this fits Minakeep
- the product already stores notes as markdown text
- the public note renderer already depends on a markdown rendering path
- the owner experience is notes-first and technical, so source editing is a better fit than a block editor
- the current implementation is a textarea plus preview, so a source-first upgrade is lower risk than replacing the whole note model

## Reference Takeaways

### GitHub
- formatting toolbar and keyboard shortcuts help beginners without getting in the way of raw markdown editing
- monospace-friendly markdown editing remains important for code blocks, tables, and structured writing

Source:
- https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/about-writing-and-formatting-on-github

### Obsidian
- separate reading and editing views cleanly
- support explicit editing modes rather than forcing one presentation style
- allow side-by-side reading and editing when useful

Source:
- https://help.obsidian.md/edit-and-read

### StackEdit
- split editor and preview with scroll sync is still one of the strongest desktop markdown-writing patterns
- compact WYSIWYG-style controls can coexist with raw markdown editing

Source:
- https://stackedit.io/

### CodiMD / HackMD
- `Edit` / `View` / `Both` modes are practical and easy to explain
- mobile should simplify to a single-pane toggle rather than attempting full desktop parity

Sources:
- https://www.hackmd.com.tw/p/features
- https://hackmd.io/en

### MDXEditor
- strong reference for React-integrated toolbar composition, diff/source toggles, markdown shortcuts, and extensible plugins
- powerful, but richer than Minakeep likely needs for the next wave

Sources:
- https://mdxeditor.dev/
- https://mdxeditor.dev/editor/docs/customizing-toolbar
- https://mdxeditor.dev/editor/docs/diff-source

### Tiptap Markdown
- capable, but its markdown flow is still positioned as newer or beta-oriented in the official docs
- better seen as a comparison point than the recommended first choice here

Source:
- https://tiptap.dev/docs/editor/markdown/examples
