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
  logLevel: process.env.LOG_LEVEL ?? "info"
};
