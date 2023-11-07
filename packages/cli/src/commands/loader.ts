import type { Command } from 'commander';

import { InitCommand } from './command.init';

import { InitAction } from '../actions';


export class CommandLoader {

  public static async load(program: Command) {
    new InitCommand(new InitAction()).load(program);
  }

}
