'use client';

import * as React from 'react';

import { cn } from '../../core/cn';
import { linkProps } from '../../core/link';

import { Stack } from '../../layout/Stack';

import { CONTROL_HEIGHT } from '../../internal/control';
import { ClearGlyph } from '../../internal/glyphs';

import { Button } from '../../actions/button/Button';
import { IconButton } from '../../actions/button/IconButton';
import { useLinkNavigate } from '../../actions/link/LinkProvider';

import { StatusMark, useNotificationsContext } from '../notifications/toastShared';

import type { Job, JobStatus, Notifications, NotificationsState } from '../notifications/notificationsStore';


/* --------
 * Types Definition
 * -------- */

export interface JobsPanelLabels {
  /** The name of the region */
  readonly region: string;

  /** The title of the panel: "Jobs" */
  readonly title: string;

  /** Name and tooltip of the button that reduces the panel */
  readonly collapse: string;

  /** "Clear the concluded" */
  readonly clear: string;

  /** Name and tooltip of the x of a row */
  readonly dismiss: string;

  readonly stop: string;
  readonly retry: string;

  /** The counts of the bar and of the header: "1 error", "2 running", "3 ready" */
  readonly errors: (count: number) => string;
  readonly running: (count: number) => string;
  readonly ready: (count: number) => string;

  /** The name of a progress bar: "45%" */
  readonly progress: (value: number) => string;
}

export interface JobsPanelProps {
  labels: JobsPanelLabels;
}

interface JobsPanelViewProps {
  notifications: Notifications;
  state: NotificationsState;
  labels: JobsPanelLabels;
}


/* --------
 * Constants Definition
 * -------- */

/** Errors first, then what runs, then what is ready */
const ORDER: Readonly<Record<JobStatus, number>> = { failed: 0, warning: 1, running: 2, stopped: 3, done: 4 };


/* --------
 * Helpers
 * -------- */

function counts(jobs: readonly Job[]): { errors: number; running: number; ready: number } {
  return {
    errors : jobs.filter((job) => job.status === 'failed').reduce((sum, job) => sum + job.count, 0),
    running: jobs.filter((job) => job.status === 'running').length,
    ready  : jobs.filter((job) => job.status === 'done' || job.status === 'warning' || job.status === 'stopped').length
  };
}


/* --------
 * Parts
 * -------- */

function CollapseGlyph(): React.ReactNode {
  return (
    <svg
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={2}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
      focusable={'false'}
    >
      <path d={'m6 9 6 6 6-6'} />
    </svg>
  );
}


function JobRow(props: { job: Job; labels: JobsPanelLabels; store: Notifications['store'] }): React.ReactNode {
  const { job, labels, store } = props;
  const navigate = useLinkNavigate();
  const concluded = job.status !== 'running';
  const { action } = job;

  let actionButton: React.ReactNode = null;

  if (action?.target) {
    actionButton = (
      <Stack
        gap={0}
        as={'a'}
        {...linkProps(action.target, navigate)}
        data-slot={'toast-job-link'}
        inline
        direction={'horizontal'}
        align={'center'}
        className={cn(
          CONTROL_HEIGHT.sm,
          'shrink-0 rounded-md px-2.5 text-xs font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring'
        )}
      >
        {action.label}
      </Stack>
    );
  }
  else if (action?.onClick) {
    actionButton = <Button size={'sm'} fill={'plain'} tone={'primary'} onClick={action.onClick}>{action.label}</Button>;
  }

  return (
    <Stack as={'li'} data-slot={'toast-job'} data-status={job.status} direction={'horizontal'} align={'start'} gap={3} className={'px-4 py-2.5'}>
      <StatusMark status={job.status} className={'mt-0.5'} />

      <div className={'min-w-0 flex-1'}>
        <div className={'font-medium'}>
          {job.title}
          {job.count > 1 && <span aria-hidden className={'ms-1 text-muted-foreground tabular-nums'}>{`(${job.count})`}</span>}
        </div>
        {job.detail !== null && job.detail !== undefined && <div className={'text-xs text-muted-foreground'}>{job.detail}</div>}
        {job.status === 'running' && job.value !== undefined && (
          <div
            role={'progressbar'}
            aria-label={labels.progress(job.value)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(job.value * 100)}
            className={'mt-1.5 h-1 overflow-hidden rounded-full bg-muted'}
          >
            <div
              className={'h-full origin-left bg-info transition-transform duration-200 motion-reduce:transition-none'}
              style={{ transform: `scaleX(${job.value})` }}
            />
          </div>
        )}
      </div>

      <Stack data-slot={'toast-job-actions'} direction={'horizontal'} align={'center'} gap={0.5} className={'-my-0.5 shrink-0'}>
        {job.status === 'running' && job.onStop && (
          <Button size={'sm'} fill={'plain'} tone={'primary'} onClick={() => store.stop(job.id)}>{labels.stop}</Button>
        )}
        {job.status === 'failed' && job.retry && (
          <Button size={'sm'} fill={'plain'} tone={'primary'} onClick={() => store.retry(job.id)}>{labels.retry}</Button>
        )}
        {actionButton}
        {concluded && (
          <IconButton label={labels.dismiss} icon={<ClearGlyph />} size={'sm'} onClick={() => store.dismiss(job.id)} />
        )}
      </Stack>
    </Stack>
  );
}


function JobsPanelView(props: JobsPanelViewProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { labels, notifications, state } = props;
  const { store } = notifications;


  // ----
  // Internal Hooks
  // ----
  const rootRef = React.useRef<HTMLDivElement>(null);
  const returnRef = React.useRef<HTMLElement | null>(null);


  // ----
  // Internal State
  // ----

  /* A row that changes state stays still while the pointer or the focus is in the panel */
  const [ holding, setHolding ] = React.useState(false);
  const [ heldOrder, setHeldOrder ] = React.useState<readonly string[]>([]);

  const sorted = [ ...state.jobs ].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const ordered = holding
    ? [ ...state.jobs ].sort((a, b) => {
      const ia = heldOrder.indexOf(a.id);
      const ib = heldOrder.indexOf(b.id);

      return (ia < 0 ? Number.MAX_SAFE_INTEGER : ia) - (ib < 0 ? Number.MAX_SAFE_INTEGER : ib);
    })
    : sorted;

  const summary = counts(state.jobs);
  const countsText = [
    summary.errors > 0 ? labels.errors(summary.errors) : null,
    summary.running > 0 ? labels.running(summary.running) : null,
    summary.ready > 0 ? labels.ready(summary.ready) : null
  ].filter(Boolean).join(' · ');

  let urgent: JobStatus = 'done';

  if (summary.errors > 0) {
    urgent = 'failed';
  }
  else if (summary.running > 0) {
    urgent = 'running';
  }


  // ----
  // Handlers
  // ----
  const hold = (): void => {
    if (!holding) {
      setHeldOrder(sorted.map((job) => job.id));
      setHolding(true);
    }
  };

  const collapse = (): void => {
    store.setExpanded(false);
    returnRef.current?.focus({ preventScroll: true });
    returnRef.current = null;
  };


  // ----
  // Lifecycle Events
  // ----

  /* The first click in the page reduces the panel */
  React.useEffect(() => {
    if (!state.expanded) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent): void => {
      if (rootRef.current && event.target instanceof Node && !rootRef.current.contains(event.target)) {
        store.setExpanded(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [ state.expanded, store ]);


  // ----
  // Component Render
  // ----
  if (state.jobs.length === 0) {
    return null;
  }

  return (
    <section
      ref={rootRef}
      aria-label={labels.region}
      data-slot={'toast-jobs'}
      data-expanded={state.expanded || undefined}
      tabIndex={-1}
      className={'pointer-events-auto fixed bottom-4 z-toast toast-end text-sm text-popover-foreground outline-none'}
      onPointerEnter={hold}
      onPointerLeave={() => setHolding(false)}
      onFocus={(event) => {
        const from = event.relatedTarget;

        if (!returnRef.current && from instanceof HTMLElement && !event.currentTarget.contains(from)) {
          returnRef.current = from;
        }

        hold();
      }}
      onBlur={(event) => {
        if (!(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) {
          setHolding(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && state.expanded) {
          event.preventDefault();
          collapse();
        }
      }}
    >
      {state.expanded
        ? (
          <Stack gap={0} data-slot={'toast-jobs-panel'} className={'toast-panel-width rounded-md bg-popover shadow-lg'}>
            <Stack
              data-slot={'toast-jobs-header'}
              direction={'horizontal'}
              align={'center'}
              gap={2}
              className={'h-12 flex-none border-b border-border ps-4 pe-2'}
            >
              <div className={'min-w-0 flex-1 truncate'}>
                <span className={'font-semibold'}>{labels.title}</span>
                {countsText && <span aria-hidden className={'ms-2 text-xs text-muted-foreground'}>{countsText}</span>}
              </div>
              {summary.ready + summary.errors > 0 && (
                <Button size={'sm'} fill={'plain'} tone={'muted'} onClick={() => store.clearConcluded()}>{labels.clear}</Button>
              )}
              <IconButton label={labels.collapse} icon={<CollapseGlyph />} size={'sm'} onClick={collapse} />
            </Stack>
            <ul className={'max-h-80 overflow-y-auto overscroll-contain scrollbar-thin py-1'}>
              {ordered.map((job) => <JobRow key={job.id} job={job} labels={labels} store={store} />)}
            </ul>
          </Stack>
        )
        : (
          <Stack
            as={'button'}
            type={'button'}
            data-slot={'toast-jobs-bar'}
            data-status={urgent}
            aria-expanded={false}
            direction={'horizontal'}
            align={'center'}
            gap={2}
            onClick={() => store.setExpanded(true)}
            className={cn(
              'h-10 rounded-md bg-popover px-4 text-sm shadow-lg outline-none',
              'hover:bg-accent focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring'
            )}
          >
            <StatusMark status={urgent} />
            <span className={'font-medium'}>{labels.title}</span>
            {countsText && <span className={'text-xs text-muted-foreground'}>{countsText}</span>}
          </Stack>
        )}
    </section>
  );

}


/* --------
 * Component Definition
 * -------- */

/**
 * The jobs of the application: a bar at the bottom right that opens into a panel, errors first, then what
 * runs, then what is ready. It reads the store of `NotificationsProvider`, so it is placed inside it, once,
 * where the application wants it: next to the router outlet of the shell, so the jobs stay when the page
 * changes.
 *
 * ```tsx
 * <NotificationsProvider notifications={notifications} labels={labels}>
 *   <App />
 *   <JobsPanel labels={jobsLabels} />
 * </NotificationsProvider>
 * ```
 *
 * A row that changes state holds still while the pointer or the focus is in the panel. The panel opens on
 * a click or on its own when an error arrives, and is reduced by Esc, the first click in the page or its
 * button. It is a list of ours rather than a second Base UI viewport, whose rows are dialogs that Esc
 * closes, swipe and stop at three. F6 reaches it after the confirmation. It stands left of an open drawer.
 *
 * Parts with a slot: `toast-jobs` (with `data-expanded`), `toast-jobs-bar` (with `data-status`),
 * `toast-jobs-panel`, `toast-jobs-header`, `toast-job` (with `data-status`), `toast-job-actions`,
 * `toast-job-link`.
 */
export function JobsPanel(props: JobsPanelProps): React.ReactNode {
  const { notifications, state } = useNotificationsContext();

  return <JobsPanelView notifications={notifications} state={state} labels={props.labels} />;
}

JobsPanel.displayName = 'JobsPanel';
