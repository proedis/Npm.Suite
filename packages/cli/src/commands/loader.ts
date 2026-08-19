import type { Command } from 'commander';

import { ScaffoldCommand } from './command.scaffold';

import { ScaffoldAction } from '../actions';


export class CommandLoader {

  public static async load(program: Command) {
    new ScaffoldCommand(new ScaffoldAction()).load(program);
  }

}
