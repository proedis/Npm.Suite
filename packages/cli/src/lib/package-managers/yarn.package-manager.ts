import type { PackageJson } from 'type-fest';

import { Runner, RunnerFactory } from '../runners';
import { AbstractPackageManager } from './abstract.package-manager';
import { PackageManager } from './package-manager';

import type { YarnRunner } from '../runners/yarn.runner';
import type { PackageManagerCommands } from './package-manager.commands';


export class YarnPackageManager extends AbstractPackageManager {
  constructor(
    packageJson: PackageJson
  ) {
    super(RunnerFactory.create(Runner.YARN) as YarnRunner, packageJson);
  }


  public get name() {
    return PackageManager.YARN.toUpperCase();
  }


  get cli(): PackageManagerCommands {
    return {
      install    : 'install',
      add        : 'add',
      update     : 'upgrade',
      remove     : 'remove',
      saveFlag   : '',
      saveDevFlag: '-D',
      silentFlag : '--silent'
    };
  }
}
