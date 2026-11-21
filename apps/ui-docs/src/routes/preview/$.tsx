import * as React from 'react';

import { createFileRoute, getRouteApi, notFound } from '@tanstack/react-router';

import { cn } from '@proedis/ui/core';
import { Stack } from '@proedis/ui/layout';

import { FRAME_HEIGHT_MESSAGE } from '@/docs/frame';
import FormatsShell from '@/examples/data/FormatsShell';


/* --------
 * Constants Definition
 * -------- */

/** Every example file, loaded only when its preview is asked for */
const MODULES = import.meta.glob<{ default: React.ComponentType }>('/src/examples/**/*.tsx');

/**
 * The providers a section mounts once around its page, mounted here around its examples: a preview
 * is a page of its own, and an example must find what it found on the page.
 */
const SECTION_PROVIDERS: Readonly<Record<string, React.ComponentType<{ children: React.ReactNode }>>> = {
  data: FormatsShell
};

type FrameAlign = 'center' | 'start' | 'stretch';

/** The route below, reached from the page before it is declared */
const ROUTE = getRouteApi('/preview/$');


/* --------
 * Page
 * -------- */

/**
 * One example alone, inside the frame of a resizable preview: no navigation, no header, nothing but
 * the example and the padding of the preview pane. The frame's width is the viewport here, so every
 * responsive class of the example answers to the width the reader chose.
 */
function PreviewPage(): React.ReactNode {

  // ----
  // Internal Hooks
  // ----
  const { Component } = ROUTE.useLoaderData();
  const { _splat: id = '' } = ROUTE.useParams();


  // ----
  // Internal Refs
  // ----
  const contentRef = React.useRef<HTMLDivElement | null>(null);


  // ----
  // Memoized Data
  // ----
  const { align, className } = React.useMemo(() => {
    const search = new URLSearchParams(window.location.search);
    const value = search.get('align');

    return {
      align    : (value === 'start' || value === 'stretch' ? value : 'center') as FrameAlign,
      className: search.get('class') ?? undefined
    };
  }, []);

  const Provider = SECTION_PROVIDERS[id.split('/')[0]] ?? React.Fragment;


  // ----
  // Lifecycle Events
  // ----

  /** No scrollbar inside the frame: the page around it takes the height the content asks for */
  React.useEffect(() => {
    document.documentElement.dataset.previewFrame = '';
  }, []);

  /** The height of the content, sent to the page around the frame on every change */
  React.useEffect(() => {
    const content = contentRef.current;

    if (!content || window.parent === window) {
      return undefined;
    }

    const post = (): void => {
      window.parent.postMessage(
        { type: FRAME_HEIGHT_MESSAGE, height: Math.ceil(content.getBoundingClientRect().height) },
        window.location.origin
      );
    };

    const observer = new ResizeObserver(post);
    observer.observe(content);
    post();

    return () => observer.disconnect();
  }, []);


  // ----
  // Component Render
  // ----
  return (
    <div ref={contentRef}>
      <Stack
        align={align === 'stretch' ? 'stretch' : 'center'}
        justify={align === 'start' ? 'start' : 'center'}
        direction={align === 'start' ? 'horizontal' : 'vertical'}
        className={cn('min-h-36 p-6 sm:p-10', className)}
      >
        <Provider>
          <Component />
        </Provider>
      </Stack>
    </div>
  );

}


/* --------
 * Route
 * -------- */

export const Route = createFileRoute('/preview/$')({
  loader: async ({ params }) => {
    const load = MODULES[`/src/examples/${params._splat ?? ''}.tsx`];

    if (!load) {
      throw notFound();
    }

    return { Component: (await load()).default };
  },
  component: PreviewPage
});
