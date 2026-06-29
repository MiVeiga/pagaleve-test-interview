import type { LogContext, Logger } from "./logger";

type LogLevel = "info" | "warn" | "error";

function formatLog(
  level: LogLevel,
  message: string,
  context?: LogContext,
): string {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context } : {}),
  };

  return JSON.stringify(payload);
}

export class ConsoleLogger implements Logger {
  info(message: string, context?: LogContext): void {
    console.info(formatLog("info", message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(formatLog("warn", message, context));
  }

  error(message: string, context?: LogContext): void {
    console.error(formatLog("error", message, context));
  }
}
