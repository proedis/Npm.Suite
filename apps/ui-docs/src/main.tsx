import * as React from 'react';

import { createRouter, RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';

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


/* --------
 * Mount
 * -------- */

const root = document.getElementById('root');

if (!root) {
  throw new Error('The page has no #root to mount the site in');
}

createRoot(root).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
