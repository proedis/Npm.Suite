import * as React from 'react';

import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router';

import { TooltipProvider } from '@proedis/ui/actions/tooltip';

import { DocsLayout } from '@/docs/DocsLayout';
import { PREVIEW_PREFIX } from '@/docs/frame';


/* --------
 * Route
 * -------- */

/** The site, or one example alone when the page is the frame of a resizable preview */
function RootComponent(): React.ReactNode {
  const isPreview = useRouterState({ select: (state) => state.location.pathname.startsWith(PREVIEW_PREFIX) });

  if (isPreview) {
    return (
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    );
  }

  return (
    <DocsLayout>
      <Outlet />
    </DocsLayout>
  );
}

export const Route = createRootRoute({
  component: RootComponent
});
