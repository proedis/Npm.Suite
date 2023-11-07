import { Runner } from './runner';

import { NpmRunner } from './npm.runner';
import { PnpmRunner } from './pnpm.runner';
import { YarnRunner } from './yarn.runner';


export class RunnerFactory {

  public static create(runner: Runner) {
    switch (runner) {
      case Runner.NPM:
        return new NpmRunner();

      case Runner.YARN:
        return new YarnRunner();


      case Runner.PNPM:
        return new PnpmRunner();

      default:
        throw new Error('Unsupported runner: ${runner}');
    }
  }

}
