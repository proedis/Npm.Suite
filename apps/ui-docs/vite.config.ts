import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { examples } from './plugins/examples.ts';
import { uiProps } from './plugins/props.ts';
import { snippets } from './plugins/snippets.ts';


/* --------
 * Constants Definition
 * -------- */

/** The source of the package, read directly: the site documents what is on the branch, not a release */
const UI_SOURCE = path.resolve(import.meta.dirname, '../../packages/ui/src');


/* --------
 * Configuration
 * -------- */

export default defineConfig({
  plugins: [
    tanstackRouter({
      target            : 'react',
      autoCodeSplitting : true,
      routesDirectory   : 'src/routes',
      generatedRouteTree: 'src/routeTree.gen.ts'
    }),
    examples(),
    snippets(),
    uiProps(UI_SOURCE),
    react(),
    tailwindcss()
  ],

  resolve: {
    alias: [
      { find: /^@\//, replacement: `${path.resolve(import.meta.dirname, 'src')}/` },

      /*
       * The package's source manifest points `main` at its source and declares no subpath, so each
       * subpath is mapped onto its folder: the imports of an example read exactly as an application
       * writes them.
       */
      { find: /^@proedis\/ui$/, replacement: path.join(UI_SOURCE, 'index.ts') },
      { find: /^@proedis\/ui\/(.+)$/, replacement: `${UI_SOURCE}/$1` }
    ],

    /** The package's source and the site must share one React, or every hook of the package throws */
    dedupe: [ 'react', 'react-dom' ]
  },

  build: {
    /** `build`, like every package of the repository: the folder is ignored once, at the root */
    outDir: 'build'
  },

  server: {
    port      : 3200,
    strictPort: true
  },

  preview: {
    port      : 3200,
    strictPort: true
  }
});
