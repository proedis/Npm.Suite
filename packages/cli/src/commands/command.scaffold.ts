import console from 'node:console';

import chalk from 'chalk';

import { Argument } from 'commander';
import type { Command } from 'commander';

import { AbstractCommand } from './lib';

import { ActionInputs } from '../actions';
import type { ScaffoldActionInput } from '../actions';


/* --------
 * Constants
 * -------- */
const ELEMENTS: ScaffoldActionInput['element'][] = [
  'enums'
];


/* --------
 * Command Definition
 * -------- */
export class ScaffoldCommand extends AbstractCommand<ScaffoldActionInput> {

  public load(program: Command): void {
    program
      .command('scaffold')
      .addArgument(
        new Argument('<element>', 'The element to scaffold').argRequired().choices(ELEMENTS)
      )
      .description('Scaffold elements using API source')
      .action(async (element: ScaffoldActionInput['element'], options: any) => {
        /** Assert desired element is valid */
        if (!ELEMENTS.includes(element)) {
          console.info(
            chalk.red(
              `'${chalk.bold(element)}' is invalid for argument 'element'. Allowed choices are ${ELEMENTS.join(', ')}`
            )
          );
          return;
        }

        /** Create the inputs for the Action */
        const inputs = new ActionInputs<ScaffoldActionInput>(options);
        inputs.setOption('element', element);

        /** Execute the inner action */
        await this.action.handle(inputs);
      });
  }

}
