const LEVELS = ["trace", "debug", "info", "warn", "error"] as const;

type LogLevel = (typeof LEVELS)[number];

function resolveLevel(level: string): LogLevel {
  if (LEVELS.includes(level as LogLevel)) {
    return level as LogLevel;
  }
  return "info";
}

function shouldLog(current: LogLevel, target: LogLevel) {
  return LEVELS.indexOf(target) >= LEVELS.indexOf(current);
}

function write(level: LogLevel, message: string, metadata?: Record<string, unknown>) {
  const currentLevel = resolveLevel(process.env.LOG_LEVEL ?? "info");

  if (!shouldLog(currentLevel, level)) {
    return;
  }

  const payload = {
    level,
    message,
    metadata,
    timestamp: new Date().toISOString()
  };

  console.log(JSON.stringify(payload));
}

export const serverLogger = {
  trace(message: string, metadata?: Record<string, unknown>) {
    write("trace", message, metadata);
  },
  debug(message: string, metadata?: Record<string, unknown>) {
    write("debug", message, metadata);
  },
  info(message: string, metadata?: Record<string, unknown>) {
    write("info", message, metadata);
  },
  warn(message: string, metadata?: Record<string, unknown>) {
    write("warn", message, metadata);
  },
  error(message: string, metadata?: Record<string, unknown>) {
    write("error", message, metadata);
  }
};
