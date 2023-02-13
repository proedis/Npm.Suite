import type { EnvironmentDependentOptions } from '../Options/Options.types';


// ----
// Logger Configuration
// ----
export type LoggerOptions = EnvironmentDependentOptions<BaseLoggerOptions>;

interface BaseLoggerOptions {
  /** Set if logging is enabled or not */
  enabled?: boolean;

  /** The minimum LogLevel to show */
  minLogLevel?: LogLevel;
}

// ----
// Utility Types
// ----
export type LogLevel = 'debug' | 'log' | 'info' | 'warn' | 'error';
