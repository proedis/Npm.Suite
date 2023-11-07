import { AbstractAction } from './lib';
import type { ActionInputs } from './lib';

import { Project } from '../lib/project';


/* --------
 * Internal Types
 * -------- */
export interface InitActionInput {
  /** The module to initialize */
  module: 'eslint' | 'tsconfig';

  /** Skip packages install using package manager */
  skipInstall?: boolean;
}


/* --------
 * Action Definition
 * -------- */
export class InitAction extends AbstractAction<InitActionInput> {


  // ----
  // Public Handlers
  // ----
  public async handle(inputs: ActionInputs<InitActionInput>): Promise<void> {
    /** Initialize the Project */
    const project = new Project();

    /** Use switch case to use the right initializer */
    switch (inputs.getOption('module')) {
      case 'eslint':

      case 'tsconfig':
        return this.initializeTsConfig(inputs, project);

      default:
        throw new Error(`Invalid Initializer found ${inputs.getOption('module')}`);
    }

    // const p = new Project();
    //
    // await p.manager.addChain('eslint-config-proedis');
    //
    // return Promise.resolve(undefined);
  }


  // ----
  // TSConfig Initialization
  // ----
  private async initializeTsConfig(inputs: ActionInputs<InitActionInput>, project: Project): Promise<void> {
    return Promise.resolve();
  }


  // ----
  // ESLint Initialization
  // ----
  private async initializeEsLint(inputs: ActionInputs<InitActionInput>, project: Project): Promise<void> {
    return Promise.resolve();
  }

}
