import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';


/** Resolve the tsc entrypoint from the installed typescript package instead of relying on PATH */
const TSC_BIN = createRequire(import.meta.url).resolve('typescript/bin/tsc');


/**
 * Use the tsc cli tool to build typescript .d.ts files.
 *
 * A non-zero exit code will abort the rollup build: without this check a failing
 * declaration build would silently produce a package with stale or missing types.
 *
 * @param opt {{ tsconfig?: string | undefined }}
 * @return {import('rollup').Plugin & Partial<import('rollup').FunctionPluginHooks>}
 */
export default function createTypes(opt = {}) {
  const tsconfig = opt.tsconfig ?? 'tsconfig.json';

  return {
    name    : 'create-types',
    version : '2.0.0',
    buildEnd: {
      order: 'post',
      handler(error) {
        /** Nothing to declare when the bundle itself already failed */
        if (error) {
          return;
        }

        this.info('creating .d.ts files...');

        try {
          execFileSync(process.execPath, [ TSC_BIN, '-p', tsconfig ], { stdio: 'inherit' });
        }
        catch (execError) {
          /** A signal kill reports a null status: report it as such instead of "unknown" */
          const cause = execError.signal
            ? `was killed by ${execError.signal}`
            : `exited with code ${execError.status}`;

          this.error(`declaration build failed: tsc -p ${tsconfig} ${cause}`);
        }
      }
    }
  };
}
