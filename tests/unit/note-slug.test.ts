import test from "node:test";
import assert from "node:assert/strict";

import { createNoteSlug, createUniqueNoteSlug } from "../../src/features/notes/slug";

test("createNoteSlug normalizes title content", () => {
  assert.equal(createNoteSlug("  Minakeep Draft Notes  "), "minakeep-draft-notes");
});

test("createNoteSlug falls back when the title has no slug-safe characters", () => {
  assert.equal(createNoteSlug("!!!"), "untitled-note");
});

test("createUniqueNoteSlug increments an existing base slug", () => {
  assert.equal(createUniqueNoteSlug("Draft note", ["draft-note", "draft-note-2"]), "draft-note-3");
});
