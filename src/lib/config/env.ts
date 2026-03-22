import path from "node:path";
import { tmpdir } from "node:os";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function readOptionalCredentials(usernameKey: string, passwordKey: string) {
  const username = readOptionalEnv(usernameKey);
  const password = readOptionalEnv(passwordKey);

  if (!username && !password) {
    return null;
  }

  if (!username || !password) {
    throw new Error(`${usernameKey} and ${passwordKey} must either both be set or both be omitted.`);
  }

  return {
    password,
    username
  };
}

const ownerUsername = requireEnv("OWNER_USERNAME");
const ownerPassword = requireEnv("OWNER_PASSWORD");
const demoCredentials = readOptionalCredentials("DEMO_USERNAME", "DEMO_PASSWORD");

if (demoCredentials && demoCredentials.username === ownerUsername) {
  throw new Error("DEMO_USERNAME must differ from OWNER_USERNAME.");
}

export const env = {
  authSecret: requireEnv("AUTH_SECRET"),
  databaseUrl: requireEnv("DATABASE_URL"),
  demoCredentials,
  ownerPassword,
  ownerUsername,
  mediaRoot: path.resolve(process.env.MEDIA_ROOT ?? path.join(tmpdir(), "minakeep-media")),
  logLevel: process.env.LOG_LEVEL ?? "info"
};
