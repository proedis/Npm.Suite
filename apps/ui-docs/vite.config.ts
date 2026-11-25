import fs from 'node:fs';
import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import { examples } from './plugins/examples.ts';
import { uiProps } from './plugins/props.ts';
import { snippets } from './plugins/snippets.ts';
import { uiTheme } from './plugins/theme.ts';


/* --------
 * Constants Definition
 * -------- */

/** The source of the package, read directly: the site documents what is on the branch, not a release */
const UI_SOURCE = path.resolve(import.meta.dirname, '../../packages/ui/src');

/** @proedis/form, documented with the package it binds: its pages read its source the same way */
const FORM_SOURCE = path.resolve(import.meta.dirname, '../../packages/form/src');


/**
 * The modules of the optional peers the package imports, found in its source. Vite only meets them
 * while a page is being served, since the package is source and not a dependency it scans: each one
 * found late makes it bundle the dependencies again and reload, and for a moment the page holds two
 * copies of React. Listing them up front, from the source, keeps the list from going stale.
 */
const PEER_MODULES = [ ...new Set(
  fs.readdirSync(UI_SOURCE, { recursive: true, encoding: 'utf8' })
    .filter((file) => /\.tsx?$/.test(file))
    .flatMap((file) => [ ...fs.readFileSync(path.join(UI_SOURCE, file), 'utf8').matchAll(/from '(@base-ui\/react\/[\w-]+|@tanstack\/react-table|dayjs)'/g) ])
    .map((match) => match[1])
) ].sort();


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
    uiProps(FORM_SOURCE, 'virtual:form-props/'),
    uiTheme(UI_SOURCE),
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
      { find: /^@proedis\/ui\/(.+)$/, replacement: `${UI_SOURCE}/$1` },
      { find: /^@proedis\/form$/, replacement: path.join(FORM_SOURCE, 'index.ts') }
    ],

    /** The package's source and the site must share one React, or every hook of the package throws */
    dedupe: [ 'react', 'react-dom' ]
  },

  optimizeDeps: {
    include: PEER_MODULES
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
