import assert from "node:assert/strict";
import test from "node:test";

import { POST } from "../../src/app/api/open/notes/route";
import { EXTERNAL_NOTE_API_KEY_HEADER, getExternalNoteApiAuthResult } from "../../src/lib/external-note-api/auth";

function withApiKeyEnv(value: string | undefined, callback: () => void | Promise<void>) {
  const original = process.env.API_KEY;

  if (value === undefined) {
    delete process.env.API_KEY;
  } else {
    process.env.API_KEY = value;
  }

  return Promise.resolve(callback()).finally(() => {
    if (original === undefined) {
      delete process.env.API_KEY;
    } else {
      process.env.API_KEY = original;
    }
  });
}

test("getExternalNoteApiAuthResult reports disabled when API_KEY is unset", async () => {
  await withApiKeyEnv(undefined, () => {
    assert.deepEqual(getExternalNoteApiAuthResult(new Headers()), {
      state: "disabled"
    });
  });
});

test("getExternalNoteApiAuthResult accepts a matching X-API-Key header", async () => {
  await withApiKeyEnv("test-api-key", () => {
    assert.deepEqual(
      getExternalNoteApiAuthResult(
        new Headers({
          [EXTERNAL_NOTE_API_KEY_HEADER]: "test-api-key"
        })
      ),
      {
        state: "authorized"
      }
    );
  });
});

test("getExternalNoteApiAuthResult rejects missing or invalid X-API-Key headers", async () => {
  await withApiKeyEnv("test-api-key", () => {
    assert.deepEqual(getExternalNoteApiAuthResult(new Headers()), {
      state: "unauthorized"
    });
    assert.deepEqual(
      getExternalNoteApiAuthResult(
        new Headers({
          [EXTERNAL_NOTE_API_KEY_HEADER]: "wrong-api-key"
        })
      ),
      {
        state: "unauthorized"
      }
    );
  });
});

test("POST /api/open/notes fails closed when API_KEY is unset", async () => {
  await withApiKeyEnv(undefined, async () => {
    const response = POST(new Request("http://localhost/api/open/notes", { method: "POST" }));

    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      error: "External note API is disabled."
    });
  });
});

test("POST /api/open/notes rejects requests without a valid X-API-Key", async () => {
  await withApiKeyEnv("test-api-key", async () => {
    const missingHeaderResponse = POST(new Request("http://localhost/api/open/notes", { method: "POST" }));
    const invalidHeaderResponse = POST(
      new Request("http://localhost/api/open/notes", {
        method: "POST",
        headers: {
          [EXTERNAL_NOTE_API_KEY_HEADER]: "wrong-api-key"
        }
      })
    );

    assert.equal(missingHeaderResponse.status, 401);
    assert.deepEqual(await missingHeaderResponse.json(), {
      error: "Unauthorized."
    });

    assert.equal(invalidHeaderResponse.status, 401);
    assert.deepEqual(await invalidHeaderResponse.json(), {
      error: "Unauthorized."
    });
  });
});

test("POST /api/open/notes keeps the valid-key path separate from persistence work", async () => {
  await withApiKeyEnv("test-api-key", async () => {
    const response = POST(
      new Request("http://localhost/api/open/notes", {
        method: "POST",
        headers: {
          [EXTERNAL_NOTE_API_KEY_HEADER]: "test-api-key"
        }
      })
    );

    assert.equal(response.status, 501);
    assert.deepEqual(await response.json(), {
      error: "Not implemented."
    });
  });
});
