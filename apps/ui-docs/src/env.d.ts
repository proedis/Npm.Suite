/// <reference types="vite/client" />

/*
 * `import()` types on purpose: a top level `import type` would turn this file into a module, and a
 * wildcard module declaration only exists in an ambient file.
 */
/* eslint-disable @typescript-eslint/consistent-type-imports */

/** An example, live and as source: see `plugins/examples.ts` */
declare module '*?example' {
  const example: import('./docs/exampleModule').ExampleModule;
  export default example;
}

/** The source of a module, highlighted: see `plugins/examples.ts` */
declare module '*?source' {
  const source: import('./docs/exampleModule').SourceModule;
  export default source;
}

/** The props of a type of @proedis/ui, read by the compiler: see `plugins/props.ts` */
declare module 'virtual:ui-props/*' {
  const props: readonly import('./docs/propDoc').PropDoc[];
  export default props;
}
