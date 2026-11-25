import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { Plugin } from 'vite';
import { highlight } from './highlight.ts';


/* --------
 * Constants Definition
 * -------- */

const QUERY = '?example';

/** The source alone, of any module: a fixture, a setup file, the module of an entity */
const SOURCE_QUERY = '?source';


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
 *
 * `?source` gives the highlighted source alone, of a module with no component to render: the setup a
 * page shows is the file its examples import, not a copy of it.
 */
export function examples(): Plugin {
  return {
    name   : 'platform:examples',
    enforce: 'pre',

    async load(id) {
      const isExample = id.endsWith(QUERY);

      if (!isExample && !id.endsWith(SOURCE_QUERY)) {
        return null;
      }

      const file = id.slice(0, -(isExample ? QUERY : SOURCE_QUERY).length);
      /* The two blank lines of the house style between blocks read as a gap on a page: one is enough */
      const code = (await readFile(file, 'utf8')).trimEnd().replace(/\n{3,}/g, '\n\n');
      const html = await highlight(code, file.endsWith('.tsx') ? 'tsx' : 'ts');

      this.addWatchFile(file);

      if (!isExample) {
        return `export default { code: ${JSON.stringify(code)}, html: ${JSON.stringify(html)}, file: ${JSON.stringify(path.basename(file))} };`;
      }

      /* The path below `src/examples`, without extension: what the preview route of a resizable frame loads */
      const exampleId = file.split('/src/examples/')[1]?.replace(/\.tsx?$/, '') ?? '';

      return [
        `import Component from ${JSON.stringify(file)};`,
        `export default { Component, id: ${JSON.stringify(exampleId)}, code: ${JSON.stringify(code)}, html: ${JSON.stringify(html)}, file: ${JSON.stringify(path.basename(file))} };`
      ].join('\n');
    }
  };
}
