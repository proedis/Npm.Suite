import { AugmentedMap, isBrowser } from '@proedis/utils';

import Options from '../Options/Options';

import type { LoggerOptions, LogLevel } from './Logger.types';


/* --------
 * Constants
 * -------- */

/** How the levels order against each other, lowest first */
const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  debug: 0,
  log  : 1,
  info : 2,
  warn : 3,
  error: 4,
  none : 5
};

/** The console method each level writes through */
const LOG_LEVEL_CONSOLE_METHOD: Record<Exclude<LogLevel, 'none'>, 'debug' | 'log' | 'info' | 'warn' | 'error'> = {
  debug: 'debug',
  log  : 'log',
  info : 'info',
  warn : 'warn',
  error: 'error'
};

/**
 * The colours a module prefix can take, as RGB triplets.
 *
 * A module keeps the same colour for the whole session, because the colour is derived from its name
 * rather than handed out in order: reading a log means telling modules apart at a glance, and a colour
 * that moves between runs is worse than no colour at all.
 */
const PREFIX_PALETTE: [ number, number, number ][] = [
  [ 97, 175, 239 ],
  [ 152, 195, 121 ],
  [ 229, 192, 123 ],
  [ 224, 108, 117 ],
  [ 198, 120, 221 ],
  [ 86, 182, 194 ],
  [ 209, 154, 102 ],
  [ 171, 178, 191 ]
];

/** The ANSI escape opening a 24 bit foreground colour, and the one resetting every attribute */
const ANSI_BOLD = '\x1b[1m';
const ANSI_RESET = '\x1b[0m';


/* --------
 * Internal Helpers
 * -------- */

/**
 * Whether the current console understands ANSI escape codes.
 *
 * Only ever true outside a browser, and only on an interactive terminal that has not asked for colour
 * to be switched off. Every access is guarded by 'typeof', because this module is bundled for the
 * browser too and 'process' does not exist there.
 */
function supportsAnsiColours(): boolean {
  if (isBrowser || typeof process === 'undefined') {
    return false;
  }

  if (process.env?.NO_COLOR) {
    return false;
  }

  return process.stdout?.isTTY === true;
}


/** Pick a stable colour for a module name */
function resolvePrefixColour(module: string): [ number, number, number ] {
  /** A plain sum of char codes spreads names across the palette well enough, and it never moves */
  const seed = module
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);

  return PREFIX_PALETTE[seed % PREFIX_PALETTE.length];
}


/* --------
 * Logger Definition
 * -------- */

/**
 * The Client's logger: a prefixed, level filtered wrapper over the platform console.
 *
 * One instance per module, cached, so a module always writes under the same prefix and the same colour.
 * Nothing is buffered or transported anywhere — this exists to make a development session readable, not
 * to ship logs.
 *
 * It used to be built on `logdown`, which contributed a prefix and a colour while pulling `chalk` — a
 * terminal library — into every browser bundle through a pre-minified UMD file. What it actually did is
 * the fifty lines below.
 */
export default class Logger {

  // ----
  // Helpers
  // ----

  /** Translate a level into the number the threshold comparison uses */
  public static translateLogLevel(level: LogLevel): number {
    return LOG_LEVEL_SEVERITY[level];
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
   * Replace the default logger configuration.
   *
   * It applies to every logger that did not receive an explicit configuration of its own, **including
   * the ones already created**. That was not the case before: each instance snapshotted the defaults in
   * its constructor, so configuring the logger from a second client's settings — or after any module had
   * already asked for its own logger — silently did nothing.
   *
   * @param configuration The default Logger Configuration object
   */
  public static configure(configuration: Partial<LoggerOptions>) {
    /** Save the default configuration */
    Logger._defaultConfiguration = {
      ...this._defaultConfiguration,
      ...configuration
    };

    /** Drop the resolved defaults, so the next read rebuilds them from what was just set */
    Logger._defaultOptions = undefined;
  }


  /**
   * The default configuration, resolved once.
   *
   * Every logger without a pinned configuration reads through here, which is what makes a later
   * 'configure' take effect on loggers that already exist. Caching it matters because the alternative was
   * allocating an Options wrapper **per log call** — including the calls that are below the threshold and
   * print nothing, which is most of them in production.
   */
  private static _defaultOptions: Options<LoggerOptions> | undefined;


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
   * @param configuration Pin this logger to its own configuration, ignoring later `configure` calls
   */
  public static forContext(module: string, configuration?: LoggerOptions): Logger {
    /** Check if a logger already exists for requested module, if it doesn't exist, create a new one */
    return Logger._instances.getOrAdd(module, () => new Logger(module, configuration));
  }


  /**
   * Drop every cached logger.
   *
   * The cache is static and lives as long as the process does, keyed by module name. That is bounded
   * while the module names are, but a storage namespaced per tenant or per session makes it grow without
   * limit — and a test suite building a client per case accumulates one entry per case.
   */
  public static reset(): void {
    Logger._instances.clear();
  }


  // ----
  // Private Instance Field
  // ----

  /** The configuration this logger was pinned to, if any */
  private readonly _ownOptions: Options<LoggerOptions> | undefined;

  /** The rendered prefix, and the colour it is written with */
  private readonly _prefix: string;

  private readonly _colour: [ number, number, number ];


  // ----
  // Private Constructor
  // ----
  private constructor(module: string, configuration?: LoggerOptions) {
    this._ownOptions = configuration ? new Options(configuration) : undefined;
    this._prefix = `Client :: ${module}`;
    this._colour = resolvePrefixColour(module);
  }


  // ----
  // Private Methods
  // ----

  /**
   * The configuration in force for this logger.
   *
   * A logger created without one reads the current defaults on every call, which is what makes a later
   * `Logger.configure` take effect on it.
   */
  private get _options(): Options<LoggerOptions> {
    if (this._ownOptions) {
      return this._ownOptions;
    }

    Logger._defaultOptions ??= new Options(Logger._defaultConfiguration);

    return Logger._defaultOptions;
  }


  private _couldLog(level: LogLevel): boolean {
    const options = this._options;

    /** Check if logger is enabled */
    if (!options.getOrDefault('enabled', 'boolean', true)) {
      return false;
    }

    /** Get the min log level from configuration */
    const minLogLevel = options.getOrDefault('minLogLevel', 'string', 'error');

    /** Check if log level could be show */
    return Logger.translateLogLevel(minLogLevel) <= Logger.translateLogLevel(level);
  }


  /**
   * Write one entry, prefixed and coloured for whichever console is listening.
   *
   * A browser console takes a '%c' directive followed by a CSS string, a terminal takes an ANSI escape:
   * two different mechanisms, so the arguments are assembled differently rather than formatted into the
   * message — which is what keeps objects inspectable instead of flattened into a string.
   */
  private _write(level: Exclude<LogLevel, 'none'>, args: any[]): void {
    if (!this._couldLog(level)) {
      return;
    }

    const method = LOG_LEVEL_CONSOLE_METHOD[level];
    const [ red, green, blue ] = this._colour;

    /* eslint-disable no-console -- this class *is* the console wrapper: it is the one place allowed to */
    if (isBrowser) {
      console[method](
        `%c${this._prefix}`,
        `color: rgb(${red}, ${green}, ${blue}); font-weight: bold`,
        ...args
      );

      return;
    }

    if (supportsAnsiColours()) {
      console[method](`${ANSI_BOLD}\x1b[38;2;${red};${green};${blue}m${this._prefix}${ANSI_RESET}`, ...args);

      return;
    }

    console[method](this._prefix, ...args);
    /* eslint-enable no-console */
  }


  // ----
  // Public Methods
  // ----

  public debug(...args: any[]): void {
    this._write('debug', args);
  }


  public error(...args: any[]): void {
    this._write('error', args);
  }


  public info(...args: any[]): void {
    this._write('info', args);
  }


  public log(...args: any[]): void {
    this._write('log', args);
  }


  public warn(...args: any[]): void {
    this._write('warn', args);
  }

}
