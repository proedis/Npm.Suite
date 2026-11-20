import * as React from 'react';

import { createRootRoute, Outlet } from '@tanstack/react-router';

import { DocsLayout } from '@/docs/DocsLayout';


/* --------
 * Route
 * -------- */

function RootComponent(): React.ReactNode {
  return (
    <DocsLayout>
      <Outlet />
    </DocsLayout>
  );
}

export const Route = createRootRoute({
  component: RootComponent
});
