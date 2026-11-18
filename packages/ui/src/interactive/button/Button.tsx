'use client';

import * as React from 'react';

import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva } from 'class-variance-authority';

import { cn } from '../../core/cn';
import { linkProps } from '../../core/link';
import { TONE_COMPOUNDS } from '../../core/tone';

import { Spinner } from '../../components/Spinner';

import type { LinkTarget } from '../../core/link';
import type { Tone, ToneFill } from '../../core/tone';


/* --------
 * Types Definition
 * -------- */

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface StrictButtonProps {
  /**
   * How the tone is painted: `solid` the action you want taken, `soft` the one beside it, `plain` the
   * quiet one. Defaults to `solid`
   */
  fill?: ToneFill;

  /** Which of the seven tones. Defaults to `primary` */
  tone?: Tone;

  /** `sm` in a table row or a filter bar, `md` in forms and bars, `lg` for sign-in and empty states. Defaults to `md` */
  size?: ButtonSize;

  /** An icon before the label, as a node: this package imports no icon library */
  leading?: React.ReactNode;

  /** An icon after the label */
  trailing?: React.ReactNode;

  /** Takes the whole width of its container */
  block?: boolean;

  /**
   * Makes the button a real link to where the application says.
   *
   * It renders an `<a href>`, so the middle click, a new tab and the status bar keep working; a plain
   * click calls `go()`. Disabled or loading, the anchor loses its `href` and is `aria-disabled`.
   */
  to?: LinkTarget;

  children?: React.ReactNode;

  /** Classes for the button itself, last so they win. A string: the state is on `data-*` attributes */
  className?: string;
}

/**
 * `loadingLabel` is required with `loading`: a button that turns into a spinner and says nothing is
 * a button a screen reader user watches stop working.
 */
export type ButtonLoadingProps =
  | { loading?: false; loadingLabel?: string }
  | { loading: true; loadingLabel: string };

export type ButtonProps = StrictButtonProps & ButtonLoadingProps & Omit<
  ButtonPrimitive.Props,
  keyof StrictButtonProps | 'loading' | 'loadingLabel'
>;


/* --------
 * Constants Definition
 * -------- */

const DEFAULT_VARIANTS = {
  block: false,
  fill : 'solid',
  size : 'md',
  tone : 'primary'
} as const;

/** The five tones that are colours rather than surfaces: their solid fill takes the state veil */
const COLOURED_TONES: readonly Tone[] = [ 'primary', 'success', 'warning', 'destructive', 'info' ];

/**
 * A translucent layer over the fill, as a gradient of one colour: it sits on top of the background
 * colour without replacing it, so every tone takes the same two rules. Never on a disabled button.
 */
const VEIL_LAYER = [
  'not-data-disabled:hover:bg-linear-to-b not-data-disabled:hover:from-state-hover not-data-disabled:hover:to-state-hover',
  'not-data-disabled:active:bg-linear-to-b not-data-disabled:active:from-state-pressed not-data-disabled:active:to-state-pressed',
  'data-popup-open:bg-linear-to-b data-popup-open:from-state-pressed data-popup-open:to-state-pressed'
].join(' ');

/** The quiet fills take their own ink as the layer: 8% under the pointer, 16% pressed or open */
const INK_LAYER = [
  'not-data-disabled:hover:bg-linear-to-b not-data-disabled:hover:from-current/8 not-data-disabled:hover:to-current/8',
  'not-data-disabled:active:bg-linear-to-b not-data-disabled:active:from-current/16 not-data-disabled:active:to-current/16',
  'data-popup-open:bg-linear-to-b data-popup-open:from-current/16 data-popup-open:to-current/16'
].join(' ');

/** Between the icon and the label, on the content rather than the button: the spinner is out of the flow */
const CONTENT_GAP: Readonly<Record<ButtonSize, string>> = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-2'
};

/** Which layer each `fill × tone` takes */
const LAYER_COMPOUNDS = ([ 'solid', 'soft', 'plain' ] as const).flatMap((fill) => (
  ([ 'muted', 'secondary', ...COLOURED_TONES ] as Tone[]).map((tone) => ({
    class: fill === 'solid' && COLOURED_TONES.includes(tone) ? VEIL_LAYER : INK_LAYER,
    fill,
    tone
  }))
));


/* --------
 * Variants
 * -------- */

/**
 * The colour of each `fill × tone` comes from `TONE_COMPOUNDS`, the table `Badge` and `IconBox` read:
 * a `success` button and a `success` badge on one screen are the same green. This file owns the
 * geometry, the layers and the focus.
 */
const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md',
    'border border-transparent font-medium whitespace-nowrap select-none',
    'transition-colors duration-100 motion-reduce:transition-none',

    /* A 2px outline 2px away, and a halo of the same colour reaching 3px past it. Keyboard only */
    'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:ring-7',

    /*
     * Disabled stays reachable when Base UI keeps it focusable (loading, icon only): that is when
     * its tooltip explains why. So no `pointer-events-none`, which would swallow the hover too.
     */
    'disabled:cursor-not-allowed disabled:opacity-50 data-disabled:cursor-not-allowed data-disabled:opacity-50',

    '[&_svg]:pointer-events-none [&_svg]:shrink-0'
  ],
  {
    variants: {
      size: {
        sm: [
          'h-control-sm px-2.5 text-xs [&_svg]:size-3.5',
          'has-[[data-slot=button-leading]]:ps-2 has-[[data-slot=button-trailing]]:pe-2'
        ],
        md: [
          'h-control-md min-w-16 px-3 text-sm [&_svg]:size-4',
          'has-[[data-slot=button-leading]]:ps-2.5 has-[[data-slot=button-trailing]]:pe-2.5'
        ],
        lg: [
          'h-control-lg min-w-16 px-4 text-sm [&_svg]:size-4',
          'has-[[data-slot=button-leading]]:ps-3 has-[[data-slot=button-trailing]]:pe-3'
        ]
      },

      block: {
        true : 'w-full',
        false: ''
      },

      fill: { solid: '', soft: '', plain: '' },

      /** The focus follows the tone; amber on white is 2:1, so warning uses its darker ink */
      tone: {
        muted      : 'focus-visible:outline-ring focus-visible:ring-ring/20 not-data-disabled:hover:text-foreground',
        secondary  : 'focus-visible:outline-ring focus-visible:ring-ring/20',
        primary    : 'focus-visible:outline-ring focus-visible:ring-ring/20',
        success    : 'focus-visible:outline-success focus-visible:ring-success/20',
        warning    : 'focus-visible:outline-warning-soft-foreground focus-visible:ring-warning-soft-foreground/20',
        destructive: 'focus-visible:outline-destructive focus-visible:ring-destructive/20',
        info       : 'focus-visible:outline-info focus-visible:ring-info/20'
      }
    },

    compoundVariants: [ ...TONE_COMPOUNDS, ...LAYER_COMPOUNDS ],

    defaultVariants: DEFAULT_VARIANTS
  }
);


/* --------
 * Component Definition
 * -------- */

/**
 * The button: three fills, seven tones, three sizes, flat and borderless.
 *
 * ```tsx
 * <Button leading={<Plus />}>New signal</Button>
 * <Button fill={'soft'} loading loadingLabel={'Saving'}>Save</Button>
 * <Button to={navigation.signals.detail(id)} fill={'plain'}>Open</Button>
 * ```
 *
 * On Base UI's `Button`, which keeps a disabled button focusable when asked (`focusableWhenDisabled`)
 * and announces it as `aria-disabled`. A loading button is exactly that: it keeps the focus, cannot
 * be pressed again, keeps its width (the label stays, transparent, under the spinner) and announces
 * `loadingLabel`. The state "open" comes from `data-popup-open`, which a menu or popover writes on the
 * button that opened it.
 *
 * `type` defaults to `button`, as in Base UI: a submit is said out loud.
 *
 * Parts with a slot: `button` (with `data-fill`, `data-tone`, `data-size`, `data-block`,
 * `data-loading`), `button-content`, `button-leading`, `button-trailing`, `button-spinner`.
 *
 * Not the suite's to enforce, and kept in review by each design system: which fill and tone go where,
 * one solid primary per group, the combinations a product rules out.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    block = DEFAULT_VARIANTS.block,
    children,
    className,
    disabled = false,
    fill = DEFAULT_VARIANTS.fill,
    focusableWhenDisabled,
    leading,
    loading = false,
    loadingLabel,
    size = DEFAULT_VARIANTS.size,
    to,
    tone = DEFAULT_VARIANTS.tone,
    trailing,
    ...rest
  } = props;


  // ----
  // Style Computation
  // ----
  const classes = cn(buttonVariants({ block, fill, size, tone }), className);

  /** A component built on this one names its own part (`text-input-action`); the variants stay reported */
  const ownSlot = (rest as Record<string, unknown>)['data-slot'];

  const dataAttributes = {
    'data-slot'   : typeof ownSlot === 'string' ? ownSlot : 'button',
    'data-fill'   : fill,
    'data-tone'   : tone,
    'data-size'   : size,
    'data-block'  : block || undefined,
    'data-loading': loading || undefined
  };


  // ----
  // Component Render
  // ----
  const content = (
    <React.Fragment>
      <span data-slot={'button-content'} className={cn('inline-flex items-center', CONTENT_GAP[size], loading && 'opacity-0')}>
        {leading !== null && leading !== undefined && (
          <span data-slot={'button-leading'} className={'inline-flex'}>{leading}</span>
        )}
        {children}
        {trailing !== null && trailing !== undefined && (
          <span data-slot={'button-trailing'} className={'inline-flex'}>{trailing}</span>
        )}
      </span>

      {loading && (
        <span data-slot={'button-spinner'} className={'absolute inset-0 inline-flex items-center justify-center'}>
          <Spinner size={'sm'} className={size === 'sm' ? 'size-3.5' : undefined} label={loadingLabel} />
        </span>
      )}
    </React.Fragment>
  );

  /*
   * A link is an anchor, not Base UI's button rendered as one: with a non-native element Base UI
   * writes `role="button"`, and the anchor stops being announced as a link.
   */
  if (to) {
    const inert = disabled || loading;
    const {
      form: _form,
      formAction: _formAction,
      nativeButton: _nativeButton,
      render: _render,
      type: _type,
      value: _value,
      ...anchorProps
    } = rest as typeof rest & { form?: unknown; formAction?: unknown; value?: unknown };

    return (
      <a
        {...(anchorProps as React.ComponentProps<'a'>)}
        {...dataAttributes}
        {...(inert ? { 'aria-disabled': true, 'data-disabled': '', role: 'link' } : linkProps(to))}
        ref={ref as React.Ref<HTMLAnchorElement>}
        aria-busy={loading || undefined}
        className={classes}
      >
        {content}
      </a>
    );
  }

  return (
    <ButtonPrimitive
      {...rest}
      {...dataAttributes}
      ref={ref}
      disabled={disabled || loading}
      focusableWhenDisabled={focusableWhenDisabled ?? loading}
      aria-busy={loading || undefined}
      className={classes}
    >
      {content}
    </ButtonPrimitive>
  );

});

Button.displayName = 'Button';


export { buttonVariants };
