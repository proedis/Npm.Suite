import { optionalContextBuilder } from '@proedis/react';

import type { PropDoc } from './propDoc';
import type { SlotRow } from './Tables';
import type { ThemeVariable } from './themeDoc';


/* --------
 * Types Definition
 * -------- */

/** The props a page documents under one heading: the component, or one of its parts */
export interface CollectedProps {
  readonly heading: string;
  readonly props: readonly PropDoc[];
}

/**
 * What a page hands to the text build besides its markdown: the same data its tables render, kept
 * structured for the MCP server, which answers a question on props without parsing a table.
 */
export interface DocsCollector {
  props: CollectedProps[];
  theme: ThemeVariable[];
  slots: SlotRow[];
}

/**
 * Who a page is rendered for. `web` is the site. `text` is the build of `llms.txt` and of the data of
 * the MCP server: the same pages, with every part that only works on a screen (a live preview, a
 * highlighted block, an inspector, a frame) rendered as the plain content it shows.
 */
export interface DocsTarget {
  readonly mode: 'web' | 'text';

  /** The heading of the section being rendered, in text mode: what a table of props is filed under */
  readonly heading?: string;

  /** Where the text build collects the structured data of the page */
  readonly collector?: DocsCollector;
}


/* --------
 * Context
 * -------- */

export const [ DocsTargetContext, useDocsTarget ] = optionalContextBuilder<DocsTarget>('DocsTarget', { mode: 'web' });


/** A fresh collector, one per page */
export function createCollector(): DocsCollector {
  return { props: [], theme: [], slots: [] };
}
