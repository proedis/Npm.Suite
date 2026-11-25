'use client';

import * as React from 'react';

import { useClipboard } from '@proedis/react';

import { cn } from '../../core/cn';
import { TONE_CLASSES } from '../../core/tone';

import { VisuallyHidden } from '../../primitives/VisuallyHidden';

import { CopyGlyph, DoneGlyph } from '../../internal/glyphs';

import { IconButton } from '../button/IconButton';

import type { ClipboardValue } from '@proedis/react';

import type { IconButtonProps } from '../button/IconButton';


/* --------
 * Types Definition
 * -------- */

export interface CopyButtonLabels {
  /** The name and the tooltip of the button: "Copy the key" */
  readonly copy: string;

  /** The name, the tooltip and the announcement once copied: "Copied" */
  readonly copied: string;

  /** The same when the browser refused: "Could not copy". Without it the button simply stays as it was */
  readonly failed?: string;
}

export type CopyButtonProps = Omit<IconButtonProps, 'label' | 'icon' | 'onClick' | 'loading' | 'loadingLabel' | 'value' | 'onCopy'> & {
  /** What to copy: the text, or a function read at the moment of the copy, which may be asynchronous */
  value: ClipboardValue;

  /** The texts: the package writes none */
  labels: CopyButtonLabels;

  /** The glyph of the button at rest. Defaults to two sheets */
  icon?: React.ReactNode;

  /** How long the tick stays. Defaults to 1500ms */
  resetAfter?: number;

  /** Told after each attempt, with whether it worked */
  onCopy?: (copied: boolean) => void;
};


/* --------
 * Component Definition
 * -------- */

/**
 * An `IconButton` that copies a value to the clipboard, then shows a tick for a moment.
 *
 * ```tsx
 * <CopyButton value={order.code} labels={{ copy: 'Copy the code', copied: 'Copied' }} />
 * ```
 *
 * The icon, the name and the tooltip change together while the tick lasts, and a status region says
 * `copied` once, since a change of name alone is not announced. It works where the Clipboard API is not
 * offered too, an intranet over plain http, through `useClipboard` of `@proedis/react`. In a text field,
 * `TextInput.Copy` is the same button with the look of a field action, shown in a read only field too.
 *
 * Parts with a slot: `copy-button` (with `data-status`), `copy-button-status`.
 */
export const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const { className, icon, labels, onCopy, resetAfter, value, ...rest } = props;


  // ----
  // Internal Hooks
  // ----
  const clipboard = useClipboard({ resetAfter });


  // ----
  // Handlers
  // ----
  const handleClick = async (): Promise<void> => {
    /* Copied first, told after: `onCopy?.(await …)` would skip the copy itself when there is no `onCopy` */
    const copied = await clipboard.copy(value);

    onCopy?.(copied);
  };


  // ----
  // Component Render
  // ----
  const { status } = clipboard;
  const failed = status === 'failed' && labels.failed !== undefined;
  const label = status === 'copied' ? labels.copied : (failed ? labels.failed as string : labels.copy);

  return (
    <React.Fragment>
      <IconButton
        data-slot={'copy-button'}
        {...rest}
        ref={ref}
        data-status={status}
        label={label}
        icon={status === 'copied'
          ? <span data-slot={'copy-button-done'} className={cn('contents', TONE_CLASSES.plain.success)}><DoneGlyph /></span>
          : (icon ?? <CopyGlyph />)}
        className={className}
        onClick={() => {
          /* Never rejects: `copy` reports a refusal as `false` */
          handleClick().catch(() => undefined);
        }}
      />
      <VisuallyHidden>
        <span role={'status'} data-slot={'copy-button-status'}>{status === 'copied' || failed ? label : ''}</span>
      </VisuallyHidden>
    </React.Fragment>
  );

});

CopyButton.displayName = 'CopyButton';
