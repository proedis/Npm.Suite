/* --------
 * Types Definition
 * -------- */

/**
 * The shapes of the data the server reads, written by `apps/platform/scripts/llms.mjs` while this
 * package builds. They describe a file on disk, so they change only together with that script.
 */

export type ItemKind = 'component' | 'guide' | 'hook';

/** One page of the documentation, as the catalogue lists it */
export interface IndexItem {
  readonly id: string;
  readonly name: string;
  readonly kind: ItemKind;
  readonly group: string;
  readonly package: string;
  readonly subpath: string | null;
  readonly peers: readonly string[];
  readonly description: string;
  readonly route: string;
  readonly docsUrl: string;
  readonly markdownUrl: string;
  readonly headings: readonly { heading: string; slug: string }[];

  /** The headings the page files a table of props under: the component, then its parts */
  readonly propsOf: readonly string[];
  readonly themeCount: number;
  readonly slotsCount: number;
}

export interface DocsIndex {
  readonly schemaVersion: number;
  readonly generatedAt: string;

  /** The version of each package the documentation was written from */
  readonly packages: Readonly<Record<string, string>>;
  readonly siteUrl: string | null;
  readonly items: readonly IndexItem[];
}

export interface PropDoc {
  readonly name: string;
  readonly type: string;
  readonly values?: readonly string[];
  readonly default?: string;
  readonly required: boolean;
  readonly description: string;
  readonly from?: string;
  readonly shared: boolean;
  readonly dataAttribute?: string;
}

export interface ThemeVariable {
  readonly variable: string;
  readonly group: string;
  readonly via: readonly string[];
  readonly default?: string;
  readonly dark?: string;
}

export interface SlotDoc {
  readonly slot: string;
  readonly part: string | null;
  readonly attributes: readonly string[];
}

export interface DocSection {
  readonly heading: string;
  readonly slug: string;
  readonly body: string;
}

/** One page, whole */
export interface ItemDoc {
  readonly item: IndexItem;
  readonly intro: string;
  readonly sections: readonly DocSection[];
  readonly props: readonly { heading: string; props: readonly PropDoc[] }[];
  readonly theme: readonly ThemeVariable[];
  readonly slots: readonly SlotDoc[];
}
