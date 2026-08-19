#! /usr/bin/env node
import console from 'node:console';
import process, { argv, env, exit } from 'node:process';

import chalk from 'chalk';
import * as commander from 'commander';
import PrettyError from 'pretty-error';

import { CommandLoader } from './commands';
import { ReportedError } from './ui';


const pe = new PrettyError().start();


/* --------
 * Define the main CLI Entry Function
 * -------- */
const bootstrap = async () => {
  /** Create the Commander program to parse arguments */
  const { program } = commander;

  /**
   * Update the program version using current package.json.
   *
   * 'require' rather than an import: this package is published CommonJS only, its own manifest sits
   * outside the compiled sources, and resolving it statically would inline the whole file into the
   * bundle at build time instead of reading the installed one at run time.
   */
  program.version(
    // eslint-disable-next-line global-require, @typescript-eslint/no-require-imports
    require('../package.json').version,
    '-v, --version',
    'Output the current version.'
  );

  /**
   * Assert program usage and helps are valid.
   *
   * The name has to be stated: commander derives it from argv[1], so every usage line read
   * 'Usage: index <command>' — the name of the compiled entry file rather than of the binary.
   */
  program.name('proedis');
  program.usage('<command> [options]');
  program.helpOption('-h, --help', 'Output usage information.');

  /** Load CLI Commands */
  await CommandLoader.load(program);

  /** Parse current arguments */
  await program.parseAsync(argv);

  /** If no options have been passed through arguments, show the help message */
  if (!argv.slice(2).length) {
    program.outputHelp();
    exit();
  }
};


/* --------
 * Call the EntryPoint
 * -------- */
bootstrap()
  .catch((exception) => {
    /**
     * A failure must be visible to whatever invoked this binary.
     *
     * The exit code used to stay 0 on every error — the handler printed and returned — so a
     * scaffold that never downloaded anything looked like a success to a script or to CI.
     */
    process.exitCode = 1;

    const error = exception instanceof Error ? exception : new Error('Unhandled Error Occurred');

    /**
     * The stack is noise for a failure that has already been worded for the user: by the time
     * this runs, the spinner has printed the reason. It stays one environment variable away
     * for when the reason is not enough.
     */
    if (env.PROEDIS_DEBUG) {
      console.info(pe.render(error));
      return;
    }

    /** A failure a spinner already worded needs no second telling */
    if (!(error instanceof ReportedError)) {
      console.info(chalk.red(error.message));
    }
  });
