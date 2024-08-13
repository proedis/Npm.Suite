import * as path from 'path';
import * as fs from 'fs';

import fse from 'fs-extra';

// eslint-disable-next-line import/extensions
import createPackageJson from '../utils/createPackageJson.js';


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


  // ----
  // Plugin Returns
  // ----
  return {
    name    : 'produce-package-files',
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

          this.info(`Copied ${sourceFilePath} to ${destFilePath}`);
        };


        // ----
        // Plugin Execution
        // ----

        /** Create the package json file */
        createPackageJson(packagePath, buildDirectory);
        this.info(`Created package.json in ${buildPath}`);

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
