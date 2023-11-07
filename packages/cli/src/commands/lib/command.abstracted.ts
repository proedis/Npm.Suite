import type { AnyObject } from '@proedis/types';

import type { Command } from 'commander';

import type { AbstractAction } from '../../actions/lib';


export abstract class AbstractCommand<Schema extends AnyObject> {

  constructor(protected action: AbstractAction<Schema>) {
  }


  public abstract load(program: Command): void;

}
