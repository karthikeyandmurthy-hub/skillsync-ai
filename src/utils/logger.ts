/**
 * Purpose: Centralized structured logger.
 * Responsibilities: Namespaced [TAG] logs with consistent format.
 * Dependencies: none.
 */

type Level = "debug" | "info" | "warn" | "error";

const isDev = import.meta.env.DEV;

/**
 * Format a log line with a uppercase tag and ISO timestamp.
 * @param tag namespace e.g. "[ATS_ENGINE]"
 */
function emit(level: Level, tag: string, args: unknown[]) {
  if (level === "debug" && !isDev) return;
  const ts = new Date().toISOString();
  const fn = console[level] ?? console.log;
  fn(`${ts} ${tag}`, ...args);
}

export const logger = {
  debug: (tag: string, ...args: unknown[]) => emit("debug", tag, args),
  info: (tag: string, ...args: unknown[]) => emit("info", tag, args),
  warn: (tag: string, ...args: unknown[]) => emit("warn", tag, args),
  error: (tag: string, ...args: unknown[]) => emit("error", tag, args),
};
