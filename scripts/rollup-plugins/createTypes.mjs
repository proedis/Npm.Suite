import shell from 'shelljs';


/**
 * Use the tsc cli tool to build typescript .d.ts files
 *
 * @param opt {{ tsconfig?: string | undefined }}
 * @return {import('rollup').Plugin & Partial<import('rollup').FunctionPluginHooks>}
 */
export default function createTypes(opt = {}) {
  return {
    name    : 'create-types',
    version : '1.0.0',
    buildEnd: {
      order: 'post',
      handler() {
        this.info('creating .d.ts files...');
        shell.exec(`tsc -p ${opt.tsconfig ?? 'tsconfig.json'}`);
      }
    }
  };
}
