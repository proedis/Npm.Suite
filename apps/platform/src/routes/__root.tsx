import * as React from 'react';

import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';

import { TooltipProvider } from '@proedis/ui/actions/tooltip';

import { PREVIEW_PREFIX } from '@/docs/frame';
import { PlatformHeader } from '@/platform/PlatformHeader';


/* --------
 * Route
 * -------- */

/**
 * Proedis Internal Platform: the bar of the platform over every page, a section's own layout under it
 * (its layout route), or one example alone when the page is the frame of a resizable preview.
 */
function RootComponent(): React.ReactNode {

  // ----
  // Internal Hooks
  // ----
  const { pathname } = useLocation();


  // ----
  // Lifecycle Events
  // ----

  /** A new page starts at its top, unless the address points into it */
  React.useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0 });
    }
  }, [ pathname ]);


  // ----
  // Component Render
  // ----
  if (pathname.startsWith(PREVIEW_PREFIX)) {
    return (
      <TooltipProvider>
        <Outlet />
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <PlatformHeader />
      <Outlet />
    </TooltipProvider>
  );
}

export const Route = createRootRoute({
  component: RootComponent
});
