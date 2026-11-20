'use client';

import * as React from 'react';

import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';

import { cn } from '../../core/cn';

import { BusyVeil } from '../../components/BusyVeil';

import { Button } from '../button/Button';
import { Field } from '../field/Field';
import {
  focusTarget,
  OverlayBody,
  OverlayFooter,
  OverlayFrame,
  OverlayHeader,
  OverlayVeil,
  SUBMIT_TIMEOUT,
  useFocusWhenSet,
  useNudge,
  useOrigin,
  useOverlayBusy
} from '../overlay-shell/overlayShell';
import { TextInput } from '../text-input/TextInput';


/* --------
 * Types Definition
 * -------- */

export interface AlertDialogLabels {
  /** The veil over the consequences while they load */
  readonly busyLoad: string;

  /** The veil over the dialog while the action runs */
  readonly busyAction: string;

  /** The exit after an outcome: "Close" */
  readonly close: string;

  /** The uncertain outcome, once `timeoutMs` has passed: the server may have done it anyway */
  readonly timeout: { readonly title: React.ReactNode; readonly description: React.ReactNode };

  /** Grade 3: the label of the field, with the noun ("Name of the order") */
  readonly confirmField?: string;

  /** Grade 3: the hint under the field, with the text to type */
  readonly confirmHint?: (text: string) => React.ReactNode;

  /** Grade 3: the hint once the text matches, announced */
  readonly confirmMatch?: React.ReactNode;

  /** Grade 3: the field error when the text does not match */
  readonly confirmMismatch?: (text: string) => React.ReactNode;
}

export interface AlertDialogResult {
  readonly title: React.ReactNode;
  readonly description: React.ReactNode;
}

export interface StrictAlertDialogProps {
  /** Controlled only */
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** The question, with verb and object: "Delete signal SG-2038?" */
  title: React.ReactNode;

  /** Whether it can be recovered, and what stays out */
  description: React.ReactNode;

  /** `warning` only to discard unsaved changes; deleting anything saved is `destructive`. Defaults to `destructive` */
  tone?: 'destructive' | 'warning';

  /** In the box of the tone: a bin to delete, a triangle to discard */
  icon: React.ReactNode;

  /** Grade 2: the effects on other items, to read before choosing */
  consequences?: React.ReactNode;

  /** The `solid destructive` action, with verb and object */
  actionLabel: React.ReactNode;
  onAction: () => void;

  /** The safe exit, which has the focus: "Cancel", "Keep editing" */
  cancelLabel: React.ReactNode;

  /** `load` while the consequences arrive (Esc closes), `action` while it runs (nothing closes) */
  busy?: false | 'load' | 'action';

  /** An error worth retrying, at the top of the body; it takes the focus */
  error?: React.ReactNode;

  /** A final outcome: partly done, impossible. Only the exit stays */
  result?: AlertDialogResult;

  /** After this the outcome is uncertain. Defaults to 15000 */
  timeoutMs?: number;

  /** Called when the action took too long: the caller reloads what it shows */
  onTimeout?: () => void;

  /** Where the focus goes if the control that opened it is gone, and after a successful action */
  returnFocus?: { readonly current: HTMLElement | null } | (() => HTMLElement | null);
}

/**
 * Grade 3, always with `consequences`: `confirmText` is the text to type to switch the action on. With
 * it the field needs its label, its hint and its error, so those become required in the labels; an
 * absent label left a field with no name in front of the one destructive action that asks for care.
 */
export type AlertDialogConfirmProps =
  | { confirmText?: undefined; labels: AlertDialogLabels }
  | {
    confirmText: string;
    labels: AlertDialogLabels & {
      readonly confirmField: string;
      readonly confirmHint: (text: string) => React.ReactNode;
      readonly confirmMismatch: (text: string) => React.ReactNode;
    };
  };

export type AlertDialogProps = StrictAlertDialogProps & AlertDialogConfirmProps;


/* --------
 * Helpers
 * -------- */

/** The comparison of the typed text: case, spaces, typographic apostrophes, « », thousands dots */
function normalizeConfirm(text: string, numeric: boolean): string {
  let value = text
    .normalize('NFC')
    .replace(/[’‘]/g, '\'')
    .replace(/[«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase();

  if (numeric) {
    value = value.replace(/\./g, '');
  }

  return value;
}


/* --------
 * Component Definition
 * -------- */

/**
 * The dialog that stops before losing something: deleting a saved item, discarding unsaved work. The
 * Dialog's anatomy at 400px, with no x, a box in the tone of the risk, and two actions: the safe exit,
 * which has the focus, and the destructive one.
 *
 * ```tsx
 * <AlertDialog
 *   open={open} onOpenChange={setOpen}
 *   icon={<Trash2 />}
 *   title={'Delete signal SG-2038?'}
 *   description={'It cannot be recovered.'}
 *   actionLabel={'Delete signal'} onAction={remove}
 *   cancelLabel={'Cancel'}
 *   busy={removing ? 'action' : false}
 *   labels={labels}
 * />
 * ```
 *
 * Three grades: simple, with `consequences`, with `confirmText` to type (the action stays reachable
 * and off until the text matches; Enter or a click on it while off shows the field error). A click
 * outside never closes, and the panel jolts. While the action runs nothing closes; after `timeoutMs`
 * the outcome becomes uncertain and only the exit stays. `result` turns it into an outcome.
 *
 * Parts with a slot: `alert-dialog` (with `data-tone`), `alert-dialog-header`, `alert-dialog-title`,
 * `alert-dialog-description`, `alert-dialog-icon`, `alert-dialog-body`, `alert-dialog-consequences`,
 * `alert-dialog-error`, `alert-dialog-footer`, `alert-dialog-cancel`, `alert-dialog-action`.
 */
export function AlertDialog(props: AlertDialogProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    actionLabel,
    busy = false,
    cancelLabel,
    confirmText,
    consequences,
    description,
    error,
    icon,
    labels,
    onAction,
    onOpenChange,
    onTimeout,
    open,
    result,
    returnFocus,
    timeoutMs = SUBMIT_TIMEOUT,
    title,
    tone = 'destructive'
  } = props;


  // ----
  // Internal Hooks
  // ----
  const descriptionId = React.useId();
  const consequencesId = React.useId();
  const fieldRef = React.useRef<HTMLInputElement>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const errorRef = React.useRef<HTMLDivElement>(null);
  const veilRef = React.useRef<HTMLDivElement>(null);

  const origin = useOrigin(open);
  const [ nudging, nudge ] = useNudge();
  const wait = useOverlayBusy(busy, timeoutMs, onTimeout);

  useFocusWhenSet(error, errorRef);
  useFocusWhenSet(busy === 'action' ? busy : null, veilRef);


  // ----
  // Internal State
  // ----
  const [ typed, setTyped ] = React.useState('');
  const [ mismatch, setMismatch ] = React.useState(false);

  /**
   * Every opening starts with an empty confirmation, adjusted while rendering. Clearing it on close
   * was not enough: the usual close is the page setting `open` to false once the action succeeded,
   * which never goes through `onOpenChange`, so the next opening found the action already armed.
   */
  const [ seenOpen, setSeenOpen ] = React.useState(open);

  if (seenOpen !== open) {
    setSeenOpen(open);

    if (open) {
      setTyped('');
      setMismatch(false);
    }
  }

  const outcome = wait.timedOut ? labels.timeout : result;
  const numeric = confirmText !== undefined && /^[\d.\s]+$/.test(confirmText);
  const matches = confirmText === undefined || normalizeConfirm(typed, numeric) === normalizeConfirm(confirmText, numeric);


  // ----
  // Handlers
  // ----
  const handleOpenChange = (next: boolean): void => {
    /* While the action runs nothing closes; after the timeout the exit is the way out */
    if (!next && busy === 'action' && !wait.timedOut) {
      return;
    }

    onOpenChange(next);
  };

  const runAction = (): void => {
    if (!matches) {
      setMismatch(true);
      fieldRef.current?.focus();
      return;
    }

    onAction();
  };

  const initialFocus = (): HTMLElement | null => (
    confirmText !== undefined && !outcome ? fieldRef.current : cancelRef.current
  );


  // ----
  // Component Render
  // ----
  const hasConsequences = consequences !== null && consequences !== undefined && consequences !== false;
  const hasError = error !== null && error !== undefined && error !== false && error !== '';
  const hasBody = !outcome && (hasConsequences || confirmText !== undefined || hasError);

  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <OverlayFrame
        placement={'dialog'}
        size={'sm'}
        dataSlot={'alert-dialog'}
        dataAttributes={{ 'data-tone': tone }}
        nudging={nudging}
        onVeilPress={nudge}
        initialFocus={initialFocus}
        finalFocus={() => focusTarget(origin.current, returnFocus)}
        aria-describedby={hasConsequences && !outcome ? `${descriptionId} ${consequencesId}` : descriptionId}
      >
        <OverlayHeader
          dataSlot={'alert-dialog'}
          icon={icon}
          iconTone={outcome ? 'warning' : tone}
          title={outcome ? outcome.title : title}
          description={outcome ? outcome.description : description}
          descriptionId={descriptionId}
          inert={wait.inert && busy === 'action'}
          symmetric
        />

        {hasBody && (
          <OverlayBody dataSlot={'alert-dialog'} hasFooter indent inert={wait.inert && busy === 'action'} error={error} errorRef={errorRef}>
            {hasConsequences && (
              <div id={consequencesId} data-slot={'alert-dialog-consequences'} className={'relative min-h-10'} aria-busy={busy === 'load' || undefined}>
                {consequences}
                {busy === 'load' && <BusyVeil visible={wait.visible} label={labels.busyLoad} />}
              </div>
            )}

            {confirmText !== undefined && (
              <Field>
                <Field.Label>{labels.confirmField}</Field.Label>
                <TextInput
                  ref={fieldRef}
                  value={typed}
                  autoComplete={'off'}
                  spellCheck={false}
                  autoCapitalize={'off'}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setTyped(event.currentTarget.value);
                    setMismatch(false);
                  }}
                  onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      runAction();
                    }
                  }}
                />
                <Field.Description>
                  <span aria-live={'polite'}>
                    {matches ? labels.confirmMatch : labels.confirmHint?.(confirmText)}
                  </span>
                </Field.Description>
                <Field.Error>{mismatch ? labels.confirmMismatch?.(confirmText) : null}</Field.Error>
              </Field>
            )}
          </OverlayBody>
        )}

        <OverlayFooter dataSlot={'alert-dialog'} hasBody={hasBody} inert={wait.inert && busy === 'action'}>
          <AlertDialogPrimitive.Close
            render={(
              <Button ref={cancelRef} fill={'solid'} tone={'secondary'} data-slot={'alert-dialog-cancel'}>
                {outcome ? labels.close : cancelLabel}
              </Button>
            )}
          />
          {!outcome && (
            <Button
              fill={'solid'}
              tone={'destructive'}
              data-slot={'alert-dialog-action'}
              aria-disabled={!matches || busy === 'load' || undefined}
              className={cn((!matches || busy === 'load') && 'bg-destructive/50 hover:bg-none active:bg-none')}
              onClick={() => {
                if (busy !== 'load') {
                  runAction();
                }
              }}
            >
              {actionLabel}
            </Button>
          )}
        </OverlayFooter>

        <OverlayVeil ref={veilRef} dataSlot={'alert-dialog'} busy={wait.inert && busy === 'action'} visible={wait.visible && busy === 'action'} label={labels.busyAction} />
      </OverlayFrame>
    </AlertDialogPrimitive.Root>
  );

}

AlertDialog.displayName = 'AlertDialog';
