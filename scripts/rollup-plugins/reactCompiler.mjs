import { relative } from 'node:path';

import { babel } from '@rollup/plugin-babel';


/**
 * Run the React Compiler over a package's components while it is built, so what ships is already
 * memoised and no consumer has to configure anything.
 *
 * It runs **after** `@rollup/plugin-typescript`, which therefore has to leave JSX in place
 * (`jsx: 'preserve'`): the compiler recognises a component by its JSX, and on the `jsx()` calls the
 * TypeScript transform would have produced it skips every component that calls no hook. The JSX is
 * then transformed here with the automatic runtime, the same output `jsx: 'react-jsx'` gives.
 *
 * `target: '19'` makes the compiled code import its cache from `react/compiler-runtime`, which React
 * ships since 19.0: nothing else to install, and the import is external because `react` is a peer.
 * ⚠️ A package that opts in must therefore declare a React range starting at 19. Under 18 that
 * import does not resolve, and the failure is at the consumer's runtime, not in this build. A
 * package that has to keep 18 needs `target: '18'` and `react-compiler-runtime` in its
 * `dependencies` instead.
 *
 * ⚠️ The compiler **skips in silence** any function it cannot prove safe (a ref read while
 * rendering, a mutation of a prop) and leaves it as written, unmemoised. That is the one way this
 * can quietly stop doing its job, so every skip is reported at the end of the build, with the reason
 * the compiler gave, rather than discovered later in a profiler.
 *
 * @return {import('rollup').Plugin[]}
 */
export default function reactCompiler() {
  /** What the compiler did with each function, collected across the whole build */
  const compiled = [];
  const skipped = [];

  const logger = {
    logEvent(filename, event) {
      const file = filename ? relative(process.cwd(), filename) : '<unknown>';

      if (event.kind === 'CompileSuccess') {
        compiled.push(`${file} ${event.fnName ?? '<anonymous>'}`);
      }
      else if (event.kind === 'CompileError' || event.kind === 'PipelineError') {
        const detail = event.detail?.reason ?? event.detail?.options?.reason ?? event.data ?? String(event.detail ?? '');
        const line = event.fnLoc?.start?.line ?? event.detail?.loc?.start?.line;

        skipped.push(`${file}${line ? `:${line}` : ''} ${detail}`);
      }
    }
  };

  return [
    babel({
      babelrc     : false,
      configFile  : false,
      babelHelpers: 'bundled',
      extensions  : [ '.ts', '.tsx' ],
      include     : [ 'src/**' ],
      parserOpts  : { plugins: [ 'jsx' ] },
      plugins     : [
        /* The compiler has to see the code first, before any other transform */
        [ 'babel-plugin-react-compiler', { target: '19', logger } ],
        [ '@babel/plugin-transform-react-jsx', { runtime: 'automatic' } ]
      ]
    }),

    {
      name: 'react-compiler-report',

      buildEnd(error) {
        if (error) {
          return;
        }

        this.info(`react compiler: ${compiled.length} functions compiled, ${skipped.length} skipped`);

        for (const entry of skipped) {
          this.warn(`react compiler skipped ${entry}`);
        }
      }
    }
  ];
}
