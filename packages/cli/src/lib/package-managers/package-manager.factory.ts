import { readdirSync } from 'node:fs';
import { sep as pathSeparator } from 'node:path';
import { cwd } from 'node:process';

import * as inquirer from 'inquirer';

import type { PackageJson } from 'type-fest';

import type { AbstractPackageManager } from './abstract.package-manager';

import { NpmPackageManager } from './npm.package-manager';
import { PackageManager } from './package-manager';
import { YarnPackageManager } from './yarn.package-manager';
import { PnpmPackageManager } from './pnpm.package-manager';


export class PackageManagerFactory {
  public static create(name: PackageManager | string, packageJson: PackageJson): AbstractPackageManager {
    switch (name) {
      case PackageManager.NPM:
        return new NpmPackageManager(packageJson);
      case PackageManager.YARN:
        return new YarnPackageManager(packageJson);
      case PackageManager.PNPM:
        return new PnpmPackageManager(packageJson);
      default:
        throw new Error(`Package manager ${name} is not managed.`);
    }
  }


  public static async find(packageJson: PackageJson): Promise<AbstractPackageManager> {
    /** Get current working directory path parts */
    const cwdPathParts = cwd().split(pathSeparator);

    while (cwdPathParts.length > 1) {
      const files = readdirSync(cwdPathParts.join(pathSeparator));

      const hasNpmLockFile = files.includes('package-json.lock');
      if (hasNpmLockFile) {
        return this.create(PackageManager.NPM, packageJson);
      }

      const hasYarnLockFile = files.includes('yarn.lock');
      if (hasYarnLockFile) {
        return this.create(PackageManager.YARN, packageJson);
      }

      const hasPnpmLockFile = files.includes('pnpm-lock.yaml');
      if (hasPnpmLockFile) {
        return this.create(PackageManager.PNPM, packageJson);
      }

      cwdPathParts.pop();
    }

    /** If no package manager found, ask for default */
    const prompt = inquirer.createPromptModule();
    const answers = await prompt<{ pm: PackageManager }>([
      {
        type   : 'list',
        name   : 'pm',
        message: 'Package Manager could not be inferred. Select your preference',
        choices: [
          PackageManager.NPM,
          PackageManager.YARN,
          PackageManager.PNPM
        ]
      }
    ]);

    return this.create(answers.pm, packageJson);
  }
}
