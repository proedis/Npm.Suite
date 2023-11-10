import { resolve } from 'node:path';

import type { AnyObject } from '@proedis/types';

import type { ActionInputs } from './action.inputs';

import { Project, TemplateCompiler } from '../../lib';


export abstract class AbstractAction<Schema extends AnyObject> {

  protected compiler: TemplateCompiler;

  protected project: Project = new Project();


  protected constructor(private readonly name: string) {
    this.compiler = new TemplateCompiler(resolve(__dirname, '..', 'templates', name));
  }


  public abstract handle(inputs: ActionInputs<Schema>): Promise<void>;

}
