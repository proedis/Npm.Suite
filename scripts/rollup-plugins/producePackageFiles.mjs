import * as path from 'path';
import * as fs from 'fs';

import fse from 'fs-extra';


/* --------
 * Plugin Definition
 * -------- */

/**
 *
 * @param srcDirectory Origin source files directory
 * @param buildDirectory Build destination directory
 *
 * @return {import('rollup').Plugin & Partial<import('rollup').FunctionPluginHooks>}
 */
export default function producePackageFiles(srcDirectory, buildDirectory) {

  // ----
  // Path Definition
  // ----
  const packagePath = process.cwd();
  const buildPath = path.resolve(packagePath, buildDirectory);
  const srcPath = path.resolve(packagePath, srcDirectory);


  // ----
  // Plugin Returns
  // ----
  return {
    name    : 'Produce Package',
    version : '2.0.0',
    buildEnd: {
      order: 'post',
      async handler(error) {

        if (error) {
          return;
        }

        // ----
        // Helpers
        // ----

        /**
         * Copy a file from the source directory into build directory.
         * Helper will check if the file exists before copying it.
         *
         * @param file The relative path from package.json file
         *
         * @return {Promise<void>} Resolve once the file has been copied
         */
        const includeFile = async (file) => {
          /** Build paths */
          const sourceFilePath = path.resolve(packagePath, file);
          const destFilePath = path.resolve(buildPath, path.basename(file));

          /** Check file exists or not before copy */
          if (!fs.existsSync(sourceFilePath)) {
            this.warn(`Skipping file ${sourceFilePath}, it doesn't exist`);
            return;
          }

          /** Copy the file from source to destination */
          await fse.copy(sourceFilePath, destFilePath);

          global.console.log(`Copied ${sourceFilePath} to ${destFilePath}`);
        };


        /**
         * Starting from the original package.json file
         * create, a new package and place it into build directory
         * @return {Promise<{ [key: string]: any }>}
         */
        const createPackageJsonFile = async () => {
          /** Get and Parse the package.json file */
          const {
            scripts,
            devDependencies,
            workspaces,
            ...pkgData
          } = await fse.readJson(path.resolve(packagePath, 'package.json'));

          /** Build the new package.json file */
          const newPackageData = {
            ...pkgData,
            private: false,
            main   : './cjs/index.js',
            module : './esm/index.js',
            types  : './types/index.d.ts'
          };

          /** Write the new json file */
          const targetPath = path.resolve(buildPath, 'package.json');
          await fse.writeJson(targetPath, newPackageData, { spaces: 2 });

          global.console.log(`Created package.json in ${targetPath}`);

          /** Return created package.json data */
          return newPackageData;
        };


        // ----
        // Plugin Execution
        // ----

        /** Create and return the PackageJson file */
        const packageJson = await createPackageJsonFile();

        /** Copy original files into build directory */
        await Promise.all([
          // path.resolve(packagePath, '..', '..', 'CHANGELOG.md'),
          path.resolve(packagePath, '..', '..', 'LICENSE'),
          './README.md'
        ].map(includeFile));
      }
    }
  };

}
