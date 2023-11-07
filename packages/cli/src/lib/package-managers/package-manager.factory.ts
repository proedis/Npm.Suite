import { readdirSync } from 'node:fs';

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

    try {
      const files = readdirSync(process.cwd());

      const hasYarnLockFile = files.includes('yarn.lock');
      if (hasYarnLockFile) {
        return this.create(PackageManager.YARN);
      }

      const hasPnpmLockFile = files.includes('pnpm-lock.yaml');
      if (hasPnpmLockFile) {
        return this.create(PackageManager.PNPM);
      }

      return this.create(DEFAULT_PACKAGE_MANAGER);
    }
    catch (error) {
      return this.create(DEFAULT_PACKAGE_MANAGER);
    }
  }
}
