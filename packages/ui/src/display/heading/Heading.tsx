import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { DEFAULT_GAP_CLASS } from '../../layout/defaultGap';
import { Stack } from '../../layout/Stack';

import type { BaseProps } from '../../core/base';
import type { PolymorphicProps } from '../../core/polymorphic';
import type { Spacing } from '../../core/responsive';


/* --------
 * Constants Definition
 * -------- */

/** One source, read to apply the size and to report it */
const DEFAULT_SIZE = 'sm';

/**
 * The size of the three texts, set once on the root: each `heading-size-*` declares the eyebrow, the title
 * and the description in proportion (`theme.css`), and every part reads its own line of it through
 * `text-heading-*`.
 *
 * | size | eyebrow | title | description |
 * | --- | --- | --- | --- |
 * | `sm` | `2xs` | `sm`, semibold | `xs` |
 * | `md` | `2xs` | `base`, semibold | `sm` |
 * | `lg` | `xs` | `lg`, semibold | `sm` |
 * | `xl` | `xs` | `xl`, bold | `base` |
 */
const SIZE = {
  sm: 'heading-size-sm',
  md: 'heading-size-md',
  lg: 'heading-size-lg',
  xl: 'heading-size-xl'
} as const;

/**
 * The line heights, appended **after** the size rather than declared with it.
 *
 * ⚠️ Not a style choice, a correctness one. A Tailwind size carries a line height of its own, so
 * `tailwind-merge` treats a `text-*` size as conflicting with `leading-*` and drops whichever comes first.
 * With these first the title rendered at the size's default line height, silently. Caught by a render
 * assertion, not by reading the code. Anything that sets a line height next to a size in this package
 * has to come after it, and `className` still comes after both.
 */
const LINE_HEIGHT_TITLE = 'leading-tight';

const LINE_HEIGHT_DESCRIPTION = 'leading-snug';

const LINES = {
  1: 'line-clamp-1',
  2: 'line-clamp-2',
  3: 'line-clamp-3'
} as const;


/* --------
 * Variants Definition
 * -------- */

/**
 * The title. Its size and weight are the root's (`text-heading-title`, `font-heading-title`), every one a
 * **named step of Tailwind's scale**, never a length: the reference implementations wrote `text-[17px]`,
 * `text-[15px]` and `tracking-[-0.014em]`, typographic decisions no theme can reach. Weight rises with size
 * because both references do the same independently: semibold up to `lg`, bold at `xl`.
 *
 * `min-w-0` so the title is the element that absorbs the pressure when something sits beside it: a
 * `Badge`, a count, an icon. A flex child refuses to shrink below its content without it.
 */
const titleVariants = cva('min-w-0 font-heading text-heading-title font-heading-title text-foreground', {
  variants: { lines: LINES }
});


/**
 * The second line: quieter, smaller, and `text-pretty`, since a description is prose and a single orphan
 * word on the last line is never what anyone wanted.
 */
const descriptionVariants = cva('text-heading-description text-pretty text-muted-foreground', {
  variants: { lines: LINES }
});


/**
 * The eyebrow: the small uppercase line **above** the title. It reads as an eyebrow because of the case and
 * the tracking, not because of the size.
 *
 * ⚠️ Muted, not coloured. One reference tints it `text-primary` and the other mutes it, and a tinted
 * eyebrow is a product decision rather than a semantic: `className={'text-primary'}` is one class away.
 */
const eyebrowVariants = cva('text-heading-eyebrow font-medium tracking-wider text-muted-foreground uppercase', {
  variants: { lines: LINES }
});


/* --------
 * Types Definition
 * -------- */
export type HeadingSize = keyof typeof SIZE;

export interface StrictHeadingProps extends BaseProps {
  /**
   * The size of the eyebrow, the title and the description together, in proportion: `sm` is a list row,
   * `lg` the header of a card, `xl` an empty state. Defaults to `sm`
   */
  size?: HeadingSize;

  /**
   * Space between the title and the description: a step of the spacing scale by name, or a Tailwind
   * spacing step by number. Defaults to `0.5`, moved by the theme with `--heading-gap`
   */
  gap?: Spacing;
}

export type HeadingProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictHeadingProps>;


export interface StrictHeadingEyebrowProps extends BaseProps, VariantProps<typeof eyebrowVariants> {}

export type HeadingEyebrowProps<E extends React.ElementType = 'div'> =
  PolymorphicProps<E, StrictHeadingEyebrowProps>;


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
 * The line above the title: a category, a status, a section name.
 *
 * ⚠️ It is not a heading and must not be an `h*`: it labels the title that follows, which means a
 * screen reader that met it as a heading would announce the wrong outline. It is also the register
 * `Label` covers when the text labels a **control** rather than a title — same size, different job,
 * and the difference is whether there is a `for` to point at.
 */
function HeadingEyebrow<E extends React.ElementType = 'div'>(
  props: HeadingEyebrowProps<E>
): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    lines,
    ...others
  } = props as HeadingEyebrowProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'heading-eyebrow'}
      data-lines={lines}
      className={cn(eyebrowVariants({ lines }), baseClasses, className)}
      {...rest}
    />
  );

}

HeadingEyebrow.displayName = 'Heading.Eyebrow';


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
      className={cn(titleVariants({ lines }), LINE_HEIGHT_TITLE, baseClasses, className)}
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
      className={cn(descriptionVariants({ lines }), LINE_HEIGHT_DESCRIPTION, baseClasses, className)}
      {...rest}
    />
  );

}

HeadingDescription.displayName = 'Heading.Description';


/* --------
 * Component Definition
 * -------- */

/**
 * A title, with an optional line above it and an optional line under it: the three text registers
 * every row and every header is made of, and nothing else.
 *
 * ```tsx
 * <Heading>                                              // a list row: the default register
 *   <Heading.Eyebrow>In servizio</Heading.Eyebrow>
 *   <Heading.Title>FT-234-KL</Heading.Title>
 *   <Heading.Description>Ultimo passaggio 12:04</Heading.Description>
 * </Heading>
 *
 * <Heading size={'lg'}>                                  // the header of a card
 *   <Heading.Title>Mezzi in servizio</Heading.Title>
 *   <Heading.Description>Aggiornato 2 minuti fa</Heading.Description>
 * </Heading>
 * ```
 *
 * ## One size for the three
 *
 * `size` is the root's, and it moves the eyebrow, the title and the description together, in proportion:
 * a larger title with the description of a list row is a heading out of scale, and that is what a size per
 * part allowed. The default is `sm` because a list row is by far the most frequent place.
 *
 * It travels as variables, not as a context nor as a descendant class: a context is client-only and would
 * take the tier out of a Server Component, and a class on the parent (`[&>[data-slot=heading-title]]:text-lg`)
 * has more specificity than the part's own utility, so a `className` on the part would lose. The root sets
 * `--heading-title-size` & co. (`heading-size-*`), each part reads its own through a `text-*` utility, and a
 * `className={'text-2xl'}` on a part replaces it like any other size. A stylesheet retunes one size for every
 * heading with `[data-slot='heading'][data-size='lg'] { --heading-title-size: … }`.
 *
 * ## The `min-w-0`
 *
 * ⚠️ Load-bearing, and the reason `lines` works at all. A flex child refuses to shrink below its
 * content, so without it `line-clamp` never engages and a long title pushes whatever sits next to it
 * out of the container instead of truncating.
 */
export function Heading<E extends React.ElementType = 'div'>(props: HeadingProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    gap,
    size = DEFAULT_SIZE,
    ...others
  } = props as HeadingProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Stack
      as={Component}
      data-slot={'heading'}
      data-gap={gap}
      data-size={size}
      gap={gap ?? 0}
      className={cn('min-w-0', SIZE[size], gap === undefined && DEFAULT_GAP_CLASS.heading, baseClasses, className)}
      {...rest}
    />
  );

}

Heading.displayName = 'Heading';
Heading.Eyebrow = HeadingEyebrow;
Heading.Title = HeadingTitle;
Heading.Description = HeadingDescription;
