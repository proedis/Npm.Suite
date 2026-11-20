'use client';

import * as React from 'react';

import { contextBuilder } from '@proedis/react';

import { cn } from '../../core/cn';
import { TONE_CLASSES } from '../../core/tone';

import { Spinner } from '../../primitives/Spinner';
import { ToneGlyph } from '../../internal/glyphs';


import type { JobStatus, Notifications, NotificationsState } from './notificationsStore';


/*
 * What the provider and the button share, private to the subpath.
 */


export interface NotificationsContextValue {
  notifications: Notifications;
  state: NotificationsState;
}

export const [ NotificationsContext, useNotificationsContext ] = contextBuilder<NotificationsContextValue>('Notifications');


export function useNotificationsState(notifications: Notifications): NotificationsState {
  return React.useSyncExternalStore(notifications.store.subscribe, notifications.store.getState, notifications.store.getState);
}

/** The mark of a status: the tone's icon, the spinner while it runs */
export function StatusMark(props: { status: JobStatus; className?: string }): React.ReactNode {
  const { className, status } = props;

  switch (status) {
    case 'running':
      return <Spinner size={'sm'} className={cn(TONE_CLASSES.plain.info, className)} />;
    case 'done':
      return <ToneGlyph tone={'success'} className={cn('size-4 shrink-0', TONE_CLASSES.plain.success, className)} />;
    case 'warning':
      return <ToneGlyph tone={'warning'} className={cn('size-4 shrink-0', TONE_CLASSES.plain.warning, className)} />;
    case 'failed':
      return <ToneGlyph tone={'destructive'} className={cn('size-4 shrink-0', TONE_CLASSES.plain.destructive, className)} />;
    default:
      return <ToneGlyph tone={'info'} className={cn('size-4 shrink-0 text-muted-foreground', className)} />;
  }
}
