import * as path from 'node:path';
import * as fs from 'node:fs';
import { cp } from 'node:fs/promises';

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
    name   : 'produce-package-files',
    version: '3.1.0',

    /**
     * Declare the module format of each output directory.
     *
     * Node resolves the format of a '.js' file from the nearest package.json 'type' field,
     * never from the 'exports' condition that led to it. Without these markers the ESM
     * output is parsed as CommonJS and fails on its first 'export' statement as soon as
     * anything imports the package through the 'exports' map.
     *
     * This runs on 'writeBundle' rather than 'buildEnd' because output directories only
     * exist once rollup has written them, and the format is read from the output options
     * instead of being inferred from the directory name.
     */
    writeBundle(outputOptions) {
      if (!outputOptions.dir) {
        return;
      }

      const type = outputOptions.format === 'es' || outputOptions.format === 'esm'
        ? 'module'
        : 'commonjs';

      fs.writeFileSync(
        path.resolve(outputOptions.dir, 'package.json'),
        `${JSON.stringify({ type }, null, 2)}\n`,
        'utf-8'
      );

      this.info(`Declared "type": "${type}" in ${outputOptions.dir}`);
    },

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
            return;
          }

          /** Copy the file from source to destination */
          await cp(sourceFilePath, destFilePath);

          this.info(`Copied ${sourceFilePath} to ${destFilePath}`);
        };


        // ----
        // Plugin Execution
        // ----

        /**
         * Ensure the build directory exists.
         *
         * Rollup only creates its output directories during the write phase, which happens
         * after 'buildEnd'. Until now this worked by accident: the declaration build ran
         * first and created 'build/types' along the way. A package without a
         * tsconfig.declaration.json had nothing to create it, and writing the manifest
         * failed with ENOENT.
         */
        fs.mkdirSync(buildPath, { recursive: true });

        /** Create the package json file */
        createPackageJson(packagePath, buildDirectory);
        this.info(`Created package.json in ${buildPath}`);

        /** Copy original files into build directory */
        await Promise.all([
          path.resolve(packagePath, '..', '..', 'LICENSE'),
          './README.md'
        ].map(includeFile));

        /**
         * Strip the incremental build metadata emitted by the declaration build.
         * It is worthless here (the build directory is wiped on every run) and would
         * otherwise be shipped inside the published tarball.
         */
        for (const entry of fs.readdirSync(buildPath)) {
          if (entry.endsWith('.tsbuildinfo')) {
            fs.rmSync(path.resolve(buildPath, entry), { force: true });
            this.info(`Removed ${entry} from ${buildPath}`);
          }
        }
      }
    }
  };

}
