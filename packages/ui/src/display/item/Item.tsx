import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import type { BaseProps } from '../../core/base';
import type { PolymorphicProps } from '../../core/polymorphic';
import type { Align, Direction, Responsive, SpacingValue } from '../../core/responsive';


/* --------
 * Constants Definition
 * -------- */
const DEFAULT_ALIGN: Align = 'center';

const DEFAULT_DIRECTION: Direction = 'horizontal';

const DEFAULT_GAP: SpacingValue = 3;


/**
 * The plumbing, and the only reason this component exists rather than a `Cluster` with three children.
 *
 * `grow min-w-0` on the text block — a `Heading` or a `LabeledContent`, whichever the caller put there
 * — and `shrink-0` on the tail is what makes a long title **truncate**
 * instead of pushing the actions out of the row. Both reference implementations carry it, three times
 * per file, and it is the part that is silently wrong when a caller forgets it: nothing breaks, the row
 * just overflows its container at some content length nobody tested.
 *
 * ⚠️ `grow`, not `flex-1`, and the difference is what lets `direction` be responsive for free.
 * `flex-1` sets `flex-basis: 0`, whose behaviour in an auto-height column depends on intrinsic sizing;
 * `grow` leaves the basis alone and only distributes **positive free space**, of which an auto-height
 * column has none. So the same two classes are correct in a row and inert in a column, and the
 * direction needs no per-breakpoint plumbing — which would have been 12 safelist entries.
 *
 * ⚠️ A descendant selector has higher specificity than the child's own utility (`0,2,0` against
 * `0,1,0`), so these beat a `grow-0` written in the heading's `className`. That is the price of the
 * caller not having to know about them; the escape hatch is `className` on the `Item` itself.
 */
const SLOT_PLUMBING = cn(
  '[&>[data-slot=heading]]:min-w-0 [&>[data-slot=heading]]:grow',
  '[&>[data-slot=labeled-content]]:min-w-0 [&>[data-slot=labeled-content]]:grow'
);


/* --------
 * Variants Definition
 * -------- */
const itemVariants = cva('relative outline-none', {
  variants: {
    /**
     * Row padding on the item itself.
     *
     * Not tidiness: it is what makes an interactive row's hover fill the row edge to edge. With the
     * padding on a parent and the hover here, the highlight is a tight box around the content with a
     * dead margin around it — which reads as a bug and is one of the notes the reference
     * implementation left for itself.
     */
    inset: {
      false: '',
      true : 'px-4 py-3'
    },

    /** The affordance only. The semantics are the caller's — see the note on the component */
    interactive: {
      false: '',
      true : 'cursor-pointer transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary/40'
    }
  },

  defaultVariants: {
    inset      : false,
    interactive: false
  }
});


/* --------
 * Types Definition
 * -------- */
export interface StrictItemProps extends BaseProps, VariantProps<typeof itemVariants> {
  /** Cross-axis alignment. Defaults to `center`, which is what a row wants; a stack usually wants `start` */
  align?: Responsive<Align>;

  /**
   * The axis. `vertical` with `align={'center'}` is the shape of an empty state: the leading visual
   * above the text instead of beside it.
   */
  direction?: Responsive<Direction>;

  /** Space between the leading visual, the text and the tail. Defaults to `3` */
  gap?: Responsive<SpacingValue>;
}

export type ItemProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictItemProps>;


export interface StrictItemActionsProps extends BaseProps {}

export type ItemActionsProps<E extends React.ElementType = 'div'> =
  PolymorphicProps<E, StrictItemActionsProps>;


export interface StrictItemTrailingProps extends BaseProps {}

export type ItemTrailingProps<E extends React.ElementType = 'span'> =
  PolymorphicProps<E, StrictItemTrailingProps>;


/* --------
 * Parts Definition
 * -------- */

/** The controls at the end of the row: buttons, a menu trigger, a switch. Never shrinks */
function ItemActions<E extends React.ElementType = 'div'>(props: ItemActionsProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    ...others
  } = props as ItemActionsProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Stack
      as={Component}
      data-slot={'item-actions'}
      direction={'horizontal'}
      align={'center'}
      gap={1.5}
      className={cn('shrink-0', baseClasses, className)}
      {...rest}
    />
  );

}

ItemActions.displayName = 'Item.Actions';


/**
 * The affordance at the very end: a chevron, a count, a unit.
 *
 * Distinct from `Actions` because it is not a control — it is quiet by default and carries no gap of
 * its own, which is what keeps a chevron tight against the edge while buttons stay spaced.
 */
function ItemTrailing<E extends React.ElementType = 'span'>(props: ItemTrailingProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'span',
    className,
    ...others
  } = props as ItemTrailingProps<'span'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Stack
      as={Component}
      data-slot={'item-trailing'}
      inline
      direction={'horizontal'}
      align={'center'}
      className={cn('shrink-0 text-muted-foreground', baseClasses, className)}
      {...rest}
    />
  );

}

ItemTrailing.displayName = 'Item.Trailing';


/* --------
 * Component Definition
 * -------- */

/**
 * The row: a leading visual, a block of text, a tail. The workhorse of every list, every settings
 * screen and every summary panel.
 *
 * ```tsx
 * <Item interactive inset>
 *   <IconBox><Truck /></IconBox>
 *   <Heading>
 *     <Heading.Eyebrow>In servizio</Heading.Eyebrow>
 *     <Heading.Title>FT-234-KL</Heading.Title>
 *     <Heading.Description>Ultimo passaggio 12:04</Heading.Description>
 *   </Heading>
 *   <Item.Actions>{…}</Item.Actions>
 *   <Item.Trailing><ChevronRight /></Item.Trailing>
 * </Item>
 * ```
 *
 * Turn the axis and the same component is an empty state:
 *
 * ```tsx
 * <Item direction={'vertical'} gap={6} className={'text-center'}>
 *   <IconBox size={'2xl'} tone={'primary'} halo><Inbox /></IconBox>
 *   <Heading gap={2}>
 *     <Heading.Title size={'xl'}>Nessun risultato</Heading.Title>
 *     <Heading.Description size={'md'}>Prova a rimuovere un filtro</Heading.Description>
 *   </Heading>
 *   <Item.Actions>{…}</Item.Actions>
 * </Item>
 * ```
 *
 * The leading visual needs no slot of its own: `IconBox` and `Spinner` already carry `shrink-0`, so
 * anything from this package can be a direct child. `text-center` is a literal class rather than a
 * prop because it is one class the caller can write, which is the criterion for what does not become
 * part of the API.
 *
 * ## No chrome, on purpose
 *
 * Both reference implementations give this component a `tone` of `flat` or `boxed`, where `boxed`
 * draws `bg-card`, a radius and its own padding — which is a card. There is a component for a card,
 * and composing is one element rather than a duplicated chrome that then has to be kept in step with
 * it: `<Surface><Item /></Surface>`. What stayed is `inset`, because row padding is a property of the
 * row and not of the box around it.
 *
 * ## `interactive` is the affordance, not the semantics
 *
 * ⚠️ This is the one place where this component deliberately does **less** than both references. They
 * derive an `interactive` state from `clickable || onClick` and then add `role="button"`, `tabIndex`
 * and a hand-written Enter/Space handler to a `div`. That re-implements a button, badly, and it breaks
 * the moment the row contains a control of its own: a `button` inside a `button` is invalid, and one of
 * the two files carries a note to itself about exactly that case.
 *
 * So `interactive` gives the cursor, the hover and the focus ring, and the semantics stay the
 * caller's:
 *
 * - a row that **is** a button, with no controls inside it: `<Item as={'button'} type={'button'} interactive>`
 * - a row that navigates: wrap it in the router's link and keep the `Item` presentational
 * - a row with its own actions: the row is not clickable, the actions are
 *
 * An `onClick` on a `div` is not reachable from a keyboard, and no prop here will pretend otherwise.
 */
export function Item<E extends React.ElementType = 'div'>(props: ItemProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    align = DEFAULT_ALIGN,
    as: Component = 'div',
    className,
    direction = DEFAULT_DIRECTION,
    gap = DEFAULT_GAP,
    inset = false,
    interactive = false,
    ...others
  } = props as ItemProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Layout Computation
  // ----
  const classes = cn(
    itemVariants({ inset, interactive }),
    SLOT_PLUMBING,
    baseClasses,
    className
  );


  // ----
  // Component Render
  // ----
  return (
    <Stack
      as={Component}
      data-slot={'item'}
      data-inset={inset || undefined}
      data-interactive={interactive || undefined}
      direction={direction}
      align={align}
      gap={gap}
      className={classes}
      {...rest}
    />
  );

}

Item.displayName = 'Item';
Item.Actions = ItemActions;
Item.Trailing = ItemTrailing;
