import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { Spinner } from '../../primitives/Spinner';

import { Item } from '../item/Item';

import type { BaseProps } from '../../core/base';
import type { PolymorphicProps } from '../../core/polymorphic';
import type { Justify, Responsive } from '../../core/responsive';

import type { StackProps, StrictStackProps } from '../../layout/Stack';

import type { ItemProps, StrictItemProps } from '../item/Item';


/* --------
 * Constants Definition
 * -------- */

/**
 * The room of every part, one variable of the theme (`--surface-padding`, the `lg` step undeclared): the
 * horizontal padding of a dialog and of the table's card, so a card lines up with them.
 */
const PADDING_CLASS = 'p-surface';

/**
 * A part right under another in the same column does not repeat its top padding: a section under the
 * header, a footer of actions under a section. Twice the room read as two cards. Not inside a divided
 * group (`data-divided`), where the line wants room on both sides.
 */
const FOLLOWS_HEADER = '[:not([data-divided])>[data-slot=surface-header]+&]:pt-0';

const FOLLOWS_SECTION = '[:not([data-divided])>[data-slot=surface-section]+&]:pt-0';


/* --------
 * Variants Definition
 * -------- */

/**
 * ## Why `elevation`, `radius` and `border` have a default of their own
 *
 * A variant that resolved to its concrete step would report that step: a bare `<Surface />` would emit
 * the same attribute as a surface where somebody **asked** for it. `default` keeps the two apart, and it
 * reads the theme: `--surface-shadow` (none), `--surface-radius` (`lg`), `--surface-border-color`
 * (`--border`), so a product sets the look of every card it did not style once, in `:root`.
 */
const surfaceVariants = cva('relative overflow-hidden bg-card text-card-foreground', {
  variants: {
    elevation: {
      default: 'shadow-surface',
      none   : 'shadow-none',
      xs     : 'shadow-xs',
      sm     : 'shadow-sm',
      md     : 'shadow-md',
      lg     : 'shadow-lg'
    },

    radius: {
      default: 'rounded-surface',
      none   : 'rounded-none',
      sm     : 'rounded-sm',
      md     : 'rounded-md',
      lg     : 'rounded-lg',
      xl     : 'rounded-xl',
      '2xl'  : 'rounded-2xl',
      '3xl'  : 'rounded-3xl'
    }
  },

  defaultVariants: {
    elevation: 'default',
    radius   : 'default'
  }
});

/** The border: the theme's colour by default, the line of the package, or none */
const BORDER = {
  default: 'border border-surface-border',
  true   : 'border border-border',
  false  : 'border-0'
} as const;


/* --------
 * Types Definition
 * -------- */
export type SurfaceElevation = NonNullable<VariantProps<typeof surfaceVariants>['elevation']>;

export type SurfaceRadius = NonNullable<VariantProps<typeof surfaceVariants>['radius']>;

export interface StrictSurfaceProps extends BaseProps, VariantProps<typeof surfaceVariants> {
  /**
   * The line around the card. Undeclared, the theme's: on, in `--surface-border-color` (`--border`
   * undeclared, `transparent` to have none). `true` draws `--border`, `false` none
   */
  border?: boolean;

  /** Dim the content, block its interactions and show a spinner over it */
  loading?: boolean;

  /** What the spinner announces while it is up. Without it the overlay is silent to assistive tech */
  loadingLabel?: string;
}

export type SurfaceProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictSurfaceProps>;


/** The header of a card is an `Item`: the same own props */
export type StrictSurfaceHeaderProps = StrictItemProps;

export type SurfaceHeaderProps<E extends React.ElementType = 'div'> = ItemProps<E>;


export interface StrictSurfaceSectionProps extends BaseProps {
  /** Drop the padding, so a table or a map can reach the edges of the card */
  flush?: boolean;
}

export type SurfaceSectionProps<E extends React.ElementType = 'div'> =
  PolymorphicProps<E, StrictSurfaceSectionProps>;


/** A group of sections is a `Stack`: the same own props */
export type StrictSurfaceSectionGroupProps = StrictStackProps;

export type SurfaceSectionGroupProps<E extends React.ElementType = 'div'> = StackProps<E>;


export interface StrictSurfaceFooterProps extends BaseProps {
  /** Where the actions sit. Defaults to `end` */
  justify?: Responsive<Justify>;

  /** A recessed footer, quieter in its surface and its ink: the row of a pagination rather than an action */
  muted?: boolean;
}

export type SurfaceFooterProps<E extends React.ElementType = 'div'> =
  PolymorphicProps<E, StrictSurfaceFooterProps>;


/* --------
 * Parts Definition
 * -------- */

/**
 * The header of a card, which **is** an `Item` with the card's padding: the anatomy of a card header and
 * of a list row are the same slots with the same truncation, and the only difference is the register of
 * the title. It takes every prop of `Item` and replaces only its slot.
 *
 * ```tsx
 * <Surface.Header>
 *   <Item.Icon><IconBox tone={'primary'}><Truck /></IconBox></Item.Icon>
 *   <Item.Heading size={'lg'}>
 *     <Heading.Title>Mezzi in servizio</Heading.Title>
 *     <Heading.Description>Aggiornato 2 minuti fa</Heading.Description>
 *   </Item.Heading>
 *   <Item.Actions>{…}</Item.Actions>
 * </Surface.Header>
 * ```
 */
function SurfaceHeader<E extends React.ElementType = 'div'>(props: SurfaceHeaderProps<E>): React.ReactNode {
  const { className, ...rest } = props as SurfaceHeaderProps<'div'>;

  return (
    <Item
      data-slot={'surface-header'}
      className={cn(PADDING_CLASS, className)}
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
      className={cn('min-w-0', flush ? 'p-0' : cn(PADDING_CLASS, FOLLOWS_HEADER), baseClasses, className)}
      {...rest}
    />
  );

}

SurfaceSection.displayName = 'Surface.Section';


/**
 * Sections that belong together, which **is** a `Stack`: every prop of it, with no gap by default, so a
 * group of sections looks exactly like the same sections placed straight in the card. `divided` draws a
 * line between them; `direction={'horizontal'}` sets them side by side, the line between them vertical.
 *
 * ```tsx
 * <Surface.SectionGroup divided>
 *   <Surface.Section>…</Surface.Section>
 *   <Surface.Section>…</Surface.Section>
 * </Surface.SectionGroup>
 * ```
 */
function SurfaceSectionGroup<E extends React.ElementType = 'div'>(props: SurfaceSectionGroupProps<E>): React.ReactNode {
  const { divided, gap, ...rest } = props as SurfaceSectionGroupProps<'div'>;

  return (
    <Stack
      data-slot={'surface-section-group'}
      data-divided={divided ? true : undefined}
      gap={gap ?? 0}
      divided={divided}
      {...rest}
    />
  );
}

SurfaceSectionGroup.displayName = 'Surface.SectionGroup';


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
      gap={'sm'}
      className={cn(
        PADDING_CLASS,
        muted ? 'bg-muted text-muted-foreground' : FOLLOWS_SECTION,
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
 * <Surface>
 *   <Surface.Header>…</Surface.Header>
 *   <Surface.SectionGroup divided>
 *     <Surface.Section>…</Surface.Section>
 *     <Surface.Section flush><DataTable /></Surface.Section>
 *   </Surface.SectionGroup>
 *   <Surface.Footer justify={'between'}>…</Surface.Footer>
 * </Surface>
 * ```
 *
 * **The Surface has no padding of its own**: the room lives in the parts (`--surface-padding`), which is
 * what lets a section go `flush` and give its edges to a table without fighting a padding one level up.
 * A part under another does not repeat its top padding, outside a divided group.
 *
 * Its look is the theme's: `--surface-radius`, `--surface-shadow`, `--surface-border-color`, read by the
 * `default` of `radius`, `elevation` and `border`.
 *
 * Slots: `surface` (with `data-elevation`, `data-radius`, `data-border`, `data-loading`), `surface-body`,
 * `surface-header`, `surface-section-group` (with `data-divided`), `surface-section` (with `data-flush`),
 * `surface-footer` (with `data-muted`), `surface-loading`.
 */
export function Surface<E extends React.ElementType = 'div'>(props: SurfaceProps<E>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    as: Component = 'div',
    border,
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
  const borderKey = border === undefined ? 'default' : (border ? 'true' : 'false');

  return (
    <Stack
      gap={0}
      as={Component}
      data-slot={'surface'}
      data-border={borderKey}
      data-elevation={elevation}
      data-loading={loading || undefined}
      data-radius={radius}
      className={cn(surfaceVariants({ elevation, radius }), BORDER[borderKey], baseClasses, className)}
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
Surface.SectionGroup = SurfaceSectionGroup;
