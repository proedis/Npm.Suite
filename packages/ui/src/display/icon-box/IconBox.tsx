import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';
import { TONE_COMPOUNDS } from '../../core/tone';

import { Stack } from '../../layout/Stack';

import type { BaseProps } from '../../core/base';
import type { PolymorphicProps } from '../../core/polymorphic';
import type { Tone } from '../../core/tone';


/* --------
 * Constants Definition
 * -------- */

/**
 * The resolved defaults, in **one** place, because two things need them: `cva`, to apply them, and
 * the component, to report them as `data-*`. A component cannot report a variant it does not know it
 * has, and `cva` resolves its defaults internally where the caller cannot see them.
 */
const DEFAULT_VARIANTS = {
  fill : 'soft',
  shape: 'square',
  size : 'md',
  tone : 'muted'
} as const;


/* --------
 * Variants Definition
 * -------- */

/**
 * Three axes, and they are deliberately independent: **how** it is filled, **which** tone, **how
 * big**. The fill × tone product comes from `TONE_COMPOUNDS` in `core/tone.ts`, so this component and
 * every other one offering a tone paints it identically; it is enumerated there rather than computed,
 * and that is the one decision worth defending.
 *
 * The alternative both source implementations reached for is an indirection: inject the tone as CSS
 * custom properties (`--ic-c`, `--ic-csoft`, …) and write tone-agnostic classes like
 * `bg-[var(--ic-c)]`. It collapses 21 rows into 5, and this package cannot have it for two reasons.
 * The first is mechanical: `bg-[var(--ic-c)]` is an arbitrary value, which the `proedis/tailwind`
 * ESLint rule fails. The second is worth more: enumerated classes are **greppable and overridable**.
 * `bg-success/10` can be found, read and beaten by a consumer's `className`; `bg-[var(--ic-c)]` can
 * only be beaten by knowing which variable to redeclare and where.
 */
const iconBoxVariants = cva(
  cn(
    'relative shrink-0 select-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0'
  ),
  {
    variants: {
      /** The hairline of the tinted family lives here, so every `soft` tone gets it once */
      fill: {
        solid: '',
        soft : 'ring-1 ring-border ring-inset',
        plain: 'bg-transparent'
      },

      /**
       * The keys are checked against `Tone` with `satisfies`, which is what makes the vocabulary
       * mechanical instead of a convention: add a tone to the union and this file stops compiling
       * until it is handled here and in the compound rows below.
       */
      tone: {
        muted      : '',
        secondary  : '',
        primary    : '',
        success    : '',
        warning    : '',
        destructive: '',
        info       : ''
      } satisfies Record<Tone, string>,

      /**
       * Box side, corner radius and glyph size move together: a 32px box with a 32px radius is a
       * circle by accident, and a 88px box with a 12px radius reads as a panel. The radius comes from
       * the named scale, so it follows `--radius-scale` like everything else.
       *
       * The glyph class is skipped when the child already sets its own `size-*`, which is the escape
       * hatch for an icon that has to be optically corrected.
       */
      size: {
        xs   : 'size-6 rounded-lg [&_svg:not([class*=size-])]:size-3.5',
        sm   : 'size-8 rounded-xl [&_svg:not([class*=size-])]:size-4',
        md   : 'size-10 rounded-2xl [&_svg:not([class*=size-])]:size-5',
        lg   : 'size-14 rounded-3xl [&_svg:not([class*=size-])]:size-6',
        xl   : 'size-18 rounded-3xl [&_svg:not([class*=size-])]:size-7',
        '2xl': 'size-22 rounded-4xl [&_svg:not([class*=size-])]:size-9'
      }
    },

    /** Every `fill × tone` pair, from the one table the whole package paints tones with */
    compoundVariants: [ ...TONE_COMPOUNDS ],

    defaultVariants: DEFAULT_VARIANTS
  }
);


/**
 * The concentric rings, scaled from the box instead of measured against it.
 *
 * Both source implementations compute the halo geometry in pixels from the box side, in an inline
 * style, which is why both had to make the geometry the source of truth and pass it around.
 * `scale-150` / `scale-200` derive the same rings from whatever the box already is, so the halo needs
 * no geometry, no inline style and no per-size table — and it keeps working if the size scale moves.
 */
const haloVariants = cva('pointer-events-none absolute inset-0 -z-10 rounded-full', {
  variants       : {
    ring: {
      inner: 'scale-150 opacity-15',
      outer: 'scale-200 opacity-5'
    },

    /** The ring echoes the tone, not the ink: on a solid fill the glyph is the foreground colour */
    tone: {
      muted      : 'bg-muted-foreground',
      secondary  : 'bg-secondary-foreground',
      primary    : 'bg-primary',
      success    : 'bg-success',
      warning    : 'bg-warning',
      destructive: 'bg-destructive',
      info       : 'bg-info'
    } satisfies Record<Tone, string>
  },
  defaultVariants: {
    tone: 'muted'
  }
});


/* --------
 * Types Definition
 * -------- */
/*
 * Read off the variants rather than written beside them: `IconBoxSize` was written by hand, and `xs`
 * reached the variant without reaching the type an application imports.
 */
export type IconBoxFill = NonNullable<VariantProps<typeof iconBoxVariants>['fill']>;

export type IconBoxSize = NonNullable<VariantProps<typeof iconBoxVariants>['size']>;

export type IconBoxShape = 'square' | 'round';


export interface StrictIconBoxProps extends BaseProps, VariantProps<typeof iconBoxVariants> {
  /** The icon, as a child. Anything that renders an `svg` */
  children?: React.ReactNode;

  /** Two concentric rings behind the box, echoing its tone. For an empty state, not for a header */
  halo?: boolean;

  /** `round` overrides the radius the size would give it. Defaults to `square` */
  shape?: IconBoxShape;
}

export type IconBoxProps<E extends React.ElementType = 'span'> = PolymorphicProps<E, StrictIconBoxProps>;


/* --------
 * Component Definition
 * -------- */

/**
 * A box that frames a single icon.
 *
 * ```tsx
 * <IconBox><Truck /></IconBox>                                  // soft, muted, 40px
 * <IconBox tone={'destructive'} fill={'solid'}><Trash /></IconBox>
 * <IconBox size={'2xl'} tone={'primary'} halo><Inbox /></IconBox>  // an empty state
 * <IconBox shape={'round'} fill={'plain'}><Check /></IconBox>
 * ```
 *
 * ⚠️ **Non-interactive by design**, and both frontends this draws on say the same thing in the same
 * words: no hover, no press, no focus. It is a frame, not a control — a clickable icon is a button
 * with an icon in it, and it needs a focus ring, a pressed state and an accessible name that a frame
 * has no business owning.
 *
 * The icon arrives as a **child**, which is what keeps an icon library out of this package: the box
 * knows how big the glyph should be and nothing about where it came from.
 *
 * No boxless variant, deliberately, though one of the source implementations has it: without a box
 * there is no IconBox, only an icon. `fill={'plain'}` is the closest thing and it keeps the
 * footprint, so a column of rows stays aligned whether or not a row has a surface.
 */
export function IconBox<E extends React.ElementType = 'span'>(props: IconBoxProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'span',
    children,
    className,
    fill = DEFAULT_VARIANTS.fill,
    halo = false,
    shape = DEFAULT_VARIANTS.shape,
    size = DEFAULT_VARIANTS.size,
    tone = DEFAULT_VARIANTS.tone,
    ...others
  } = props as IconBoxProps<'span'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Layout Computation
  // ----

  /**
   * `rounded-full` is appended **after** the variants rather than declared as one, so the override of
   * the size's radius is resolved by `tailwind-merge` on an order this file controls. Inside a single
   * `cva` call the order of two conflicting variants is the order of the config keys, which is a
   * subtlety nobody should have to know to read this.
   */
  const classes = cn(
    iconBoxVariants({ fill, size, tone }),
    shape === 'round' && 'rounded-full',
    baseClasses,
    className
  );


  // ----
  // Component Render
  // ----
  /**
   * Every variant is reported as an attribute, and it is the cheapest theming surface this package
   * has: Tailwind emits its utilities inside `@layer utilities`, so a plain unlayered rule in a
   * consumer's stylesheet beats them — no specificity contest, no `!important`. An application that
   * wants a different `sm` writes one rule and every IconBox in it follows:
   *
   * ```css
   * [data-slot='icon-box'][data-size='sm'] { width: 2.25rem; height: 2.25rem; }
   * ```
   *
   * That is why the values are resolved through `DEFAULT_VARIANTS` rather than forwarded raw: an
   * attribute that disappears when the prop is omitted cannot be targeted, and the default case is
   * the one an application most wants to retune.
   */
  return (
    <Stack
      gap={0}
      as={Component}
      data-slot={'icon-box'}
      data-fill={fill}
      data-shape={shape}
      data-size={size}
      data-tone={tone}
      inline
      direction={'horizontal'}
      align={'center'}
      justify={'center'}
      className={classes}
      {...rest}
    >
      {halo && (
        <React.Fragment>
          <span aria-hidden data-slot={'icon-box-halo'} className={haloVariants({ ring: 'outer', tone })} />
          <span aria-hidden data-slot={'icon-box-halo'} className={haloVariants({ ring: 'inner', tone })} />
        </React.Fragment>
      )}
      {children}
    </Stack>
  );

}

IconBox.displayName = 'IconBox';
