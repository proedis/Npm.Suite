import type { PackageJson } from 'type-fest';

import { Runner, RunnerFactory } from '../runners';
import { AbstractPackageManager } from './abstract.package-manager';
import { PackageManager } from './package-manager';

import type { PnpmRunner } from '../runners/pnpm.runner';
import type { PackageManagerCommands } from './package-manager.commands';


export class PnpmPackageManager extends AbstractPackageManager {
  constructor(
    packageJson: PackageJson
  ) {
    super(RunnerFactory.create(Runner.PNPM) as PnpmRunner, packageJson);
  }


  public get name() {
    return PackageManager.PNPM.toUpperCase();
  }


  // As of PNPM v5.3, all commands are shared with NPM v6.14.5. See: https://pnpm.js.org/en/pnpm-vs-npm
  get cli(): PackageManagerCommands {
    return {
      install    : 'install --strict-peer-dependencies=false',
      add        : 'install --strict-peer-dependencies=false',
      update     : 'update',
      remove     : 'uninstall',
      saveFlag   : '--save',
      saveDevFlag: '--save-dev',
      silentFlag : '--reporter=silent'
    };
  }
}
