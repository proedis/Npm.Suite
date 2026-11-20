import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';
import { TONE_COMPOUNDS } from '../../core/tone';

import { Stack } from '../../layout/Stack';

import type { BaseProps } from '../../core/base';
import type { PolymorphicProps } from '../../core/polymorphic';
import type { SpacingValue } from '../../core/responsive';
import type { Tone } from '../../core/tone';


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
    'max-w-full min-w-0 shrink-0 rounded-full align-middle',
    'font-medium whitespace-nowrap tabular-nums select-none',

    /*
     * Printed, a soft badge is white with a line in its ink (browsers drop backgrounds by default),
     * a solid one keeps its fill. With forced colours the fills vanish and a 1px frame stays.
     */
    'print:data-[fill=soft]:bg-transparent print:data-[fill=soft]:inset-ring print:data-[fill=soft]:inset-ring-current',
    'print:data-[fill=solid]:print-exact',
    'forced-colors:border forced-colors:border-solid',
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
        sm: 'h-5 px-1.5 text-2xs',
        md: 'h-6 px-2 text-xs',
        lg: 'h-7 px-2.5 text-xs'
      }
    },

    /** Every `fill × tone` pair, from the one table the whole package paints tones with */
    compoundVariants: [ ...TONE_COMPOUNDS ],

    defaultVariants: DEFAULT_VARIANTS
  }
);


/** The room between the dot, an icon and the label, per size: the row itself is a Stack */
const GAP: Readonly<Record<NonNullable<VariantProps<typeof badgeVariants>['size']>, SpacingValue>> = {
  sm: 1,
  md: 1,
  lg: 1.5
};


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
 * ## Long text
 *
 * The badge is at most as wide as its container, and a text label truncates with an ellipsis while
 * the dot stays: a safety net, not a layout. A truncated badge is a column too narrow. Children that
 * are not text (an icon and a word) are left as they are.
 *
 * ## What is not here, and why
 *
 * `loading` (a badge as a live region) and `pulse` (a keyframe this stylesheet does not declare) come
 * from the richer of the two references, and each needs a decision this package has not had to take
 * yet. A count over an icon button is not a badge: it is `BadgeCounter`, next door.
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
    <Stack
      as={Component}
      data-slot={'badge'}
      data-dot={dot || undefined}
      data-fill={fill}
      data-size={size}
      data-tone={tone}
      inline
      direction={'horizontal'}
      align={'center'}
      justify={'center'}
      gap={GAP[size ?? DEFAULT_VARIANTS.size]}
      className={classes}
      {...rest}
    >
      {dot && <span aria-hidden data-slot={'badge-dot'} className={'size-1.5 shrink-0 rounded-full bg-current'} />}
      {typeof children === 'string' || typeof children === 'number'
        ? <span data-slot={'badge-label'} className={'min-w-0 truncate'}>{children}</span>
        : children}
    </Stack>
  );

}

Badge.displayName = 'Badge';
