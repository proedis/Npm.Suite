import logdown from 'logdown';
import type { Logger as LogdownLogger } from 'logdown';

import { AugmentedMap } from '@proedis/utils';

import type { LoggerOptions, LogLevel } from './Logger.types';

import Options from '../Options/Options';


export default class Logger implements LogdownLogger {

  // ----
  // Helpers
  // ----
  public static translateLogLevel(level: LogLevel) {
    return ({
      debug: 0,
      log  : 1,
      info : 2,
      warn : 3,
      error: 4
    } as Record<LogLevel, number>)[level];
  }


  // ----
  // Logger Configuration
  // ----

  /** The default logger configuration */
  private static _defaultConfiguration: LoggerOptions = {
    enabled    : true,
    minLogLevel: 'warn'
  };


  /**
   * Replace the default logger configuration
   *
   * @param configuration The default Logger Configuration object
   */
  public static configure(configuration: Partial<LoggerOptions>) {
    /** Save the default configuration */
    Logger._defaultConfiguration = {
      ...this._defaultConfiguration,
      ...configuration
    };
  }


  // ----
  // Logger instantiation, as singleton per module
  // ----

  /** Private storage of logger instance */
  private static _instances = new AugmentedMap<string, Logger>();


  /**
   * Get a logger for a specific Client Module.
   * If no logger exists in private logger instance storage,
   * a new instance will be created with provided default
   * configuration set up with initializeLogger method
   *
   * @param module The module name
   * @param configuration Replace the default configuration
   */
  public static forContext(module: string, configuration?: LoggerOptions): Logger {
    /** Check if a logger already exists for requested module, if it doesn't exist, create a new one */
    return Logger._instances.getOrAdd(module, () => (
      new Logger(module, configuration ?? Logger._defaultConfiguration)
    ));
  }


  // ----
  // Private Instance Field
  // ----

  /** The current logger configuration */
  private readonly _options: Options<LoggerOptions>;

  /** Internal logdown logger */
  private readonly _logdown: LogdownLogger;


  // ----
  // Private Constructor
  // ----
  private constructor(module: string, configuration?: LoggerOptions) {
    this._options = new Options(configuration);
    this._logdown = logdown(`Client :: ${module}`);
    this._logdown.state.isEnabled = true;
  }


  // ----
  // Private Methods
  // ----
  private _couldLog(level: LogLevel): boolean {
    /** Check if logger is enabled */
    if (!this._options.get('enabled', 'boolean')) {
      return false;
    }

    /** Get the min log level from configuration */
    const minLogLevel = this._options.getOrDefault('minLogLevel', 'string', 'error');

    /** Check if log level could be show */
    return Logger.translateLogLevel(minLogLevel) <= Logger.translateLogLevel(level);
  }


  // ----
  // Public Methods
  // ----

  debug(...args: any[]): void {
    /** Assert debug level is enabled */
    if (!this._couldLog('debug')) {
      return;
    }

    /** Use logdown to show the message */
    this._logdown.debug(...args);
  }


  error(...args: any[]): void {
    /** Assert debug level is enabled */
    if (!this._couldLog('error')) {
      return;
    }

    /** Use logdown to show the message */
    this._logdown.error(...args);
  }


  info(...args: any[]): void {
    /** Assert debug level is enabled */
    if (!this._couldLog('info')) {
      return;
    }

    /** Use logdown to show the message */
    this._logdown.info(...args);
  }


  log(...args: any[]): void {
    /** Assert debug level is enabled */
    if (!this._couldLog('log')) {
      return;
    }

    /** Use logdown to show the message */
    this._logdown.log(...args);
  }


  warn(...args: any[]): void {
    /** Assert debug level is enabled */
    if (!this._couldLog('warn')) {
      return;
    }

    /** Use logdown to show the message */
    this._logdown.warn(...args);
  }


  public get state() {
    return this._logdown.state;
  }

}
