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
  fill  : 'soft',
  radius: 'default',
  size  : 'md',
  tone  : 'muted'
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
      /** A `soft` box is its tint and nothing else: no hairline around it */
      fill: {
        solid: '',
        soft : '',
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
       * One number per size, `--icon-box-scale`, and everything follows it: the side (2.5rem times it, the
       * `size-*` step it equals), the glyph (half the side), the corner (`rounded-icon-box`, the radius step
       * times it) and the halo (a quarter and a half of the side). The proportions are the same at every
       * size, which is what a table of hand-picked steps had lost: the glyph went from 58% of the box to
       * 39%, the corner from a third to more than two fifths.
       *
       * The glyph class is skipped when the child already sets its own `size-*`, which is the escape
       * hatch for an icon that has to be optically corrected.
       */
      size: {
        xs   : 'icon-box-scale-xs size-6 [&_svg:not([class*=size-])]:size-3',
        sm   : 'icon-box-scale-sm size-8 [&_svg:not([class*=size-])]:size-4',
        md   : 'icon-box-scale-md size-10 [&_svg:not([class*=size-])]:size-5',
        lg   : 'icon-box-scale-lg size-14 [&_svg:not([class*=size-])]:size-7',
        xl   : 'icon-box-scale-xl size-18 [&_svg:not([class*=size-])]:size-9',
        '2xl': 'icon-box-scale-2xl size-22 [&_svg:not([class*=size-])]:size-11'
      },

      /**
       * The corner, as the step a `md` box would show, scaled with the size. `default` is the theme's
       * (`--icon-box-radius`, `2xl` undeclared); `none` and `full` are absolutes, the same at every size.
       */
      radius: {
        default: 'rounded-icon-box',
        none   : 'rounded-none',
        xs     : 'rounded-icon-box icon-box-corner-xs',
        sm     : 'rounded-icon-box icon-box-corner-sm',
        md     : 'rounded-icon-box icon-box-corner-md',
        lg     : 'rounded-icon-box icon-box-corner-lg',
        xl     : 'rounded-icon-box icon-box-corner-xl',
        '2xl'  : 'rounded-icon-box icon-box-corner-2xl',
        '3xl'  : 'rounded-icon-box icon-box-corner-3xl',
        full   : 'rounded-full'
      }
    },

    /** Every `fill × tone` pair, from the one table the whole package paints tones with */
    compoundVariants: [ ...TONE_COMPOUNDS ],

    defaultVariants: DEFAULT_VARIANTS
  }
);


/**
 * The colour of the halo, per tone: the tone itself, but the ink for `muted` and `secondary`, whose
 * colour is a surface a ring at 15% would not show on.
 */
const HALO: Readonly<Record<Tone, string>> = {
  muted      : 'icon-box-halo-muted-foreground',
  secondary  : 'icon-box-halo-secondary-foreground',
  primary    : 'icon-box-halo-primary',
  success    : 'icon-box-halo-success',
  warning    : 'icon-box-halo-warning',
  destructive: 'icon-box-halo-destructive',
  info       : 'icon-box-halo-info'
};


/* --------
 * Types Definition
 * -------- */
/*
 * Read off the variants rather than written beside them: `IconBoxSize` was written by hand, and `xs`
 * reached the variant without reaching the type an application imports.
 */
export type IconBoxFill = NonNullable<VariantProps<typeof iconBoxVariants>['fill']>;

export type IconBoxSize = NonNullable<VariantProps<typeof iconBoxVariants>['size']>;

export type IconBoxRadius = NonNullable<VariantProps<typeof iconBoxVariants>['radius']>;


export interface StrictIconBoxProps extends BaseProps, VariantProps<typeof iconBoxVariants> {
  /** The icon, as a child. Anything that renders an `svg` */
  children?: React.ReactNode;

  /** Two rings around the box, echoing its tone. For an empty state, not for a header */
  halo?: boolean;
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
 * <IconBox radius={'full'} fill={'plain'}><Check /></IconBox>
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
    radius = DEFAULT_VARIANTS.radius,
    size = DEFAULT_VARIANTS.size,
    tone = DEFAULT_VARIANTS.tone,
    ...others
  } = props as IconBoxProps<'span'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Layout Computation
  // ----

  const classes = cn(
    iconBoxVariants({ fill, radius, size, tone }),
    halo && cn('icon-box-halo', HALO[tone ?? DEFAULT_VARIANTS.tone]),
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
      data-halo={halo || undefined}
      data-radius={radius}
      data-size={size}
      data-tone={tone}
      inline
      direction={'horizontal'}
      align={'center'}
      justify={'center'}
      className={classes}
      {...rest}
    >
      {children}
    </Stack>
  );

}

IconBox.displayName = 'IconBox';
