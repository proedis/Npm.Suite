import console from 'node:console';

import chalk from 'chalk';

import { Argument } from 'commander';
import type { Command } from 'commander';

import { AbstractCommand } from './lib';

import { ActionInputs } from '../actions';
import type { GenerateActionInput } from '../actions';


/* --------
 * Constants
 * -------- */
const ELEMENTS: GenerateActionInput['element'][] = [
  'atom',
  'molecule',
  'organism',
  'template',
  'component'
];


/* --------
 * Command Definition
 * -------- */
export class GenerateCommand extends AbstractCommand<GenerateActionInput> {

  public load(program: Command) {
    program
      .command('generate').alias('g')
      .addArgument(
        new Argument('<element>', 'The element to be generated').argRequired().choices(ELEMENTS)
      )
      .addArgument(
        new Argument('<name>', 'The name of the element to be generated').argRequired()
      )
      .description('Generate a new React Component placed into right scaffolded folder')
      .option('--no-children', 'Generate component without children')
      .option('-i, --inline', 'Generate single file with inline type')
      .option('-f, --folder <folder>', 'Change the folder into place component')
      .action(async (element: GenerateActionInput['element'], name: string, options: any) => {
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
        const inputs = new ActionInputs<GenerateActionInput>(options);
        inputs.setOption('element', element);
        inputs.setOption('name', name);
        inputs.setOption('children', !!options.children);

        /** Execute the inner action */
        await this.action.handle(inputs);
      });
  }

}
