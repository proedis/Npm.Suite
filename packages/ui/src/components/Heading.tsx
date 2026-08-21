import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { splitBaseProps } from '../core/base';
import { cn } from '../core/cn';

import type { BaseProps } from '../core/base';
import type { PolymorphicProps } from '../core/polymorphic';
import type { SpacingValue } from '../core/responsive';


/* --------
 * Constants Definition
 * -------- */

/** One source per part, read by `cva` to apply and by the component to report */
const DEFAULT_GAP: SpacingValue = 0.5;

const DEFAULT_TITLE_SIZE = 'md';

const DEFAULT_DESCRIPTION_SIZE = 'sm';

/**
 * The line heights, appended **after** the size rather than declared in the `cva` base.
 *
 * ⚠️ Not a style choice, a correctness one. A Tailwind size carries a line height of its own, so
 * `tailwind-merge` treats `text-base` as conflicting with `leading-*` and drops whichever comes first.
 * With these in the base the emitted class list was `text-foreground text-base font-semibold` — the
 * `leading-tight` gone, silently, and the title rendering at the size's default line height. Caught by
 * a render assertion, not by reading the code. Anything that sets a line height next to a size in this
 * package has to come after it, and `className` still comes after both.
 */
const LINE_HEIGHT_TITLE = 'leading-tight';

const LINE_HEIGHT_DESCRIPTION = 'leading-snug';


/* --------
 * Variants Definition
 * -------- */

/**
 * The title, in four declared steps.
 *
 * Every one is a **named step of Tailwind's scale**, never a length, and that is deliberate: the four
 * reference implementations this comes from write `text-[17px]`, `text-[15px]`, `text-[13px]` and
 * `tracking-[-0.014em]`, which is four typographic decisions that no theme can reach and no reader can
 * find. Naming the step instead means the day a typographic scale lands here, every heading in every
 * application follows it without a single call site changing — exactly how they already follow
 * `--radius-scale`.
 *
 * Weight rises with size because both references do the same thing independently: a small title is
 * `font-semibold`, a large one is `font-bold`. It is not exposed as its own axis until something needs
 * the combination the pair does not offer.
 */
const titleVariants = cva('text-foreground', {
  variants       : {
    lines: {
      1: 'line-clamp-1',
      2: 'line-clamp-2',
      3: 'line-clamp-3'
    },
    size : {
      sm: 'text-sm font-semibold',
      md: 'text-base font-semibold',
      lg: 'text-lg font-semibold',
      xl: 'text-xl font-bold'
    }
  },
  defaultVariants: {
    size: DEFAULT_TITLE_SIZE
  }
});


/**
 * The second line: quieter, smaller, and `text-pretty`.
 *
 * `text-pretty` is the default rather than an option because a description is prose and a single
 * orphan word on the last line is never what anyone wanted. One of the references reaches for it as
 * `[text-wrap:pretty]`, which is the same decision written as an arbitrary value.
 */
const descriptionVariants = cva('text-pretty text-muted-foreground', {
  variants       : {
    lines: {
      1: 'line-clamp-1',
      2: 'line-clamp-2',
      3: 'line-clamp-3'
    },
    size : {
      xs: 'text-2xs',
      sm: 'text-xs',
      md: 'text-sm'
    }
  },
  defaultVariants: {
    size: DEFAULT_DESCRIPTION_SIZE
  }
});


/* --------
 * Types Definition
 * -------- */
export interface StrictHeadingProps extends BaseProps {
  /** Space between the title and the description, in Tailwind spacing steps. Defaults to `0.5` */
  gap?: SpacingValue;
}

export type HeadingProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictHeadingProps>;


export interface StrictHeadingTitleProps extends BaseProps, VariantProps<typeof titleVariants> {}

export type HeadingTitleProps<E extends React.ElementType = 'div'> =
  PolymorphicProps<E, StrictHeadingTitleProps>;


export interface StrictHeadingDescriptionProps extends BaseProps, VariantProps<typeof descriptionVariants> {}

export type HeadingDescriptionProps<E extends React.ElementType = 'div'> =
  PolymorphicProps<E, StrictHeadingDescriptionProps>;


/* --------
 * Parts Definition
 * -------- */

/**
 * The prominent line of the pair.
 *
 * ⚠️ Renders a `div`, **not** an `h3`. The heading level of a title depends on the document outline
 * around it, which this component cannot see: the same card is an `h2` on its own page and an `h3`
 * inside a section. `as={'h2'}` where the outline is known, and nothing where the text is a label
 * rather than a heading — a wrong level is worse for a screen reader than no level at all.
 */
function HeadingTitle<E extends React.ElementType = 'div'>(props: HeadingTitleProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    lines,
    size = DEFAULT_TITLE_SIZE,
    ...others
  } = props as HeadingTitleProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'heading-title'}
      data-lines={lines}
      data-size={size}
      className={cn(titleVariants({ lines, size }), LINE_HEIGHT_TITLE, baseClasses, className)}
      {...rest}
    />
  );

}

HeadingTitle.displayName = 'Heading.Title';


/** The quiet line under it: the unit, the timestamp, where the value comes from */
function HeadingDescription<E extends React.ElementType = 'div'>(
  props: HeadingDescriptionProps<E>
): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    lines,
    size = DEFAULT_DESCRIPTION_SIZE,
    ...others
  } = props as HeadingDescriptionProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'heading-description'}
      data-lines={lines}
      data-size={size}
      className={cn(descriptionVariants({ lines, size }), LINE_HEIGHT_DESCRIPTION, baseClasses, className)}
      {...rest}
    />
  );

}

HeadingDescription.displayName = 'Heading.Description';


/* --------
 * Component Definition
 * -------- */

/**
 * A title with an optional line under it: the typographic pair, and nothing else.
 *
 * ```tsx
 * <Heading>
 *   <Heading.Title>Mezzi in servizio</Heading.Title>
 *   <Heading.Description>Aggiornato 2 minuti fa</Heading.Description>
 * </Heading>
 *
 * <Heading gap={2}>
 *   <Heading.Title size={'xl'}>Nessun risultato</Heading.Title>
 *   <Heading.Description size={'md'} lines={2}>Prova a rimuovere un filtro</Heading.Description>
 * </Heading>
 * ```
 *
 * It exists because the pair is everywhere and the row it usually sits in is not: measured across the
 * two reference frontends, the pair appears in the header of a card, in a list row (as title plus
 * `meta`) and in an empty state — six places — while the *row* arrangement appears in only four of
 * them. An empty state stacks and centres, so it needs the typography without the row. Extracting
 * only the row would have left it re-implementing the type scale, which is exactly what both projects
 * did: one of them carries a per-size table of `text-[17px]` / `text-xl` / `text-2xl` inside its empty
 * state.
 *
 * ## Why each part carries its own `size`
 *
 * A single knob on the pair looks nicer and cannot work here. Sharing it downwards needs either a
 * context, which is client-only and would take the whole tier out of a Server Component, or a
 * descendant class on the parent (`[&>[data-slot=heading-title]]:text-lg`) — and that one is worse
 * than it looks: a descendant selector has more specificity than the child's own utility, so the
 * parent would silently **win** over an explicit `size` on the child. Two explicit props beat one
 * knob that cannot be overridden.
 *
 * ## The `min-w-0`
 *
 * ⚠️ Load-bearing, and the reason `lines` works at all. A flex child refuses to shrink below its
 * content, so without it `line-clamp` never engages and a long title pushes whatever sits next to it
 * out of the container instead of truncating. All four reference implementations carry it, three times
 * per file; here it is the pair's own business and no caller has to remember it.
 */
export function Heading<E extends React.ElementType = 'div'>(props: HeadingProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    gap = DEFAULT_GAP,
    ...others
  } = props as HeadingProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'heading'}
      data-gap={gap}
      className={cn('flex min-w-0 flex-col', `gap-${gap}`, baseClasses, className)}
      {...rest}
    />
  );

}

Heading.displayName = 'Heading';
Heading.Title = HeadingTitle;
Heading.Description = HeadingDescription;
