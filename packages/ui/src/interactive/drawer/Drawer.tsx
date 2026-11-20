'use client';

import * as React from 'react';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { optionalContextBuilder } from '@proedis/react';

import { IconButton } from '../button/IconButton';
import { DiscardPrompt, OverlayCancel } from '../dialog/dialogParts';
import { FormHostContext } from '../field/fieldContext';
import { FormSubmit } from '../form/Form';
import {
  firstField,
  focusTarget,
  OverlayBody,
  OverlayFooter,
  OverlayFrame,
  OverlayHeader,
  OverlaySectionBlock,
  OverlayStatus,
  OverlayVeil,
  SUBMIT_TIMEOUT,
  useFocusWhenSet,
  useNudge,
  useOrigin,
  useOverlayBusy
} from '../overlay-shell/overlayShell';
import { isPresent } from '../presence/presence';
import { ClearGlyph } from '../text-input/glyphs';

import type { ButtonProps } from '../button/Button';
import type { DialogDiscard, DialogLabels } from '../dialog/Dialog';
import type { OverlayBusy, OverlaySection, OverlaySize } from '../overlay-shell/overlayShell';

export type { OverlayBusy as DrawerBusy, OverlaySection as DrawerSection, OverlaySize as DrawerSize };


/* --------
 * Types Definition
 * -------- */

export interface DrawerLabels extends DialogLabels {
  /** Names and tooltips of the arrows of a detail */
  readonly previous?: string;
  readonly next?: string;
}

export interface StrictDrawerProps {
  /** Controlled only: the caller ties it to the URL of the list */
  open: boolean;
  onOpenChange: (open: boolean) => void;

  /** `detail` to read, `form` to edit or create. Defaults to `detail` */
  mode?: 'detail' | 'form';

  /** With the identifier the list shows in its first column. It wraps and never truncates */
  title: React.ReactNode;

  /** The state and context that are not in the body. The same while editing */
  description?: React.ReactNode;

  icon?: React.ReactNode;
  iconTone?: 'primary' | 'muted';

  toolbar?: React.ReactNode;
  children?: React.ReactNode;

  /** With `lg` only, from 3 to 5. Never with tabs */
  sections?: readonly OverlaySection[];

  /** Detail: "Edit [object]" on the right. Form: `Drawer.Cancel` and `Drawer.Submit` */
  footer?: React.ReactNode;

  /** Detail: the "More actions" menu. Form: "Create another" */
  footerStart?: React.ReactNode;

  /** A form opened from the detail: Cancel and Esc call it instead of closing */
  onBack?: () => void;

  /** "2 of 5", written by the caller */
  position?: React.ReactNode;

  error?: React.ReactNode;

  /** 400, 560, 800px. Defaults to `md`; the same for detail and edit */
  size?: OverlaySize;

  dirty?: boolean;
  discard?: DialogDiscard;

  busy?: OverlayBusy;
  onSubmitTimeout?: () => void;

  /** Where the focus goes if the row of the item is gone */
  returnFocus?: { readonly current: HTMLElement | null } | (() => HTMLElement | null);

  className?: string;
}

/**
 * The previous and next item of the filtered list, in detail; without, no arrows. With them, the
 * arrows are icon buttons and need their names: `previous` and `next` become required in the labels,
 * where an absent one left a button named by an empty string.
 */
export type DrawerNavigationProps =
  | { onPrevious?: undefined; onNext?: undefined; labels: DrawerLabels }
  | {
    onPrevious?: () => void;
    onNext?: () => void;
    labels: DrawerLabels & { readonly previous: string; readonly next: string };
  };

export type DrawerProps = StrictDrawerProps & DrawerNavigationProps;

type PendingMove = 'close' | 'back' | 'previous' | 'next';

interface DrawerGateValue {
  requestCancel: () => void;
}


/* --------
 * Constants Definition
 * -------- */

const [ DrawerGateContext, useDrawerGateContext ] = optionalContextBuilder<DrawerGateValue>('DrawerGate', { requestCancel: () => undefined });


/* --------
 * Glyphs
 * -------- */

function ArrowGlyph(props: { up?: boolean }): React.ReactNode {
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
      <path d={props.up ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
    </svg>
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * A modal panel on the right, over a veil, the full height of the window, 8px from its edges and
 * rounded on every corner. The Dialog's anatomy with no lines. For an item of a list: its detail, its
 * edit in the same panel, the creation with many fields. It moves from one item to the next without
 * closing.
 *
 * ```tsx
 * <Drawer
 *   open={Boolean(id)} onOpenChange={(open) => !open && navigation.list().go()}
 *   title={signal.code} description={'Omegna · Open'}
 *   onPrevious={previous} onNext={next} position={'2 of 5'}
 *   footer={<Button fill={'soft'} onClick={edit}>Edit signal</Button>}
 *   labels={labels}
 * >
 *   …
 * </Drawer>
 * ```
 *
 * In a detail the focus goes to the body, which scrolls with the keyboard; Alt ↑ and Alt ↓ move to the
 * previous and next item. In a form it goes to the first field, and Cancel and Esc go back to the
 * detail (`onBack`) when there is one, through the discard prompt when `dirty`. The x always closes the
 * whole panel. A click on the veil closes a detail; on a form the panel jolts left. A changed title is
 * announced. While open it writes the room it takes on the right as `--drawer-inset` on the document,
 * for the toasts to stand on its left.
 *
 * On Base UI's `Dialog`, not its `Drawer`, which drags by default, even with the mouse.
 *
 * Parts with a slot: `drawer` (with `data-size`, `data-mode`), and the same parts as `dialog` with
 * the `drawer-` prefix, plus `drawer-previous`, `drawer-next`, `drawer-position`.
 */
function DrawerRoot(props: DrawerProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    busy = false,
    children,
    className,
    description,
    dirty = false,
    discard,
    error,
    footer,
    footerStart,
    icon,
    iconTone,
    labels,
    mode = 'detail',
    onBack,
    onNext,
    onOpenChange,
    onPrevious,
    onSubmitTimeout,
    open,
    position,
    returnFocus,
    sections,
    size = 'md',
    title,
    toolbar
  } = props;


  // ----
  // Internal Hooks
  // ----
  const formId = React.useId();
  const [ popup, setPopup ] = React.useState<HTMLDivElement | null>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const errorRef = React.useRef<HTMLDivElement>(null);
  const veilRef = React.useRef<HTMLDivElement>(null);

  const origin = useOrigin(open);
  const [ nudging, nudge ] = useNudge();
  const wait = useOverlayBusy(busy, SUBMIT_TIMEOUT, onSubmitTimeout);


  // ----
  // Internal State
  // ----
  const [ pending, setPending ] = React.useState<PendingMove | null>(null);

  /* A new item or a new mode is announced: the key changes, the status region takes the title */
  const viewKey = `${mode}|${typeof position === 'string' ? position : ''}`;
  const [ seenKey, setSeenKey ] = React.useState(viewKey);
  const [ announce, setAnnounce ] = React.useState(false);

  if (seenKey !== viewKey) {
    setSeenKey(viewKey);
    setAnnounce(true);
  }

  const shownError = wait.timedOut ? labels.timeout : error;
  const hasFooter = isPresent(footer);
  const saving = busy === 'submit' && !wait.timedOut;
  const isDetail = mode === 'detail';

  useFocusWhenSet(shownError, errorRef);
  useFocusWhenSet(wait.inert ? busy : null, veilRef);


  // ----
  // Handlers
  // ----
  const perform = (move: PendingMove): void => {
    switch (move) {
      case 'back':
        onBack?.();
        break;
      case 'previous':
        onPrevious?.();
        break;
      case 'next':
        onNext?.();
        break;
      default:
        onOpenChange(false);
    }
  };

  /** Every way out passes here: nothing while saving, the discard prompt first with changes */
  const request = (move: PendingMove): void => {
    if (saving) {
      return;
    }

    if (dirty && discard) {
      setPending(move);
      return;
    }

    perform(move);
  };

  /** Esc and Cancel: back to the detail when the form came from it, otherwise close */
  const requestCancel = (): void => request(!isDetail && onBack ? 'back' : 'close');

  const handleOpenChange = (next: boolean): void => {
    if (next) {
      onOpenChange(true);
      return;
    }

    requestCancel();
  };

  const handleVeilPress = (): void => {
    if (isDetail && !dirty && !saving) {
      onOpenChange(false);
      return;
    }

    nudge();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (!isDetail || !event.altKey || wait.inert) {
      return;
    }

    if (event.key === 'ArrowUp' && onPrevious) {
      event.preventDefault();
      request('previous');
    }
    else if (event.key === 'ArrowDown' && onNext) {
      event.preventDefault();
      request('next');
    }
  };

  const initialFocus = (): HTMLElement | null => (isDetail ? bodyRef.current : firstField(bodyRef.current) ?? bodyRef.current);


  // ----
  // Lifecycle Events
  // ----

  /* The room the panel takes on the right, for the toasts: on the document, since they live in another portal */
  React.useEffect(() => {
    if (!popup) {
      return undefined;
    }

    const root = document.documentElement;

    const measure = (): void => {
      /* The layout position, not the painted one: while it slides in the panel is still translated */
      root.style.setProperty('--drawer-inset', `${Math.max(0, window.innerWidth - popup.offsetLeft)}px`);
    };

    const observer = new ResizeObserver(measure);

    observer.observe(popup);
    window.addEventListener('resize', measure);
    measure();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      root.style.removeProperty('--drawer-inset');
    };
  }, [ popup ]);

  /* Into the form, the focus goes to the first field; back to the detail, to its main action ("Edit") */
  const shownModeRef = React.useRef(mode);

  React.useEffect(() => {
    if (shownModeRef.current !== mode && open) {
      const actions = popup?.querySelectorAll<HTMLElement>('[data-slot=drawer-footer] button:not([disabled])');
      const main = isDetail && actions && actions.length > 0 ? actions[actions.length - 1] : null;

      (main ?? initialFocus())?.focus();
    }

    shownModeRef.current = mode;
  });


  // ----
  // Memoized Data
  // ----
  const formHost = React.useMemo(() => ({ formId }), [ formId ]);


  // ----
  // Component Render
  // ----
  const hasBody = isPresent(children) || isPresent(shownError);

  const navigation = isDetail && (onPrevious || onNext)
    ? (
      <React.Fragment>
        {position !== null && position !== undefined && (
          <span data-slot={'drawer-position'} className={'px-1 text-xs text-muted-foreground'}>{position}</span>
        )}
        <IconButton
          label={labels.previous ?? ''}
          icon={<ArrowGlyph up />}
          size={'sm'}
          disabled={!onPrevious}
          data-slot={'drawer-previous'}
          onClick={() => request('previous')}
        />
        <IconButton
          label={labels.next ?? ''}
          icon={<ArrowGlyph />}
          size={'sm'}
          disabled={!onNext}
          data-slot={'drawer-next'}
          onClick={() => request('next')}
        />
      </React.Fragment>
    )
    : null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange} modal disablePointerDismissal>
      <DrawerGateContext.Provider value={{ requestCancel }}>
        <FormHostContext.Provider value={formHost}>
          <OverlayFrame
            placement={'drawer'}
            size={size}
            dataSlot={'drawer'}
            dataAttributes={{ 'data-mode': mode }}
            popupRef={setPopup}
            nudging={nudging}
            onVeilPress={handleVeilPress}
            onKeyDown={handleKeyDown}
            initialFocus={initialFocus}
            finalFocus={() => focusTarget(origin.current, returnFocus)}
            className={className}
          >
            <OverlayHeader
              dataSlot={'drawer'}
              icon={icon}
              iconTone={iconTone}
              title={title}
              description={description}
              inert={wait.inert && busy === 'submit'}
              end={(
                <React.Fragment>
                  {navigation}
                  <IconButton label={labels.close} icon={<ClearGlyph />} size={'sm'} data-slot={'drawer-close'} onClick={() => request('close')} />
                </React.Fragment>
              )}
            />

            <OverlayStatus>{announce ? title : null}</OverlayStatus>

            {hasBody && (
              <OverlayBody
                dataSlot={'drawer'}
                bodyRef={bodyRef}
                toolbar={toolbar}
                error={shownError}
                errorRef={errorRef}
                focusable={isDetail}
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
              <OverlayFooter dataSlot={'drawer'} hasBody={hasBody} start={footerStart} inert={wait.inert}>
                {footer}
              </OverlayFooter>
            )}

            <OverlayVeil
              ref={veilRef}
              dataSlot={'drawer'}
              busy={wait.inert}
              visible={wait.visible}
              label={(busy === 'submit' ? labels.busySubmit : labels.busyLoad) ?? ''}
            />

            {discard && (
              <DiscardPrompt
                discard={discard}
                open={pending !== null}
                onCancel={() => setPending(null)}
                onConfirm={() => {
                  const move = pending;

                  setPending(null);

                  if (move) {
                    perform(move);
                  }
                }}
              />
            )}
          </OverlayFrame>
        </FormHostContext.Provider>
      </DrawerGateContext.Provider>
    </DialogPrimitive.Root>
  );

}

DrawerRoot.displayName = 'Drawer';


/**
 * Cancel in a form: back to the detail when there is one, through the discard prompt when changed.
 * The caller's click runs first; a `preventDefault` in it keeps the drawer open
 */
const DrawerCancel = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { requestCancel } = useDrawerGateContext();

  return <OverlayCancel {...props} ref={ref} onRequest={requestCancel} />;
});

DrawerCancel.displayName = 'Drawer.Cancel';


/** The section block of the shell, under the name the React tree shows for this component */
function DrawerSection(props: React.ComponentProps<typeof OverlaySectionBlock>): React.ReactNode {
  return <OverlaySectionBlock {...props} />;
}

DrawerSection.displayName = 'Drawer.Section';


export const Drawer = Object.assign(DrawerRoot, {
  Submit : FormSubmit,
  Cancel : DrawerCancel,
  Section: DrawerSection
});
