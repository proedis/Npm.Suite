import * as React from 'react';

import { cn } from '../core/cn';

import { Stack } from '../layout/Stack';

import { Spinner } from './Spinner';


/* --------
 * Types Definition
 * -------- */

export interface BusyVeilProps {
  /**
   * From `useDelayedBusy`. After a press of the user, `{ delay: 0 }`: the veil at once, held at least
   * 400ms, as the overlays do; the default 300ms delay is for a wait nobody asked for
   */
  visible: boolean;

  /** What is happening, already translated: "Saving the signal". Shown and announced */
  label: string;

  className?: string;
}


/* --------
 * Component Definition
 * -------- */

/**
 * The veil over a dialog or a drawer that loads or saves, the first load included.
 *
 * ```tsx
 * <div className={'relative'} aria-busy={wait.busy} inert={inertValue(wait.busy)}>
 *   …
 *   <BusyVeil visible={wait.visible} label={'Saving'} />
 * </div>
 * ```
 *
 * A `status` region that stays mounted and takes its text when the veil appears, so the announcement
 * is made once; a 20px `primary` spinner over the `busy-veil` surface. Blocking the clicks at once
 * (`busy`) is the container's job, the veil is only the look. Hidden, it is transparent rather than
 * `invisible`, so the region stays in the accessibility tree and its first text is announced.
 *
 * Parts with a slot: `busy-veil` (with `data-visible`), `busy-veil-label`.
 */
export function BusyVeil(props: BusyVeilProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { className, label, visible } = props;


  // ----
  // Component Render
  // ----
  return (
    <Stack
      data-slot={'busy-veil'}
      data-visible={visible || undefined}
      align={'center'}
      justify={'center'}
      gap={2}
      className={cn(
        'pointer-events-none absolute inset-0 z-10',
        'bg-busy-veil text-sm font-medium text-foreground',
        'transition-opacity duration-150 motion-reduce:transition-none',
        visible ? 'pointer-events-auto opacity-100' : 'opacity-0',
        className
      )}
    >
      {visible && <Spinner size={'md'} className={'text-primary'} />}
      <span role={'status'} data-slot={'busy-veil-label'}>{visible ? label : ''}</span>
    </Stack>
  );

}

BusyVeil.displayName = 'BusyVeil';
