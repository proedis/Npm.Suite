import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { Plugin } from 'vite';
import { highlight } from './highlight.ts';


/* --------
 * Constants Definition
 * -------- */

const QUERY = '?example';


/* --------
 * Plugin
 * -------- */

/**
 * `import fills from '@/examples/actions/button/fills.tsx?example'` gives the example twice: the
 * component, to render live, and its source highlighted at build time, to read. One file is both, so
 * the code under a preview is the code that drew it and cannot drift from it.
 *
 * The module imports the file without the query, so the component goes through the normal pipeline
 * (TypeScript, JSX, Fast Refresh). Editing the file invalidates both modules, since Vite keys them on
 * the same file.
 */
export function examples(): Plugin {
  return {
    name   : 'ui-docs:examples',
    enforce: 'pre',

    async load(id) {
      if (!id.endsWith(QUERY)) {
        return null;
      }

      const file = id.slice(0, -QUERY.length);
      /* The two blank lines of the house style between blocks read as a gap on a page: one is enough */
      const code = (await readFile(file, 'utf8')).trimEnd().replace(/\n{3,}/g, '\n\n');
      const html = await highlight(code, 'tsx');

      this.addWatchFile(file);

      return [
        `import Component from ${JSON.stringify(file)};`,
        `export default { Component, code: ${JSON.stringify(code)}, html: ${JSON.stringify(html)}, file: ${JSON.stringify(path.basename(file))} };`
      ].join('\n');
    }
  };
}
