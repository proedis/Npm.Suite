import * as React from 'react';

import { createNotifications, NotificationsProvider } from '@proedis/ui/feedback/notifications';

import type { JobsButtonLabels, NotificationsLabels } from '@proedis/ui/feedback/notifications';


/* --------
 * The notifications of the application
 * -------- */

/** Created once, in a module of its own: every page imports this one */
export const notifications = createNotifications();

const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' });

/** Every text the notifications show: the package writes none */
export const labels: NotificationsLabels = {
  confirmRegion: 'Confirmations',
  jobsRegion   : 'Jobs',
  title        : 'Jobs',
  collapse     : 'Reduce',
  clear        : 'Clear the concluded',
  dismiss      : 'Dismiss',
  stop         : 'Stop',
  retry        : 'Retry',
  undo         : 'Undo',
  errors       : (count) => (count === 1 ? '1 error' : `${count} errors`),
  running      : (count) => `${count} running`,
  ready        : (count) => `${count} ready`,
  progress     : (value) => `${Math.round(value * 100)}%`
};

export const jobsButtonLabels: JobsButtonLabels = {
  button   : 'Jobs',
  unseen   : (count) => (count === 1 ? '1 to look at' : `${count} to look at`),
  history  : 'This session',
  empty    : 'Nothing yet',
  undo     : 'Undo',
  undoUntil: (until) => `until ${TIME.format(until)}`,
  time     : (time) => TIME.format(time)
};


/* --------
 * The shell
 * -------- */

/** Mounted once in the shell of the application, above the router: the jobs stay when the page changes */
export default function AppShell(props: { children?: React.ReactNode }): React.ReactNode {
  return (
    <NotificationsProvider notifications={notifications} labels={labels}>
      {props.children}
    </NotificationsProvider>
  );
}
