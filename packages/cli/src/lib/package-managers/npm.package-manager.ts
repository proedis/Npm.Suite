import type { PackageJson } from 'type-fest';

import { Runner, RunnerFactory } from '../runners';
import { AbstractPackageManager } from './abstract.package-manager';
import { PackageManager } from './package-manager';

import type { NpmRunner } from '../runners/npm.runner';
import type { PackageManagerCommands } from './package-manager.commands';


export class NpmPackageManager extends AbstractPackageManager {
  constructor(
    packageJson: PackageJson
  ) {
    super(RunnerFactory.create(Runner.NPM) as NpmRunner, packageJson);
  }


  public get name() {
    return PackageManager.NPM.toUpperCase();
  }


  get cli(): PackageManagerCommands {
    return {
      install    : 'install',
      add        : 'install',
      update     : 'update',
      remove     : 'uninstall',
      saveFlag   : '--save',
      saveDevFlag: '--save-dev',
      silentFlag : '--silent'
    };
  }
}
