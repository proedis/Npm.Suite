'use client';

import type * as React from 'react';

import { Toast as ToastPrimitive } from '@base-ui/react/toast';

import type { LinkTarget } from '../../core/link';


/* --------
 * Types Definition
 * -------- */

/** Where a job stands. `failed` is also the state of an error with no job behind it */
export type JobStatus = 'running' | 'done' | 'warning' | 'stopped' | 'failed';

/** What a row offers: a destination, rendered as a real link, or a function */
export interface JobAction {
  readonly label: React.ReactNode;
  readonly target?: LinkTarget;
  readonly onClick?: () => void;
}

export interface Job {
  readonly id: string;
  readonly status: JobStatus;
  readonly title: React.ReactNode;
  readonly detail?: React.ReactNode;

  /** From 0 to 1; without, the row shows only the spinner */
  readonly value?: number;

  readonly action?: JobAction;
  readonly retry?: () => void;
  readonly onStop?: () => void;
  readonly groupKey?: string;

  /** Errors of the same `groupKey` merged into one row */
  readonly count: number;

  /** Seen in the open panel, once concluded */
  readonly seen: boolean;

  readonly time: Date;
}

export interface HistoryEntry {
  readonly id: string;
  readonly kind: 'confirmation' | 'job';
  readonly status: JobStatus;
  readonly title: React.ReactNode;
  readonly detail?: React.ReactNode;
  readonly target?: LinkTarget;
  readonly undo?: UndoOptions;
  readonly seen: boolean;
  readonly time: Date;
}

export interface UndoOptions {
  readonly onClick: () => void;

  /** Until when the operation can be undone: the history keeps "Undo" until then */
  readonly until?: Date;
}

export interface NotificationsState {
  readonly jobs: readonly Job[];
  readonly history: readonly HistoryEntry[];
  readonly expanded: boolean;

  /** The last change worth saying, polite, and the last error, urgent: each said once */
  readonly polite: { readonly key: number; readonly text: React.ReactNode };
  readonly assertive: { readonly key: number; readonly text: React.ReactNode };
}

export interface StartOptions {
  title: React.ReactNode;
  detail?: React.ReactNode;

  /** Puts "Stop" on the row */
  onStop?: () => void;
  groupKey?: string;
}

export interface OutcomeOptions {
  title: React.ReactNode;
  detail?: React.ReactNode;
  action?: JobAction;
}

export interface FailOptions extends OutcomeOptions {
  /** Puts "Retry", which removes the row and runs the same job again */
  retry?: () => void;
}

export interface ErrorOptions extends OutcomeOptions {
  groupKey?: string;
}

export interface Notifications {
  /** The confirmation of an action: one at a time, at the bottom, with "Undo" at most */
  readonly notify: {
    done: (options: { title: React.ReactNode; undo?: UndoOptions }) => void;
  };

  /** The long jobs, their outcome, and the errors with no place to appear */
  readonly jobs: {
    start: (options: StartOptions) => string;
    progress: (id: string, options: { value: number; detail?: React.ReactNode }) => void;
    succeed: (id: string, options: OutcomeOptions) => void;
    warn: (id: string, options: FailOptions) => void;
    fail: (id: string, options: FailOptions) => void;
    error: (options: ErrorOptions) => string;
  };

  /** For the components of this subpath */
  readonly store: NotificationsStore;
}

export interface NotificationsStore {
  subscribe: (listener: () => void) => () => void;
  getState: () => NotificationsState;
  setExpanded: (expanded: boolean) => void;
  dismiss: (id: string) => void;
  clearConcluded: () => void;
  stop: (id: string) => void;
  retry: (id: string) => void;
  markSeen: (ids?: readonly string[]) => void;
  readonly confirmations: ReturnType<typeof ToastPrimitive.createToastManager>;
}


/* --------
 * Constants Definition
 * -------- */

const HISTORY_SIZE = 50;

/** 4s on one line, 6 when it wraps, 8 with "Undo" */
function confirmationTimeout(title: React.ReactNode, undo: boolean): number {
  if (undo) {
    return 8000;
  }

  return typeof title === 'string' && title.length > 60 ? 6000 : 4000;
}


/* --------
 * Factory
 * -------- */

/**
 * The notifications of an application, created once and given to `NotificationsProvider`. A module
 * calls `notify` and `jobs`, never the router: destinations arrive as `LinkTarget`.
 *
 * ```ts
 * export const notifications = createNotifications();
 *
 * const id = notifications.jobs.start({ title: t('EXPORT.RUNNING') });
 * notifications.jobs.succeed(id, { title: t('EXPORT.READY'), action: { label: t('COMMON.DOWNLOAD'), onClick: download } });
 * ```
 *
 * The state lives here, and the panel, the history and the badge read it: the Base UI manager of
 * the confirmation is one projection of it.
 */
export function createNotifications(): Notifications {
  let state: NotificationsState = {
    jobs     : [],
    history  : [],
    expanded : false,
    polite   : { key: 0, text: null },
    assertive: { key: 0, text: null }
  };

  const listeners = new Set<() => void>();
  const confirmations = ToastPrimitive.createToastManager();
  let lastConfirmation: string | null = null;
  let sequence = 0;

  const nextId = (): string => {
    sequence += 1;

    return `job-${sequence}`;
  };

  const set = (next: Partial<NotificationsState>): void => {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  };

  const say = (text: React.ReactNode, urgent: boolean): Partial<NotificationsState> => (
    urgent
      ? { assertive: { key: state.assertive.key + 1, text } }
      : { polite: { key: state.polite.key + 1, text } }
  );

  const record = (entry: HistoryEntry): readonly HistoryEntry[] => (
    [ entry, ...state.history.filter((item) => item.id !== entry.id) ].slice(0, HISTORY_SIZE)
  );

  const historyOf = (job: Job): HistoryEntry => ({
    id    : job.id,
    kind  : 'job',
    status: job.status,
    title : job.title,
    detail: job.detail,
    target: job.action?.target,
    seen  : job.status === 'running' || job.seen,
    time  : job.time
  });

  const update = (id: string, patch: Partial<Job>, announce?: { urgent: boolean }): void => {
    const job = state.jobs.find((item) => item.id === id);

    if (!job) {
      return;
    }

    const next: Job = { ...job, ...patch, seen: state.expanded && patch.status !== undefined && patch.status !== 'running' };

    set({
      jobs    : state.jobs.map((item) => (item.id === id ? next : item)),
      history : patch.status ? record(historyOf(next)) : state.history,
      expanded: announce?.urgent ? true : state.expanded,
      ...(announce ? say(next.title, announce.urgent) : {})
    });
  };

  const store: NotificationsStore = {
    subscribe: (listener) => {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },

    getState: () => state,

    setExpanded: (expanded) => {
      if (expanded === state.expanded) {
        return;
      }

      /* Rows visible in the open panel count as seen */
      const concluded = state.jobs.filter((job) => job.status !== 'running').map((job) => job.id);

      set({
        expanded,
        jobs   : expanded ? state.jobs.map((job) => (job.status === 'running' ? job : { ...job, seen: true })) : state.jobs,
        history: expanded
          ? state.history.map((entry) => (concluded.includes(entry.id) ? { ...entry, seen: true } : entry))
          : state.history
      });
    },

    dismiss: (id) => {
      set({ jobs: state.jobs.filter((job) => job.id !== id) });
    },

    clearConcluded: () => {
      set({ jobs: state.jobs.filter((job) => job.status === 'running') });
    },

    stop: (id) => {
      const job = state.jobs.find((item) => item.id === id);

      job?.onStop?.();
      update(id, { status: 'stopped', value: undefined }, { urgent: false });
    },

    retry: (id) => {
      const job = state.jobs.find((item) => item.id === id);

      set({ jobs: state.jobs.filter((item) => item.id !== id) });
      job?.retry?.();
    },

    markSeen: (ids) => {
      set({ history: state.history.map((entry) => (!ids || ids.includes(entry.id) ? { ...entry, seen: true } : entry)) });
    },

    confirmations
  };

  return {
    store,

    notify: {
      done: ({ title, undo }) => {
        if (lastConfirmation) {
          confirmations.close(lastConfirmation);
        }

        lastConfirmation = confirmations.add({
          title,
          timeout: confirmationTimeout(title, Boolean(undo)),
          data   : { undo }
        });

        sequence += 1;
        set({
          history: record({
            id    : `confirmation-${sequence}`,
            kind  : 'confirmation',
            status: 'done',
            title,
            undo,
            seen  : true,
            time  : new Date()
          })
        });
      }
    },

    jobs: {
      start: ({ detail, groupKey, onStop, title }) => {
        const id = nextId();
        const job: Job = { id, status: 'running', title, detail, onStop, groupKey, count: 1, seen: false, time: new Date() };

        set({ jobs: [ ...state.jobs, job ], history: record(historyOf(job)), ...say(title, false) });

        return id;
      },

      progress: (id, { detail, value }) => {
        update(id, { value: Math.min(1, Math.max(0, value)), ...(detail !== undefined ? { detail } : {}) });
      },

      succeed: (id, options) => update(id, { status: 'done', value: undefined, ...options }, { urgent: false }),

      warn: (id, options) => update(id, { status: 'warning', value: undefined, ...options }, { urgent: false }),

      fail: (id, options) => update(id, { status: 'failed', value: undefined, ...options }, { urgent: true }),

      error: ({ action, detail, groupKey, title }) => {
        const same = groupKey ? state.jobs.find((job) => job.groupKey === groupKey && job.status === 'failed') : undefined;

        if (same) {
          update(same.id, { title, detail, action, count: same.count + 1, status: 'failed' }, { urgent: true });

          return same.id;
        }

        const id = nextId();
        const job: Job = { id, status: 'failed', title, detail, action, groupKey, count: 1, seen: state.expanded, time: new Date() };

        set({ jobs: [ ...state.jobs, job ], history: record(historyOf(job)), expanded: true, ...say(title, true) });

        return id;
      }
    }
  };
}
