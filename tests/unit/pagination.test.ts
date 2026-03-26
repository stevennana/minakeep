import test from "node:test";
import assert from "node:assert/strict";

import {
  getNextIncrementalLimit,
  MAX_INCREMENTAL_COLLECTION_SIZE,
  OWNER_COLLECTION_PAGE_SIZE,
  PUBLIC_COLLECTION_PAGE_SIZE,
  normalizeIncrementalLimit
} from "@/lib/pagination";

test("normalizeIncrementalLimit falls back to the route default for missing or invalid input", () => {
  assert.equal(normalizeIncrementalLimit(undefined, PUBLIC_COLLECTION_PAGE_SIZE), PUBLIC_COLLECTION_PAGE_SIZE);
  assert.equal(normalizeIncrementalLimit("not-a-number", OWNER_COLLECTION_PAGE_SIZE), OWNER_COLLECTION_PAGE_SIZE);
});

test("normalizeIncrementalLimit clamps to the route default minimum and global maximum", () => {
  assert.equal(normalizeIncrementalLimit("3", PUBLIC_COLLECTION_PAGE_SIZE), PUBLIC_COLLECTION_PAGE_SIZE);
  assert.equal(
    normalizeIncrementalLimit(String(MAX_INCREMENTAL_COLLECTION_SIZE + 50), OWNER_COLLECTION_PAGE_SIZE),
    MAX_INCREMENTAL_COLLECTION_SIZE
  );
});

test("getNextIncrementalLimit advances by page size without overshooting the total", () => {
  assert.equal(getNextIncrementalLimit(PUBLIC_COLLECTION_PAGE_SIZE, 23, PUBLIC_COLLECTION_PAGE_SIZE), 20);
  assert.equal(getNextIncrementalLimit(20, 23, OWNER_COLLECTION_PAGE_SIZE), 23);
});
