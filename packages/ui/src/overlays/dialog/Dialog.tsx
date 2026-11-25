'use client';

import * as React from 'react';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { optionalContextBuilder } from '@proedis/react';

import { ClearGlyph } from '../../internal/glyphs';
import { isPresent } from '../../internal/presence';

import { IconButton } from '../../actions/button/IconButton';

import { FormHostContext, useHostedFormState } from '../../forms/field/fieldContext';
import { FormSubmit } from '../../forms/form/Form';

import {
  firstField,
  focusTarget,
  OverlayBody,
  OverlayFooter,
  OverlayFrame,
  OverlayHeader,
  OverlaySectionBlock,
  OverlayVeil,
  SUBMIT_TIMEOUT,
  useFocusOffVeil,
  useFocusWhenSet,
  useNudge,
  useOrigin,
  useOverlayBusy
} from '../overlay-shell/overlayShell';

import { DiscardPrompt, OverlayCancel } from './dialogParts';


import type { ButtonProps } from '../../actions/button/Button';

import type { OverlayBusy, OverlayRadius, OverlaySection, OverlaySize } from '../overlay-shell/overlayShell';


/* --------
 * Types Definition
 * -------- */

export type {
  OverlayBusy as DialogBusy,
  OverlayRadius as DialogRadius,
  OverlaySection as DialogSection,
  OverlaySize as DialogSize
};

export interface DialogLabels {
  /** The name of the x, and its tooltip */
  readonly close: string;

  /** The veil while the data load */
  readonly busyLoad?: string;

  /** The veil while saving */
  readonly busySubmit?: string;

  /** The send error after 15s without an answer */
  readonly timeout?: React.ReactNode;

  /** The name of the index of the sections */
  readonly sections?: string;

  /** The errors of a section, in the name of its item: "2 errors" */
  readonly sectionErrors?: (count: number) => string;
}

/** The texts of the "Discard changes?" prompt that `dirty` opens */
export interface DialogDiscard {
  readonly title: React.ReactNode;
  readonly description: React.ReactNode;
  readonly action: React.ReactNode;
  readonly cancel: React.ReactNode;
  readonly icon: React.ReactNode;
}

export interface StrictDialogProps {
  /** Controlled only */
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** Required. It wraps and never truncates */
  title: React.ReactNode;

  /** The context; in a confirmation, the consequence */
  description?: React.ReactNode;

  /** A 32px box: `primary` to create or act, `muted` to read or choose. Never a status tone */
  icon?: React.ReactNode;
  iconTone?: 'primary' | 'muted';

  /** Between header and body, still while the body scrolls: a search, "Select all" */
  toolbar?: React.ReactNode;

  /** The body. A `Form` inside takes the dialog's id */
  children?: React.ReactNode;

  /** The error summary or the send error, at the top of the body: it takes the focus when it changes */
  error?: React.ReactNode;

  /** The actions on the right: `Dialog.Cancel` and `Dialog.Submit`. None in a detail to read */
  footer?: React.ReactNode;

  /** On the left of the footer: an option ("Create another") or a summary */
  footerStart?: React.ReactNode;

  /** 400, 560, 800px. Defaults to `md` */
  size?: OverlaySize;

  /**
   * The corner. `default` is the theme's `--dialog-radius`, falling back to `--overlay-radius`, the corner
   * Dialog, Drawer and AlertDialog share, then to `lg`. Defaults to `default`
   */
  radius?: OverlayRadius;

  /** With `lg` only, from 3 to 5: an index beside the body. The body uses `Dialog.Section` */
  sections?: readonly OverlaySection[];

  /** `load`: the veil, Esc and the x still close. `submit`: the veil over all, nothing closes */
  busy?: OverlayBusy;

  /** A save with no answer after 15s: the caller cancels the request */
  onSubmitTimeout?: () => void;

  /** Where the focus goes on closing when the control that opened it is gone */
  returnFocus?: { readonly current: HTMLElement | null } | (() => HTMLElement | null);

  labels: DialogLabels;

  className?: string;
}

/**
 * `dirty` and the texts of the prompt it opens. A union so the texts are required as soon as `dirty`
 * can be true: without them the prompt has nothing to say, and `dirty` used to do nothing at all.
 * `dirty={form.isDirty}` with no `discard` does not compile; `dirty={false}`, or none, needs none.
 */
export type DialogDirtyProps =
  | {
    /** The form was changed: the x, Cancel and Esc ask first, a click outside does not close */
    dirty?: false;
    discard?: DialogDiscard;
  }
  | {
    dirty: boolean;

    /** The texts of "Discard changes?", required with `dirty` */
    discard: DialogDiscard;
  };

export type DialogProps = StrictDialogProps & DialogDirtyProps;

interface DialogCloseContextValue {
  requestClose: () => void;
}


/* --------
 * Constants Definition
 * -------- */

const [ DialogCloseContext, useDialogCloseContext ] = optionalContextBuilder<DialogCloseContextValue>('DialogClose', { requestClose: () => undefined });


/* --------
 * Component Definition
 * -------- */

/**
 * A modal panel over a veil, its top edge held 64px from the window so it grows downwards and the
 * title never moves. Header, body and footer with no lines. For a confirmation that loses nothing, a
 * form born from an action of the page, a choice from a long list, a detail with several sections.
 *
 * ```tsx
 * <Dialog
 *   open={open} onOpenChange={setOpen}
 *   title={'New signal'} icon={<Plus />} iconTone={'primary'}
 *   dirty={form.isDirty} discard={discardTexts}
 *   busy={saving ? 'submit' : false}
 *   footer={<React.Fragment><Dialog.Cancel>Cancel</Dialog.Cancel><Dialog.Submit>Create</Dialog.Submit></React.Fragment>}
 *   labels={labels}
 * >
 *   <Form onSubmit={save}>…</Form>
 * </Dialog>
 * ```
 *
 * The x, Cancel and Esc go through one gate: while saving nothing closes, with `dirty` the discard
 * prompt opens first. A click outside closes only a detail (no footer, no changes); otherwise the
 * panel jolts. The focus goes to the first field (the toolbar's, then the body's), or to the primary
 * in a confirmation, or to the body in a detail; never to the x. On closing it goes back to the control that opened it, or to
 * `returnFocus`, or to the title of the page. `busy` makes it inert and shows the veil at once, for at
 * least 400ms. A dialog opened from inside this one sits 120px from the top, over a lighter veil.
 *
 * The dialog renders no `<form>`: a `Form` in the body takes its id, and `Dialog.Submit` in the
 * footer points at it.
 *
 * Parts with a slot: `dialog` (with `data-size`, `data-radius`), `dialog-backdrop`, `dialog-viewport`,
 * `dialog-content`, `dialog-header`, `dialog-icon`, `dialog-heading`, `dialog-title`,
 * `dialog-description`, `dialog-header-end`, `dialog-close`, `dialog-toolbar`, `dialog-index`,
 * `dialog-index-item`, `dialog-index-item-errors`, `dialog-body`, `dialog-scroll`, `dialog-shade`,
 * `dialog-body-content`, `dialog-error`, `dialog-error-message`, `dialog-footer`, `dialog-footer-start`,
 * `dialog-footer-actions`, `dialog-veil`, and `overlay-section` on each `Dialog.Section`.
 */
function DialogRoot(props: DialogProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    busy: busyProp = false,
    children,
    className,
    description,
    dirty: dirtyProp = false,
    discard,
    error,
    footer,
    footerStart,
    icon,
    iconTone,
    labels,
    onOpenChange,
    onSubmitTimeout,
    open,
    returnFocus,
    radius = 'default',
    sections,
    size = 'md',
    title,
    toolbar
  } = props;


  // ----
  // Internal Hooks
  // ----
  const formId = React.useId();
  const popupRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const footerRef = React.useRef<HTMLDivElement>(null);
  const errorRef = React.useRef<HTMLDivElement>(null);
  const veilRef = React.useRef<HTMLDivElement>(null);

  const origin = useOrigin(open);
  const [ nudging, nudge ] = useNudge();

  /*
   * A Form inside reports whether it is being sent and whether it was changed: the overlay waits and
   * asks on its own. A prop of the caller still wins, as `load` does over a form that is sent
   */
  const [ hosted, reportHosted ] = useHostedFormState();
  const busy: OverlayBusy = busyProp === false && hosted.submitting ? 'submit' : busyProp;
  const dirty = dirtyProp || hosted.dirty;

  const wait = useOverlayBusy(busy, SUBMIT_TIMEOUT, onSubmitTimeout);


  // ----
  // Internal State
  // ----
  const [ discarding, setDiscarding ] = React.useState(false);

  const shownError = wait.timedOut ? labels.timeout : error;
  const hasFooter = isPresent(footer);
  const saving = busy === 'submit' && !wait.timedOut;

  useFocusWhenSet(shownError, errorRef);
  useFocusWhenSet(wait.inert ? busy : null, veilRef);


  // ----
  // Handlers
  // ----

  /** The one gate of the x, Cancel and Esc */
  const requestClose = (): void => {
    if (saving) {
      return;
    }

    if (dirty && discard) {
      setDiscarding(true);
      return;
    }

    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean): void => {
    if (next) {
      onOpenChange(true);
      return;
    }

    requestClose();
  };

  const handleVeilPress = (): void => {
    if (!hasFooter && !dirty && !saving) {
      onOpenChange(false);
      return;
    }

    nudge();
  };

  const initialFocus = (): HTMLElement | null => {
    /*
     * Opened while its data load, everything under the veil is inert and refuses the focus, which
     * then stayed on the trigger behind the modal. The veil holds it until the data arrive; the effect
     * below hands it to the first field then.
     */
    if (wait.inert) {
      return veilRef.current;
    }

    const footerButtons = footerRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');

    /* The toolbar comes before the body: a search there is the first field */
    const toolbarElement = popupRef.current?.querySelector<HTMLElement>('[data-slot=dialog-toolbar]') ?? null;

    return firstField(toolbarElement)
      ?? firstField(bodyRef.current)
      ?? (footerButtons && footerButtons.length > 0 ? footerButtons[footerButtons.length - 1] : null)
      ?? bodyRef.current;
  };


  // ----
  // Lifecycle Events
  // ----

  /* The wait ended with the dialog open: the data arrived, or a save kept it open for the next one */
  useFocusOffVeil(wait.inert, veilRef, initialFocus);


  // ----
  // Memoized Data
  // ----
  const formHost = { formId, state: hosted, report: reportHosted, requestClose };


  // ----
  // Component Render
  // ----
  const hasBody = isPresent(children) || isPresent(shownError);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange} modal disablePointerDismissal>
      <DialogCloseContext.Provider value={{ requestClose }}>
        <FormHostContext.Provider value={formHost}>
          <OverlayFrame
            placement={'dialog'}
            size={size}
            corner={'dialog'}
            radius={radius}
            dataSlot={'dialog'}
            popupRef={popupRef}
            nudging={nudging}
            onVeilPress={handleVeilPress}
            initialFocus={initialFocus}
            finalFocus={() => focusTarget(origin.current, returnFocus)}
            className={className}
          >
            <OverlayHeader
              dataSlot={'dialog'}
              icon={icon}
              iconTone={iconTone}
              title={title}
              description={description}
              inert={wait.inert && busy === 'submit'}
              end={(
                <IconButton label={labels.close} icon={<ClearGlyph />} size={'sm'} data-slot={'dialog-close'} onClick={requestClose} />
              )}
            />

            {hasBody && (
              <OverlayBody
                dataSlot={'dialog'}
                bodyRef={bodyRef}
                toolbar={toolbar}
                error={shownError}
                errorRef={errorRef}
                focusable={!hasFooter}
                hasFooter={hasFooter}
                inert={wait.inert}
                sections={size === 'lg' ? sections : undefined}
                sectionsLabel={labels.sections}
                sectionErrors={labels.sectionErrors}
              >
                {children}
              </OverlayBody>
            )}

            {hasFooter && (
              <div ref={footerRef} className={'contents'}>
                <OverlayFooter dataSlot={'dialog'} hasBody={hasBody} start={footerStart} inert={wait.inert}>
                  {footer}
                </OverlayFooter>
              </div>
            )}

            <OverlayVeil
              ref={veilRef}
              dataSlot={'dialog'}
              busy={wait.inert}
              visible={wait.visible}
              label={(busy === 'submit' ? labels.busySubmit : labels.busyLoad) ?? ''}
            />

            {discard && (
              <DiscardPrompt
                discard={discard}
                open={discarding}
                onCancel={() => setDiscarding(false)}
                onConfirm={() => {
                  setDiscarding(false);
                  onOpenChange(false);
                }}
              />
            )}
          </OverlayFrame>
        </FormHostContext.Provider>
      </DialogCloseContext.Provider>
    </DialogPrimitive.Root>
  );

}

DialogRoot.displayName = 'Dialog';


/**
 * The exit next to the primary: the same gate as the x, so `dirty` asks first. The caller's click
 * runs first; a `preventDefault` in it keeps the dialog open
 */
const DialogCancel = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { requestClose } = useDialogCloseContext();

  return <OverlayCancel {...props} ref={ref} onRequest={requestClose} />;
});

DialogCancel.displayName = 'Dialog.Cancel';


/** The section block of the shell, under the name the React tree shows for this component */
function DialogSection(props: React.ComponentProps<typeof OverlaySectionBlock>): React.ReactNode {
  return <OverlaySectionBlock {...props} />;
}

DialogSection.displayName = 'Dialog.Section';


export const Dialog = Object.assign(DialogRoot, {
  /** The submit button of the dialog's form, in its footer */
  Submit : FormSubmit,
  Cancel : DialogCancel,

  /** A titled section of the body, the target of the index */
  Section: DialogSection
});
