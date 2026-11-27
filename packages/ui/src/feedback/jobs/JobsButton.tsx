'use client';

import * as React from 'react';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';
import { linkProps } from '../../core/link';

import { Stack } from '../../layout/Stack';


import { Button } from '../../actions/button/Button';
import { IconButton } from '../../actions/button/IconButton';
import { useLinkNavigate } from '../../actions/link/LinkProvider';

import { BadgeCounter } from '../../display/badge-counter/BadgeCounter';

import { StatusMark, useNotificationsContext } from '../notifications/toastShared';

import type { BaseProps } from '../../core/base';

import type { HistoryEntry } from '../notifications/notificationsStore';


/* --------
 * Types Definition
 * -------- */

export interface JobsButtonLabels {
  /** Name and tooltip of the button: "Jobs" */
  readonly button: string;

  /** The description of the button with the count: "1 to look at" */
  readonly unseen: (count: number) => string;

  /** The title of the history */
  readonly history: string;

  /** The history with nothing in it */
  readonly empty: string;

  readonly undo: string;

  /** Until when an operation can be undone: "until 14:32" */
  readonly undoUntil: (until: Date) => string;

  /** The time of a row */
  readonly time: (time: Date) => string;
}

export interface StrictJobsButtonProps extends BaseProps {
  /** The icon of the button, as a node */
  icon: React.ReactNode;
  labels: JobsButtonLabels;

  /** Classes for the wrapper of the button and its badge, last so they win */
  className?: string;
}
export type JobsButtonProps = StrictJobsButtonProps;


/* --------
 * Helpers
 * -------- */

function HistoryRow(props: {
  entry: HistoryEntry;
  labels: JobsButtonLabels;
  now: number;
  unseen: boolean;
  onUndo: (id: string) => void;
}): React.ReactNode {
  const { entry, labels, now, onUndo, unseen } = props;
  const navigate = useLinkNavigate();
  const undoOpen = entry.undo && (!entry.undo.until || entry.undo.until.getTime() > now);

  const title = entry.target
    ? <a {...linkProps(entry.target, navigate)} className={'outline-none hover:underline focus-visible:underline'}>{entry.title}</a>
    : entry.title;

  return (
    <Stack
      as={'li'}
      data-slot={'jobs-history-row'}
      data-unseen={unseen || undefined}
      direction={'horizontal'}
      align={'start'}
      gap={2}
      className={'rounded-sm px-3 py-2'}
    >
      <StatusMark status={entry.status} className={'mt-0.5'} />
      <div className={'min-w-0 flex-1'}>
        <div className={cn(unseen ? 'font-semibold' : 'font-normal')}>{title}</div>
        {entry.detail !== null && entry.detail !== undefined && <div className={'text-xs text-muted-foreground'}>{entry.detail}</div>}
        <Stack
          data-slot={'jobs-history-row-meta'}
          direction={'horizontal'}
          align={'center'}
          gap={1.5}
          className={'text-xs text-muted-foreground'}
        >
          {unseen && <span aria-hidden className={'size-2 rounded-full bg-info'} />}
          {labels.time(entry.time)}
          {undoOpen && entry.undo?.until && <span>{`· ${labels.undoUntil(entry.undo.until)}`}</span>}
        </Stack>
      </div>
      {undoOpen && entry.undo && (
        <Button size={'sm'} fill={'plain'} tone={'primary'} onClick={() => onUndo(entry.id)}>{labels.undo}</Button>
      )}
    </Stack>
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * The "Jobs" button of the top bar, with the history of the session: every confirmation, job and
 * error, the most recent first, the last 50.
 *
 * ```tsx
 * <JobsButton icon={<Bell />} labels={jobsButtonLabels} />
 * ```
 *
 * The badge counts the errors and the concluded jobs that left the panel unseen, `destructive` when
 * one is an error; the count reaches a screen reader through the button's description, so its name
 * never changes. Opening the history marks them all as seen. A row with a destination is a real link;
 * "Undo" stays on its row until the operation can no longer be undone. Needs `NotificationsProvider`.
 *
 * Parts with a slot: `jobs` (the wrapper of the button and its badge), `jobs-button`, `jobs-history`,
 * `jobs-history-row` (with `data-unseen`), `jobs-history-row-meta`.
 */
export function JobsButton(props: JobsButtonProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { className, icon, labels } = props;
  const { baseClasses } = splitBaseProps(props);


  // ----
  // Internal Hooks
  // ----
  const context = useNotificationsContext();
  const countId = React.useId();


  // ----
  // Internal State
  // ----
  const [ open, setOpen ] = React.useState(false);
  const [ now, setNow ] = React.useState(() => Date.now());

  /**
   * What was unseen when the history opened. Opening marks every entry as seen in the store, and does
   * so before the panel renders, so the rows read from the store would never show what was new.
   */
  const [ unseenAtOpen, setUnseenAtOpen ] = React.useState<ReadonlySet<string>>(() => new Set());

  /* Outside a NotificationsProvider the hook throws, naming it: rendering nothing there was a silent failure */
  const { notifications, state } = context;
  const unseen = state.history.filter((entry) => !entry.seen);
  const hasError = unseen.some((entry) => entry.status === 'failed');


  // ----
  // Handlers
  // ----
  const handleOpenChange = (next: boolean): void => {
    if (next) {
      setNow(Date.now());
      setUnseenAtOpen(new Set(notifications.store.getState().history.filter((entry) => !entry.seen).map((entry) => entry.id)));
      notifications.store.markSeen();
    }

    setOpen(next);
  };


  // ----
  // Component Render
  // ----
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <Stack gap={0} as={'span'} data-slot={'jobs'} inline direction={'horizontal'} className={cn('relative', baseClasses, className)}>
        <PopoverPrimitive.Trigger
          render={(
            <IconButton
              label={labels.button}
              icon={icon}
              data-slot={'jobs-button'}
              aria-describedby={unseen.length > 0 ? countId : undefined}
            />
          )}
        />
        <BadgeCounter count={unseen.length} tone={hasError ? 'destructive' : 'info'} />
        {unseen.length > 0 && <span id={countId} hidden>{labels.unseen(unseen.length)}</span>}
      </Stack>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner sideOffset={4} collisionPadding={8} align={'end'} className={'z-popover'}>
          <PopoverPrimitive.Popup
            data-slot={'jobs-history'}
            render={<Stack gap={0} />}
            className={cn(
              'max-h-(--available-height) w-90 rounded-md bg-popover p-1 text-sm text-popover-foreground shadow-md outline-none',
              'transition-opacity duration-150 data-starting-style:opacity-0 data-ending-style:transition-none motion-reduce:transition-none'
            )}
          >
            <PopoverPrimitive.Title className={'px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground'}>{labels.history}</PopoverPrimitive.Title>
            {state.history.length === 0
              ? <p className={'px-3 py-2 text-muted-foreground'}>{labels.empty}</p>
              : (
                <ul className={'max-h-96 overflow-y-auto overscroll-contain scrollbar-thin'}>
                  {state.history.map((entry) => (
                    <HistoryRow
                      key={entry.id}
                      entry={entry}
                      labels={labels}
                      now={now}
                      unseen={unseenAtOpen.has(entry.id)}
                      onUndo={notifications.store.undo}
                    />
                  ))}
                </ul>
              )}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );

}

JobsButton.displayName = 'JobsButton';
