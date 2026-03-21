import path from "node:path";
import { tmpdir } from "node:os";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  authSecret: requireEnv("AUTH_SECRET"),
  databaseUrl: requireEnv("DATABASE_URL"),
  ownerUsername: requireEnv("OWNER_USERNAME"),
  ownerPassword: requireEnv("OWNER_PASSWORD"),
  mediaRoot: path.resolve(process.env.MEDIA_ROOT ?? path.join(tmpdir(), "minakeep-media")),
  logLevel: process.env.LOG_LEVEL ?? "info"
};
