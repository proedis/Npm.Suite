#! /usr/bin/env node
import console from 'node:console';
import { argv, exit } from 'node:process';

import * as commander from 'commander';
import PrettyError from 'pretty-error';

import { CommandLoader } from './commands';


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

  /** Assert program usage and helps are valid */
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
    if (exception && exception instanceof Error) {
      console.info(exception);
    }
    else {
      console.info(pe.render(new Error('Unhandled Error Occurred')));
    }
  });
