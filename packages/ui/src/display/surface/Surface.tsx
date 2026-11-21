import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { Divider } from '../../primitives/Divider';
import { Spinner } from '../../primitives/Spinner';

import { Item } from '../item/Item';

import type { BaseProps } from '../../core/base';
import type { PolymorphicProps } from '../../core/polymorphic';
import type { Justify, Responsive, Spacing } from '../../core/responsive';

import type { ItemProps } from '../item/Item';


/* --------
 * Constants Definition
 * -------- */

/**
 * The house elevation and the house radius, each in one place.
 *
 * `default` and the step it happens to equal share these constants rather than repeating a class, so
 * the two cannot drift: the point of `default` is that it *is* one of the steps until an application
 * says otherwise, not that it is a fourth appearance.
 */
const DEFAULT_ELEVATION_CLASS = 'shadow-sm';

const DEFAULT_RADIUS_CLASS = 'rounded-4xl';

const DEFAULT_PADDING_CLASS = 'p-5';


/* --------
 * Variants Definition
 * -------- */

/**
 * ## Why `elevation` and `radius` have a `default` value of their own
 *
 * A variant that resolves to its concrete step reports that step: a bare `<Surface />` would emit
 * `data-elevation="soft"`, which is indistinguishable from a surface where somebody **asked** for
 * `soft`. An application that wants to restyle "a card we did not say anything about" would then also
 * restyle every card that deliberately chose that step.
 *
 * `default` keeps the two apart. `[data-elevation='default']` is exactly the set of surfaces with no
 * opinion, and it is the set an application actually wants to own.
 *
 * ⚠️ This belongs to a **chrome** variant, not to every variant. `elevation` and `radius` carry a
 * house opinion an application will want to redefine wholesale; `size`, `gap` and `tone` are steps the
 * caller picked from a scale, and there `data-size="md"` is worth more than `data-size="default"`
 * because it says what the thing *is*. The criterion is whether the default is an opinion or a
 * measurement.
 */
const surfaceVariants = cva('relative overflow-hidden bg-card text-card-foreground', {
  variants: {
    elevation: {
      default: DEFAULT_ELEVATION_CLASS,
      flat   : 'shadow-none',
      soft   : DEFAULT_ELEVATION_CLASS,
      raised : 'shadow-lg'
    },

    radius: {
      default: DEFAULT_RADIUS_CLASS,
      none   : 'rounded-none',
      lg     : 'rounded-lg',
      xl     : 'rounded-xl',
      '2xl'  : 'rounded-2xl',
      '3xl'  : 'rounded-3xl',
      '4xl'  : DEFAULT_RADIUS_CLASS
    }
  },

  defaultVariants: {
    elevation: 'default',
    radius   : 'default'
  }
});


/* --------
 * Types Definition
 * -------- */
export interface StrictSurfaceProps extends BaseProps, VariantProps<typeof surfaceVariants> {
  /** Dim the content, block its interactions and show a spinner over it */
  loading?: boolean;

  /** What the spinner announces while it is up. Without it the overlay is silent to assistive tech */
  loadingLabel?: string;
}

export type SurfaceProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictSurfaceProps>;


export type SurfaceHeaderProps<E extends React.ElementType = 'div'> = ItemProps<E>;


export interface StrictSurfaceSectionProps extends BaseProps {
  /** Drop the padding, so a table or a map can reach the edges of the card */
  flush?: boolean;
}

export type SurfaceSectionProps<E extends React.ElementType = 'div'> =
  PolymorphicProps<E, StrictSurfaceSectionProps>;


export interface StrictSurfaceSeparatorProps extends BaseProps {
  /**
   * How much room a `gap` takes: a step of the spacing scale by name, or a Tailwind spacing step by
   * number. Defaults to `lg`. Ignored by a `divider`
   */
  space?: Spacing;

  /** A hairline, or empty room. Defaults to `divider` */
  type?: 'divider' | 'gap';
}

export type SurfaceSeparatorProps = StrictSurfaceSeparatorProps & Omit<React.ComponentProps<'div'>, 'type'>;


export interface StrictSurfaceFooterProps extends BaseProps {
  /** Where the actions sit. Defaults to `end` */
  justify?: Responsive<Justify>;

  /** A recessed footer, for the row that carries a pagination rather than an action */
  muted?: boolean;
}

export type SurfaceFooterProps<E extends React.ElementType = 'div'> =
  PolymorphicProps<E, StrictSurfaceFooterProps>;


/* --------
 * Parts Definition
 * -------- */

/**
 * The header of a card, which **is** an `Item` with the card's padding.
 *
 * That is not a shortcut, it is the finding this package was built on: the anatomy of a card header
 * and the anatomy of a list row are the same three slots with the same truncation plumbing, and the
 * only difference is the register of the title. So this renders an `Item`, takes every one of its
 * props, and replaces only its slot — the row's own `data-slot` would be wrong here, and a header is
 * not a thing a consumer wants to catch with `[data-slot='item']`.
 *
 * The title states its own size, because a header reads larger than a row:
 *
 * ```tsx
 * <Surface.Header>
 *   <IconBox tone={'primary'}><Truck /></IconBox>
 *   <Heading>
 *     <Heading.Title size={'lg'}>Mezzi in servizio</Heading.Title>
 *     <Heading.Description>Aggiornato 2 minuti fa</Heading.Description>
 *   </Heading>
 *   <Item.Actions>{…}</Item.Actions>
 * </Surface.Header>
 * ```
 */
function SurfaceHeader<E extends React.ElementType = 'div'>(props: SurfaceHeaderProps<E>): React.ReactNode {
  const { className, ...rest } = props as SurfaceHeaderProps<'div'>;

  return (
    <Item
      data-slot={'surface-header'}
      className={cn(DEFAULT_PADDING_CLASS, className)}
      {...rest}
    />
  );
}

SurfaceHeader.displayName = 'Surface.Header';


/** A body of the card. `flush` gives the edges back to the content */
function SurfaceSection<E extends React.ElementType = 'div'>(props: SurfaceSectionProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    flush = false,
    ...others
  } = props as SurfaceSectionProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Component
      data-slot={'surface-section'}
      data-flush={flush || undefined}
      className={cn('min-w-0', flush ? 'p-0' : DEFAULT_PADDING_CLASS, baseClasses, className)}
      {...rest}
    />
  );

}

SurfaceSection.displayName = 'Surface.Section';


/**
 * What goes **between** two sections, and it is a component rather than a prop on purpose.
 *
 * The two reference implementations disagree here, and neither is wrong: one draws an automatic
 * hairline between every part (`divide-y` on the body), the other separates with vertical rhythm and
 * no line at all. Both had to encode that decision once, for the whole card — the first one carries
 * a `divide-y` nobody can opt out of per section, the second carries nine `[&>[data-slot=…]]` margin
 * rules to reproduce a rhythm the caller cannot see.
 *
 * Placing the separator explicitly costs one element and removes both machines: the decision is per
 * seam, it is visible where it happens, and a card can have a line in one place and room in another.
 *
 * ```tsx
 * <Surface.Separator />                          // a hairline
 * <Surface.Separator type={'gap'} space={'xl'} />   // room instead
 * ```
 *
 * A `divider` renders a `Divider`, so it arrives with `role="separator"` already on it.
 */
function SurfaceSeparator(props: SurfaceSeparatorProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    space = 'lg',
    type = 'divider',
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  if (type === 'divider') {
    return <Divider data-slot={'surface-separator'} data-type={'divider'} className={cn(baseClasses, className)} {...rest} />;
  }

  return (
    <div
      aria-hidden
      data-slot={'surface-separator'}
      data-type={'gap'}
      className={cn('shrink-0', `h-${space}`, baseClasses, className)}
      {...rest}
    />
  );

}

SurfaceSeparator.displayName = 'Surface.Separator';


/** The last row: form actions, or the pagination of a table */
function SurfaceFooter<E extends React.ElementType = 'div'>(props: SurfaceFooterProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    className,
    justify = 'end',
    muted = false,
    ...others
  } = props as SurfaceFooterProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Stack
      as={Component}
      data-slot={'surface-footer'}
      data-muted={muted || undefined}
      direction={'horizontal'}
      align={'center'}
      justify={justify}
      gap={2.5}
      className={cn(
        DEFAULT_PADDING_CLASS,
        muted && 'bg-muted/40',
        baseClasses,
        className
      )}
      {...rest}
    />
  );

}

SurfaceFooter.displayName = 'Surface.Footer';


/* --------
 * Internal Components
 * -------- */

/**
 * The loading overlay.
 *
 * ⚠️ Three arbitrary values from the reference implementations did not survive, and two of them were
 * hiding something. `z-[5]` is `z-5`, `backdrop-blur-[2px]` is `backdrop-blur-xs` (4px, the nearest
 * declared step), and `saturate-[0.82]` is **gone**: a 18% desaturation behind a 55% dim is a
 * difference nobody can see, and it was the only reason the class list needed a number nobody named.
 */
const SurfaceLoadingOverlay: React.FunctionComponent<{ label?: string }> = ({ label }) => (
  <Stack
    /*
     * The live region is HERE, not on the spinner, and the spinner stays decorative. Both carrying a
     * label would announce it twice — the spinner's own `sr-only` copy and the visible line saying the
     * same words. With no label the whole overlay is decoration, so it leaves the accessibility tree
     * rather than announcing an empty status.
     */
    {...(label === undefined
      ? { 'aria-hidden': true }
      : { 'aria-live': 'polite' as const, role: 'status' })}
    data-slot={'surface-loading'}
    align={'center'}
    justify={'center'}
    gap={3}
    className={'absolute inset-0 z-5 bg-card/60 backdrop-blur-xs'}
  >
    <Spinner size={'lg'} className={'text-primary'} />
    {label !== undefined && <span className={'text-xs font-medium text-muted-foreground'}>{label}</span>}
  </Stack>
);

SurfaceLoadingOverlay.displayName = 'Surface.LoadingOverlay';


/* --------
 * Component Definition
 * -------- */

/**
 * The card, the panel, the box: one anatomy that carries information, tables, forms and charts.
 *
 * ```tsx
 * <Surface elevation={'raised'}>
 *   <Surface.Header>…</Surface.Header>
 *   <Surface.Separator />
 *   <Surface.Section>…</Surface.Section>
 *   <Surface.Separator type={'gap'} />
 *   <Surface.Section flush><DataTable /></Surface.Section>
 *   <Surface.Footer justify={'between'}>…</Surface.Footer>
 * </Surface>
 * ```
 *
 * **The Surface has no padding of its own**: the room lives in the parts, which is what lets a section
 * go `flush` and give its edges to a table without fighting a padding one level up.
 *
 * ⚠️ No `modal` elevation, though one of the references has it. There it is not an elevation at all —
 * it is a whole bottom-sheet behaviour with an internal scroll, coupled to that project's `Dialog`
 * through a shared shell module. It belongs to whichever package ships the dialog.
 */
export function Surface<E extends React.ElementType = 'div'>(props: SurfaceProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    children,
    className,
    elevation = 'default',
    loading = false,
    loadingLabel,
    radius = 'default',
    ...others
  } = props as SurfaceProps<'div'>;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <Stack
      gap={0}
      as={Component}
      data-slot={'surface'}
      data-elevation={elevation}
      data-loading={loading || undefined}
      data-radius={radius}
      className={cn(surfaceVariants({ elevation, radius }), baseClasses, className)}
      {...rest}
    >
      <Stack
        gap={0}
        data-slot={'surface-body'}
        className={cn(
          'min-w-0 transition-opacity duration-300',
          loading && 'pointer-events-none opacity-45'
        )}
      >
        {children}
      </Stack>

      {loading && <SurfaceLoadingOverlay label={loadingLabel} />}
    </Stack>
  );

}

Surface.displayName = 'Surface';
Surface.Footer = SurfaceFooter;
Surface.Header = SurfaceHeader;
Surface.Section = SurfaceSection;
Surface.Separator = SurfaceSeparator;
