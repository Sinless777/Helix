// libs/shared/logger/src/level.ts

/**
 * Available log levels for Helix AI logger
 */
export type LogLevel = 
  | 'trace'
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'fatal'
  | 'audit';

/**
 * Defines the numeric severity for each level (lower = less severe)
 */
export const LevelSeverity: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
  audit: 70,
};

/**
 * ANSI colour codes for each log level (for console output)
 */
export const LevelColor: Record<LogLevel, string> = {
  trace: '\x1b[34m', // blue
  debug: '\x1b[36m', // cyan
  info:  '\x1b[32m', // green
  warn:  '\x1b[33m', // yellow
  error: '\x1b[31m', // red
  fatal: '\x1b[35m', // magenta
  audit: '\x1b[37m', // white / grey
};

/**
 * ANSI reset code to clear colour/formatting
 */
export const RESET_COLOR = '\x1b[0m';

/**
 * Helper to wrap a message in colour for a given level
 */
export function colourize(level: LogLevel, message: string): string {
  const colour = LevelColor[level];
  return `${colour}${message}${RESET_COLOR}`;
}
