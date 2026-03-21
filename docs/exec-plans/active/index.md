# Ralph Loop Task Queue

This queue is the task-level promotion source of truth for minakeep.

Only task files in this directory that contain a `taskmeta` JSON block are eligible for automatic selection, evaluation, and promotion.

## Current recommended sequence
1. `045-markdown-editor-foundation.md` -> replace the plain textarea feel with a source-first markdown workbench foundation
2. `046-note-editor-toolbar-and-shortcuts.md` -> add compact formatting controls and markdown authoring aids without breaking raw editing
3. `047-note-editor-view-modes.md` -> add desktop source/split/preview modes and stable mode switching
4. `048-note-editor-mobile-workflow.md` -> adapt the editor into a usable mobile edit/preview workflow
5. `049-note-editor-hardening.md` -> reconcile docs, regression coverage, and markdown-fidelity protection for the richer editor wave

Tasks `041` through `044` are preserved in completed history as the completed public-home density tranche.

## Operating rule

A task may be promoted only when its task contract rules are satisfied.

For standard tasks, that means all of the following are true:

- deterministic checks pass
- the evaluator marks the task as `done`
- the evaluator recommends promotion
- the task metadata declares a `next_task_on_success`, or explicitly declares that the queue ends here

For tasks with `"promotion_mode": "deterministic_only"`, evaluator narrative is not required. Those tasks promote only when their required deterministic checks pass and the evaluation state marks them promotion-eligible.

## When this queue ends

When the active sequence is exhausted, do not continue with ad hoc prompts alone.
Update the relevant product specs and design docs first, then seed the next active queue for the next feature wave.
