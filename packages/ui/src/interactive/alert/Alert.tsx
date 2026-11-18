'use client';

import * as React from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '../../core/cn';

import { IconBox } from '../../components/IconBox';
import { VisuallyHidden } from '../../components/VisuallyHidden';

import { IconButton } from '../button/IconButton';
import { ClearGlyph } from '../text-input/glyphs';
import { ToneGlyph } from '../tone-glyphs/toneGlyphs';


/* --------
 * Types Definition
 * -------- */

export type AlertSize = 'md' | 'sm';

interface CommonAlertProps {
  /** `md` on the page background, with the shadow; `sm` inside a card, a drawer or a dialog, with the line */
  size?: AlertSize;

  /** The text: the consequence, in one or two sentences */
  children: React.ReactNode;

  /** One Button `secondary` `sm`, the one that solves it. Without the permission to do it, no action: never disabled */
  action?: React.ReactNode;

  /** For an alert that appears after the page opened: it is announced, once */
  live?: boolean;

  className?: string;
}

type DismissProps =
  | { onDismiss?: undefined; dismissLabel?: undefined }
  | {
    /** Called after the focus has moved on to what follows the alert */
    onDismiss: () => void;

    /** The name of the x, and its tooltip */
    dismissLabel: string;
  };

/** `info` and `success` may close, and their title is optional */
type MildAlertProps = CommonAlertProps & DismissProps & {
  tone: 'info' | 'success';
  title?: React.ReactNode;

  /** Read before the title, hidden from sight: "Note" */
  toneLabel?: string;
};

/** `warning` and `destructive` always have a title and a tone label, and go away only once solved */
type SevereAlertProps = CommonAlertProps & {
  tone: 'warning' | 'destructive';
  title: React.ReactNode;
  toneLabel: string;
  onDismiss?: never;
  dismissLabel?: never;
};

export type AlertProps = MildAlertProps | SevereAlertProps;

export type AlertTone = AlertProps['tone'];


/* --------
 * Variants Definition
 * -------- */

const alertVariants = cva(
  [
    '@container flex items-start bg-card text-sm text-foreground',

    /* Transparent until the system draws borders itself: then it becomes the frame */
    'outline-1 -outline-offset-1 outline-transparent'
  ],
  {
    variants: {
      size: {
        md: 'gap-3 rounded-lg border border-transparent px-4 py-3 shadow-sm',
        sm: 'gap-2 rounded-md border border-border p-2'
      },

      /** The two severe tones also say it with the line, at half their ink */
      tone: {
        info       : '',
        success    : '',
        warning    : 'border-warning-soft-foreground/50',
        destructive: 'border-destructive-soft-foreground/50'
      }
    },
    defaultVariants: { size: 'md' }
  }
);

const ICON_BOX: Readonly<Record<AlertSize, { size: 'sm' | 'xs'; className: string }>> = {
  md: { size: 'sm', className: 'rounded-md' },
  sm: { size: 'xs', className: 'rounded-sm' }
};

/** The first line of text centred on the box: (32 - 20) / 2 and (24 - 20) / 2 */
const TEXT_OFFSET: Readonly<Record<AlertSize, string>> = {
  md: 'pt-1.5',
  sm: 'pt-0.5'
};


/* --------
 * Helpers
 * -------- */

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The first element that takes the focus after `root` in the page, or the `main` */
function focusAfter(root: HTMLElement): void {
  const next = Array.from(root.ownerDocument.querySelectorAll<HTMLElement>(FOCUSABLE)).find((element) => (
    !root.contains(element)
    && (root.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0 // eslint-disable-line no-bitwise -- a position mask
    && element.getClientRects().length > 0
  ));

  if (next) {
    next.focus();
    return;
  }

  const main = root.ownerDocument.querySelector<HTMLElement>('main');

  if (main) {
    if (!main.hasAttribute('tabindex')) {
      main.setAttribute('tabindex', '-1');
    }

    main.focus();
  }
}


/* --------
 * Component Definition
 * -------- */

/**
 * The page alert: a white card like the others, with a coloured box for the icon. It says a state that
 * lasts, of the record or the page, and what to do: "Signal closed · Reopen". Four tones, two sizes.
 *
 * ```tsx
 * <Alert tone={'warning'} toneLabel={'Warning'} title={'Container with no contract'} action={<Button …>Assign</Button>}>
 *   It is not emptied until it is assigned.
 * </Alert>
 * ```
 *
 * The tone is in the box and, for `warning` and `destructive`, in the line too; the text stays black
 * and grey. Only `info` and `success` close, and before `onDismiss` the focus moves to the first
 * element that follows, or to the `main`. The surface is not interactive: only the action and the x.
 *
 * An alert known when the page opens renders with it and has no role. One that appears later takes
 * `live`: the region mounts empty, then its content, so it is read once (`status`, `alert` for
 * `destructive`). `toneLabel` is read before the title. Under a 448px container the action goes under
 * the text.
 *
 * Parts with a slot: `alert` (with `data-tone`, `data-size`), `alert-icon`, `alert-body`,
 * `alert-title`, `alert-text`, `alert-action`, `alert-dismiss`.
 */
export function Alert(props: AlertProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    action,
    children,
    className,
    dismissLabel,
    live = false,
    onDismiss,
    size = 'md',
    title,
    tone,
    toneLabel
  } = props;


  // ----
  // Internal Hooks
  // ----
  const rootRef = React.useRef<HTMLDivElement>(null);


  // ----
  // Internal State
  // ----

  /* A live region born full is not read: it mounts empty for a moment */
  const [ filled, setFilled ] = React.useState(!live);


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => {
    if (filled) {
      return undefined;
    }

    /* A timer rather than a frame: frames stop in a background tab, and the alert would stay empty */
    const timer = window.setTimeout(() => setFilled(true), 50);

    return () => window.clearTimeout(timer);
  }, [ filled ]);


  // ----
  // Handlers
  // ----
  const handleDismiss = (): void => {
    if (rootRef.current) {
      focusAfter(rootRef.current);
    }

    onDismiss?.();
  };


  // ----
  // Component Render
  // ----
  const hasTitle = title !== null && title !== undefined && title !== false && title !== '';
  const role = live ? (tone === 'destructive' ? 'alert' : 'status') : undefined;
  const box = ICON_BOX[size];

  return (
    <div
      ref={rootRef}
      role={role}
      data-slot={'alert'}
      data-tone={tone}
      data-size={size}
      className={cn(alertVariants({ size, tone }), className)}
    >
      {filled && (
        <React.Fragment>
          <IconBox data-slot={'alert-icon'} size={box.size} fill={'soft'} tone={tone} className={box.className}>
            <ToneGlyph tone={tone} />
          </IconBox>

          <div data-slot={'alert-body'} className={'flex min-w-0 flex-1 flex-col gap-2 @md:flex-row @md:items-start @md:gap-3'}>
            <div className={cn('min-w-0 flex-1 max-w-prose wrap-anywhere', TEXT_OFFSET[size])}>
              {hasTitle && (
                <div data-slot={'alert-title'} className={'font-semibold text-foreground'}>
                  {toneLabel && <VisuallyHidden>{`${toneLabel}: `}</VisuallyHidden>}
                  {title}
                </div>
              )}
              <div data-slot={'alert-text'} className={hasTitle ? 'text-muted-foreground' : 'text-foreground'}>
                {!hasTitle && toneLabel && <VisuallyHidden>{`${toneLabel}: `}</VisuallyHidden>}
                {children}
              </div>
            </div>

            {action !== null && action !== undefined && (
              <div data-slot={'alert-action'} className={cn('flex shrink-0 @md:ms-auto', size === 'md' ? '@md:mt-0.5' : '@md:-my-0.5')}>
                {action}
              </div>
            )}
          </div>

          {onDismiss && dismissLabel && (
            <IconButton
              label={dismissLabel}
              icon={<ClearGlyph />}
              size={'sm'}
              data-slot={'alert-dismiss'}
              className={cn('-me-1', size === 'md' ? '-ms-2 mt-0.5' : '-my-0.5 -ms-1')}
              onClick={handleDismiss}
            />
          )}
        </React.Fragment>
      )}
    </div>
  );

}

Alert.displayName = 'Alert';


export { alertVariants };
