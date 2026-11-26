import * as React from 'react';

import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { prerenderToNodeStream } from 'react-dom/static';

import { LinkProvider } from '@proedis/ui/actions/link';

import { createCollector, DocsTargetContext } from '@/docs/target';
import { NAV } from '@/nav';
import { routeTree } from '@/routeTree.gen';

import type { DocsCollector } from '@/docs/target';
import type { Peer } from '@/nav';


/* --------
 * Types Definition
 * -------- */

/** A page of the navigation, without what only a screen uses (its icon) */
export interface TextPage {
  readonly route: string;
  readonly title: string;
  readonly description: string;
  readonly group: string;
  readonly subpath?: string;
  readonly peers?: readonly Peer[];
}

export interface RenderedPage {
  /** The page alone, as the text target renders it */
  readonly html: string;

  /** The structured data its tables render: props, variables of the theme, slots */
  readonly data: DocsCollector;
}


/* --------
 * Pages
 * -------- */

/** Every written page of the UI section, in reading order, with the group it sits in */
export const TEXT_PAGES: readonly TextPage[] = NAV.flatMap((group) => group.items
  .filter((item) => item.ready)
  .map((item) => ({
    route      : item.to,
    title      : item.title,
    description: item.description,
    group      : group.title,
    subpath    : item.subpath,
    peers      : item.peers
  })));


/* --------
 * Render
 * -------- */

/** A stream rendered into one string */
async function text(stream: NodeJS.ReadableStream): Promise<string> {
  let html = '';

  for await (const chunk of stream) {
    html += chunk.toString();
  }

  return html;
}

/**
 * One page, through the router of the site, in the text target. The prerender waits for every lazy
 * route and every suspended part, so what comes back is the whole page.
 */
export async function renderPage(route: string): Promise<RenderedPage> {
  const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [ route ] }) });
  await router.load();

  const data = createCollector();

  const { prelude } = await prerenderToNodeStream(
    <DocsTargetContext value={{ mode: 'text', collector: data }}>
      <LinkProvider navigate={() => undefined}>
        <RouterProvider router={router} />
      </LinkProvider>
    </DocsTargetContext>
  );

  return { html: await text(prelude), data };
}
