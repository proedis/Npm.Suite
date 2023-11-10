import console from 'node:console';

import chalk from 'chalk';

import { Argument } from 'commander';
import type { Command } from 'commander';

import { AbstractCommand } from './lib';

import { ActionInputs } from '../actions';
import type { InitActionInput } from '../actions';


/* --------
 * Constants
 * -------- */
const MODULES: InitActionInput['module'][] = [
  'eslint',
  'tsconfig',
  'mantine',
  'client'
];


/* --------
 * Command Definition
 * -------- */
export class InitCommand extends AbstractCommand<InitActionInput> {

  public load(program: Command): void {
    program
      .command('init')
      .addArgument(
        new Argument('<module>', 'The module to initialize').argRequired()
      )
      .option('-s, --skip-install', 'Skip packages installation')
      .option('-y, --yes', 'Auto confirm initial prompt')
      .description('Initialize a specific package bundle from Proedis environment')
      .action(async (module: InitActionInput['module'], options: any) => {
        /** Assert desired module is valid */
        if (!MODULES.includes(module)) {
          console.info(
            chalk.red(
              `value '${chalk.bold(module)}' is invalid for argument 'module'. Allowed choices are ${MODULES.join(', ')}`
            )
          );
          return;
        }

        /** Create the inputs for the Action */
        const inputs = new ActionInputs<InitActionInput>(options);
        inputs.setOption('module', module);

        /** Execute the inner action */
        await this.action.handle(inputs);
      });
  }

}
