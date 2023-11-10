import semver from 'semver';

import type { Dependency } from './abstract.package-manager';


export class DependenciesCollection extends Array<Dependency> {


  public push(...dependencies: Dependency[]): number {
    /** Iterate over all dependencies */
    dependencies.forEach((dependency) => {
      /** Check if a dependency for same package already exists */
      const sameDependency = this.find((d) => d.name === dependency.name);

      /** If it doesn't exist, add directly and exit */
      if (!sameDependency) {
        super.push(dependency);
        return;
      }

      /** If the same dependencies has no version (aka 'latest'), abort pushing */
      if (!sameDependency.version) {
        return;
      }

      /** If the dependencies that is pushing has no version (aka 'latest'),
       * or the version is higher than the current one, replace the version
       */
      if (!dependency.version || semver.gt(dependency.version, sameDependency.version)) {
        sameDependency.version = dependency.version;
      }
    });

    return this.length;
  }

}
