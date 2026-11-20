'use client';

import * as React from 'react';

import { cn } from '../../core/cn';

import { Spinner } from '../../components/Spinner';

import { ToneGlyph } from '../tone-glyphs/toneGlyphs';

import type { JobStatus, Notifications, NotificationsState } from './notificationsStore';


/*
 * What the provider and the button share, private to the subpath.
 */


export interface NotificationsContextValue {
  notifications: Notifications;
  state: NotificationsState;
}

export const NotificationsContext = React.createContext<NotificationsContextValue | null>(null);


export function useNotificationsState(notifications: Notifications): NotificationsState {
  return React.useSyncExternalStore(notifications.store.subscribe, notifications.store.getState, notifications.store.getState);
}

/** The mark of a status: the tone's icon, the spinner while it runs */
export function StatusMark(props: { status: JobStatus; className?: string }): React.ReactNode {
  const { className, status } = props;

  switch (status) {
    case 'running':
      return <Spinner size={'sm'} className={cn('text-info-soft-foreground', className)} />;
    case 'done':
      return <ToneGlyph tone={'success'} className={cn('size-4 shrink-0 text-success-soft-foreground', className)} />;
    case 'warning':
      return <ToneGlyph tone={'warning'} className={cn('size-4 shrink-0 text-warning-soft-foreground', className)} />;
    case 'failed':
      return <ToneGlyph tone={'destructive'} className={cn('size-4 shrink-0 text-destructive', className)} />;
    default:
      return <ToneGlyph tone={'info'} className={cn('size-4 shrink-0 text-muted-foreground', className)} />;
  }
}
