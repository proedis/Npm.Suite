import fs from 'node:fs';
import path from 'node:path';

import type { DocsIndex, ItemDoc } from './types';


/* --------
 * Constants Definition
 * -------- */

/**
 * The data ships inside the package, next to the code: `build/data`, written by the build from the
 * documentation site. `__dirname` is `build/cjs` once published, so the data is one folder up.
 */
const DATA_DIR = process.env.PROEDIS_MCP_DATA_DIR ?? path.resolve(__dirname, '..', 'data');

/** The version of the data this code reads: the build writes it, a mismatch means a broken package */
const SCHEMA_VERSION = 1;


/* --------
 * Data
 * -------- */

/** The documentation the package carries: read once, kept in memory, the pages loaded on demand */
export class DocsData {

  // ----
  // Private properties
  // ----
  private readonly _directory: string;

  private readonly _docs = new Map<string, ItemDoc>();

  private readonly _index: DocsIndex;


  // ----
  // Constructor
  // ----
  constructor(directory: string = DATA_DIR) {
    this._directory = directory;
    this._index = this._read<DocsIndex>('index.json');

    if (this._index.schemaVersion !== SCHEMA_VERSION) {
      throw new Error(
        `The data in ${directory} has schema ${this._index.schemaVersion}, this server reads ${SCHEMA_VERSION}: rebuild the package`
      );
    }
  }


  // ----
  // Public methods
  // ----

  /** The catalogue: every page, with the version of the packages it documents */
  get index(): DocsIndex {
    return this._index;
  }

  /** One page, whole, read from disk the first time it is asked for */
  doc(id: string): ItemDoc {
    const cached = this._docs.get(id);

    if (cached) {
      return cached;
    }

    const doc = this._read<ItemDoc>(path.join('docs', `${id}.json`));
    this._docs.set(id, doc);
    return doc;
  }


  // ----
  // Private methods
  // ----
  private _read<T>(file: string): T {
    const target = path.join(this._directory, file);

    if (!fs.existsSync(target)) {
      throw new Error(`The documentation data is missing (${target}): the package was published without its build/data`);
    }

    return JSON.parse(fs.readFileSync(target, 'utf8')) as T;
  }

}
