'use client';

import * as React from 'react';

import { Button } from '../../actions/button/Button';

import { AlertDialog } from '../alert-dialog/AlertDialog';

import type { ButtonProps } from '../../actions/button/Button';

import type { AlertDialogLabels } from '../alert-dialog/AlertDialog';

import type { DialogDiscard } from './Dialog';


/*
 * What Dialog and Drawer both put around a form: the prompt that `dirty` opens before the changes
 * are lost, and the Cancel of the footer that goes through the same gate as the x. Private to the
 * package: the barrel of `dialog` does not export it.
 */


/* --------
 * Types Definition
 * -------- */

interface DiscardPromptProps {
  discard: DialogDiscard;
  open: boolean;

  /** Kept the changes: Esc or the cancel button */
  onCancel: () => void;

  /** Discarded them: the move the prompt stopped can go on */
  onConfirm: () => void;

  /**
   * Where the focus goes when the prompt closes and the control it came from is gone: discarding a
   * form unmounts the field that had the focus. Read when the prompt closes, after the move
   */
  returnFocus?: () => HTMLElement | null;
}

export type OverlayCancelProps = ButtonProps & {
  /** The gate of the overlay: closes, goes back, or opens the discard prompt */
  onRequest: () => void;
};


/* --------
 * Constants Definition
 * -------- */

/**
 * The labels of the AlertDialog that the discard prompt never reads, written once. The prompt has
 * no `busy`, so no veil and no timeout, and no outcome, so no "Close": the texts it does show all
 * come from `discard`. Empty rather than invented, since the package writes no visible string.
 */
const UNREAD_LABELS: AlertDialogLabels = { busyLoad: '', busyAction: '', close: '', timeout: { title: '', description: '' } };


/* --------
 * Parts
 * -------- */

/** "Discard changes?", in warning, inside the overlay it protects so it sits above it */
export function DiscardPrompt(props: DiscardPromptProps): React.ReactNode {
  const { discard, onCancel, onConfirm, open, returnFocus } = props;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onCancel();
        }
      }}
      tone={'warning'}
      icon={discard.icon}
      title={discard.title}
      description={discard.description}
      actionLabel={discard.action}
      cancelLabel={discard.cancel}
      onAction={onConfirm}
      returnFocus={returnFocus}
      labels={UNREAD_LABELS}
    />
  );
}


/**
 * The exit next to the primary, through the overlay's gate. The caller's click runs first, and a
 * `preventDefault` in it keeps the overlay as it is
 */
export const OverlayCancel = React.forwardRef<HTMLButtonElement, OverlayCancelProps>((props, ref) => {
  const { onClick, onRequest, ...others } = props;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    onClick?.(event as Parameters<NonNullable<typeof onClick>>[0]);

    if (!event.defaultPrevented) {
      onRequest();
    }
  };

  return <Button fill={'solid'} tone={'secondary'} {...others} ref={ref} onClick={handleClick} />;
});

OverlayCancel.displayName = 'OverlayCancel';
