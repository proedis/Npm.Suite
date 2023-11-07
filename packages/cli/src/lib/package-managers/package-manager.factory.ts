import { readdirSync } from 'node:fs';
import { sep as pathSeparator } from 'node:path';
import { cwd } from 'node:process';

import type { AbstractPackageManager } from './abstract.package-manager';

import { NpmPackageManager } from './npm.package-manager';
import { PackageManager } from './package-manager';
import { YarnPackageManager } from './yarn.package-manager';
import { PnpmPackageManager } from './pnpm.package-manager';


export class PackageManagerFactory {
  public static create(name: PackageManager | string): AbstractPackageManager {
    switch (name) {
      case PackageManager.NPM:
        return new NpmPackageManager();
      case PackageManager.YARN:
        return new YarnPackageManager();
      case PackageManager.PNPM:
        return new PnpmPackageManager();
      default:
        throw new Error(`Package manager ${name} is not managed.`);
    }
  }


  public static find(): AbstractPackageManager {
    const DEFAULT_PACKAGE_MANAGER = PackageManager.NPM;

    /** Get current working directory path parts */
    const cwdPathParts = cwd().split(pathSeparator);

    while (!!cwdPathParts.length) {
      const files = readdirSync(cwdPathParts.join(pathSeparator));

      const hasYarnLockFile = files.includes('yarn.lock');
      if (hasYarnLockFile) {
        return this.create(PackageManager.YARN);
      }

      const hasPnpmLockFile = files.includes('pnpm-lock.yaml');
      if (hasPnpmLockFile) {
        return this.create(PackageManager.PNPM);
      }

      cwdPathParts.pop();
    }

    return this.create(DEFAULT_PACKAGE_MANAGER);
  }
}
