import "server-only";

export const EXTERNAL_NOTE_API_KEY_HEADER = "X-API-Key";

export type ExternalNoteApiAuthResult =
  | {
      state: "authorized";
    }
  | {
      state: "disabled";
    }
  | {
      state: "unauthorized";
    };

function readConfiguredApiKey() {
  const value = process.env.API_KEY?.trim();

  return value ? value : null;
}

export function getExternalNoteApiAuthResult(headers: Headers): ExternalNoteApiAuthResult {
  const configuredApiKey = readConfiguredApiKey();

  if (!configuredApiKey) {
    return {
      state: "disabled"
    };
  }

  const requestApiKey = headers.get(EXTERNAL_NOTE_API_KEY_HEADER)?.trim();

  if (!requestApiKey || requestApiKey !== configuredApiKey) {
    return {
      state: "unauthorized"
    };
  }

  return {
    state: "authorized"
  };
}
