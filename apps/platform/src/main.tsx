import * as React from 'react';

import { createRouter, RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';

import { LinkProvider } from '@proedis/ui/actions/link';

import { routeTree } from './routeTree.gen';

import './styles.css';


/* --------
 * Router
 * -------- */

const router = createRouter({ routeTree, defaultPreload: 'intent' });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}


/** The router's navigation, for every link of the package written as an address */
function navigate(href: string): void {
  router.navigate({ href }).catch(() => undefined);
}


/* --------
 * Mount
 * -------- */

const root = document.getElementById('root');

if (!root) {
  throw new Error('The page has no #root to mount the site in');
}

createRoot(root).render(
  <React.StrictMode>
    {/* Every link of the package written as an address navigates in the page */}
    <LinkProvider navigate={navigate}>
      <RouterProvider router={router} />
    </LinkProvider>
  </React.StrictMode>
);
