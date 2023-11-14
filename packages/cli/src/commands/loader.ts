import type { Command } from 'commander';

import { InitCommand } from './command.init';
import { ScaffoldCommand } from './command.scaffold';

import { InitAction, ScaffoldAction } from '../actions';


export class CommandLoader {

  public static async load(program: Command) {
    new InitCommand(new InitAction()).load(program);
    new ScaffoldCommand(new ScaffoldAction()).load(program);
  }

}
