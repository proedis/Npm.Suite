import type * as React from 'react';


/* --------
 * Types Definition
 * -------- */

/** What `import x from '…/name.tsx?example'` gives: the component and its own source */
export interface ExampleModule {
  readonly Component: React.ComponentType;

  /** The source of the file, as written */
  readonly code: string;

  /** The same source, highlighted at build time */
  readonly html: string;

  /** The name of the file, shown over the code */
  readonly file: string;
}


/** What `import x from '…/name.ts?source'` gives: the source of a module, to read */
export type SourceModule = Omit<ExampleModule, 'Component'>;
