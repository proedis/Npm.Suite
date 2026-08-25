import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';
import { TONE_COMPOUNDS } from '../core/tone';

import type { BaseProps } from '../core/base';
import type { PolymorphicProps } from '../core/polymorphic';
import type { Tone } from '../core/tone';


/* --------
 * Constants Definition
 * -------- */
const DEFAULT_VARIANTS = {
  fill: 'soft',
  size: 'md',
  tone: 'muted'
} as const;


/* --------
 * Variants Definition
 * -------- */

/**
 * The same three axes as `IconBox`, painted from the same table.
 *
 * `fill × tone` comes from `TONE_COMPOUNDS`, which is why a `success` badge and a `success` icon box
 * are the same green at the same strength. The two reference implementations each carried their own
 * colour table — one of them five sets of CSS custom properties with `color-mix` expressions, the
 * other four hand-written variants — and they do not agree with each other on any of them.
 *
 * ⚠️ `tabular-nums` in the base is not decoration: a badge is where a count lives, and proportional
 * digits make a counter jump by a pixel every time it ticks. One of the references asks for it as
 * `[font-variant-numeric:tabular-nums]`, which is an arbitrary value standing in for a utility that
 * exists.
 *
 * ⚠️ `shrink-0` and `whitespace-nowrap` are what make the badge usable **next to a title**: the title
 * takes the free space and truncates, the badge keeps its size. Without them a long title pushes the
 * badge out of the row, or the badge wraps into two lines.
 */
const badgeVariants = cva(
  cn(
    'inline-flex shrink-0 items-center justify-center rounded-full align-middle',
    'font-medium whitespace-nowrap tabular-nums select-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-3'
  ),
  {
    variants: {
      fill: {
        solid: '',
        soft : '',
        plain: ''
      },

      tone: {
        muted      : '',
        secondary  : '',
        primary    : '',
        success    : '',
        warning    : '',
        destructive: '',
        info       : ''
      } satisfies Record<Tone, string>,

      /** Heights and paddings from the declared scale. The references write 18px, 22px and 28px */
      size: {
        sm: 'h-5 gap-1 px-1.5 text-2xs',
        md: 'h-6 gap-1 px-2 text-xs',
        lg: 'h-7 gap-1.5 px-2.5 text-xs'
      }
    },

    /** Every `fill × tone` pair, from the one table the whole package paints tones with */
    compoundVariants: [ ...TONE_COMPOUNDS ],

    defaultVariants: DEFAULT_VARIANTS
  }
);


/* --------
 * Types Definition
 * -------- */
export interface StrictBadgeProps extends BaseProps, VariantProps<typeof badgeVariants> {
  /** A leading dot in the current ink, for a status that needs no words next to its colour */
  dot?: boolean;
}

export type BadgeProps<E extends React.ElementType = 'span'> = PolymorphicProps<E, StrictBadgeProps>;


/* --------
 * Component Definition
 * -------- */

/**
 * A compact label: a state, a category, a count.
 *
 * ```tsx
 * <Badge>Bozza</Badge>
 * <Badge tone={'warning'} dot>In ritardo</Badge>
 * <Badge tone={'destructive'} fill={'solid'} size={'sm'}>3</Badge>
 * ```
 *
 * Next to a title, which is what it was asked for:
 *
 * ```tsx
 * <Heading>
 *   <Stack direction={'horizontal'} align={'center'} gap={2}>
 *     <Heading.Title lines={1}>FT-234-KL</Heading.Title>
 *     <Badge tone={'warning'}>In ritardo</Badge>
 *   </Stack>
 *   <Heading.Description>Ultimo passaggio 12:04</Heading.Description>
 * </Heading>
 * ```
 *
 * A `Stack` and not a `Cluster`, deliberately: a cluster **wraps**, so a long title would push the
 * badge onto a second line instead of truncating. The title has `min-w-0` and the badge has
 * `shrink-0`, so the pressure lands on the title, which is the one that can absorb it.
 *
 * ## Static by nature
 *
 * ⚠️ A badge communicates, it is not clicked — and both references say so in their own words, then
 * one of them adds a removable `×` button inside it anyway. That is the same trap as an interactive
 * `Item` containing an action: a control inside a label needs the label not to be a control, and it
 * needs a name, a focus ring and a keyboard path of its own. If a chip has to be removable it is a
 * button with a badge in it, and it belongs to whichever package ships buttons.
 *
 * `as={'a'}` is available for a badge that navigates, and then the semantics are the caller's, exactly
 * as with `Item`.
 *
 * ## What is not here, and why
 *
 * `loading` (a badge as a live region), `pulse` (a keyframe this stylesheet does not declare) and
 * `count` / `iconOnly` (a geometry that makes a single digit a circle) all come from the richer of the
 * two references. They are real, and each one needs a decision this package has not had to take yet:
 * a badge that announces, an animation in the contract, a second geometry. `dot` is here because it
 * needs none of the three.
 */
export function Badge<E extends React.ElementType = 'span'>(props: BadgeProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'span',
    children,
    className,
    dot = false,
    fill = DEFAULT_VARIANTS.fill,
    size = DEFAULT_VARIANTS.size,
    tone = DEFAULT_VARIANTS.tone,
    ...others
  } = props as BadgeProps<'span'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Layout Computation
  // ----

  /**
   * A `plain` badge has no surface, so it has no business reserving room for one — and the class that
   * drops the padding is appended **after** the variants rather than declared inside `fill`.
   *
   * ⚠️ Inside one `cva` call the winner of two conflicting variants is the order of the config keys,
   * and `size` comes after `fill`: declared there, `px-0` lost to the size's own `px-1.5` and a plain
   * badge kept a padding it does not want. Caught by a render assertion, since the code reads
   * correctly either way. Same shape as `shape: 'round'` in `IconBox`.
   */
  const classes = cn(
    badgeVariants({ fill, size, tone }),
    fill === 'plain' && 'px-0',
    baseClasses,
    className
  );


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'badge'}
      data-dot={dot || undefined}
      data-fill={fill}
      data-size={size}
      data-tone={tone}
      className={classes}
      {...rest}
    >
      {dot && <span aria-hidden data-slot={'badge-dot'} className={'size-1.5 shrink-0 rounded-full bg-current'} />}
      {children}
    </Component>
  );

}

Badge.displayName = 'Badge';
