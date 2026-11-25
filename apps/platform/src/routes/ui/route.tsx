import * as React from 'react';

import { createFileRoute, Outlet } from '@tanstack/react-router';

import { DocsLayout } from '@/docs/DocsLayout';
import { NAV } from '@/nav';


/* --------
 * Route
 * -------- */

/** The section of Proedis UI: its rail, its page and its outline, around every page under /ui */
function UiSection(): React.ReactNode {
  return (
    <DocsLayout nav={NAV}>
      <Outlet />
    </DocsLayout>
  );
}

export const Route = createFileRoute('/ui')({
  component: UiSection
});
