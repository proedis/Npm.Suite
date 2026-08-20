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
  'enums',
  'hooks',
  'models'
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
      /**
       * Providing every answer upfront is what makes the command usable from a script or from
       * CI: each option below skips the prompt that would have asked for it.
       */
      .option('--host <host>', 'The host serving the definition, skipping its prompt')
      .option('--endpoint <endpoint>', 'The endpoint serving the definition, skipping its prompt')
      .option('-y, --yes', 'Answer every optional prompt affirmatively')
      .option('--spec <file>', 'Generate from a definition on disk, instead of downloading one')
      .option('--save-spec <file>', 'Save the downloaded definition, so a later run can be fed from it')
      .option('--check', 'Report what a run would change and write nothing, failing when it would')
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
