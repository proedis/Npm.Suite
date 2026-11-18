import * as React from 'react';

import { cn } from '../core/cn';

import { Spinner } from './Spinner';


/* --------
 * Types Definition
 * -------- */

export interface BusyVeilProps {
  /** From `useDelayedBusy`: the veil shows after 300ms and stays at least 400ms */
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
    <div
      data-slot={'busy-veil'}
      data-visible={visible || undefined}
      className={cn(
        'pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2',
        'bg-busy-veil text-sm font-medium text-foreground',
        'transition-opacity duration-150 motion-reduce:transition-none',
        visible ? 'pointer-events-auto opacity-100' : 'opacity-0',
        className
      )}
    >
      {visible && <Spinner size={'md'} className={'text-primary'} />}
      <span role={'status'} data-slot={'busy-veil-label'}>{visible ? label : ''}</span>
    </div>
  );

}

BusyVeil.displayName = 'BusyVeil';
