import type { Class } from 'type-fest';

import { EnumScaffolder, ModelsScaffolder } from '../lib';
import type { AbstractedScaffolder } from '../lib';

import { AbstractAction } from './lib';
import type { ActionInputs } from './lib';

import { spinnerFeedbackFunction } from '../ui';


/* --------
 * Internal Types
 * -------- */
export interface ScaffoldActionInput {
  /** The element to scaffold */
  element: 'enums' | 'models';
}


/* --------
 * Action Definition
 * -------- */
export class ScaffoldAction extends AbstractAction<ScaffoldActionInput> {

  constructor() {
    super('scaffold');
  }


  // ----
  // Public Handlers
  // ----
  public handle(inputs: ActionInputs<ScaffoldActionInput>): Promise<void> {
    /** Use switch case to use the right scaffold */
    switch (inputs.getOption('element')) {
      case 'enums':
        return this.scaffoldElement(EnumScaffolder);

      case 'models':
        return this.scaffoldElement(ModelsScaffolder);

      default:
        throw new Error(`Invalid Scaffold found ${inputs.getOption('element')}`);
    }
  }


  // ----
  // Internal Handlers
  // ----
  private async scaffoldElement<S extends AbstractedScaffolder>(
    Scaffolder: Class<S>
  ): Promise<void> {
    const scaffolder = new Scaffolder(this.project, this.compiler);

    /** Start the scaffold process */
    const generatedFiles = await scaffolder.scaffold();

    /** Lint files before exit */
    await spinnerFeedbackFunction<void>(
      'Fixing generated files...',
      async (resolveLint, reject) => (
        this.compiler.lintAndFixFiles(generatedFiles).then(() => resolveLint()).catch(reject)
      )
    );
  }

}
