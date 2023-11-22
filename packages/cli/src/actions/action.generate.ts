import { resolve } from 'node:path';
import { cwd } from 'node:process';

import { AbstractAction } from './lib';
import type { ActionInputs } from './lib';


/* --------
 * Internal Types
 * -------- */
export interface GenerateActionInput {
  /** The component to generate is void (without children) */
  children?: boolean;

  /** The element to generate */
  element: 'atom' | 'molecule' | 'organism' | 'template' | 'component';

  /** Change the default folder into save files */
  folder?: string;

  /** The name of the element to generate */
  name: string;

  /** Use inline options to generate a single file without types dedicated file */
  inline?: boolean;
}


/* --------
 * Internal Constants
 * -------- */
const FOLDER: Record<GenerateActionInput['element'], string> = {
  atom     : 'atoms',
  molecule : 'molecules',
  organism : 'organism',
  template : 'templates',
  component: 'components'
};


/* --------
 * Action Definition
 * -------- */
export class GenerateAction extends AbstractAction<GenerateActionInput> {

  constructor() {
    super('generate');
  }


  // ----
  // Public Handlers
  // ----
  public async handle(inputs: ActionInputs<GenerateActionInput>): Promise<void> {
    const options = inputs.getAll();

    const {
      element,
      folder,
      inline,
      name
    } = options;

    const compiler = this.compiler.forPath(inline ? 'inline' : 'split');
    const output = resolve(cwd(), folder || FOLDER[element], name);

    await compiler.saveAll(output, { model: options });
  }

}
