'use client';

import * as React from 'react';

import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';

import { optionalContextBuilder } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { DEFAULT_GAP_CLASS } from '../../layout/defaultGap';
import { Stack } from '../../layout/Stack';

import { isPresent } from '../../internal/presence';

import type { BaseProps } from '../../core/base';


/* --------
 * Types Definition
 * -------- */

/**
 * How the items stand together. `default`: a rule between them, nothing around. `contained`: the same
 * rules in a box with a corner. `filled`: no rule, the open item on a quiet surface with a corner.
 * `separated`: each item a box of its own, apart from the others, the open one on a surface of its own
 * with a border.
 */
export type AccordionVariant = 'default' | 'contained' | 'filled' | 'separated';

/** The corner of the boxed variants: the theme's (`--accordion-radius`), or a step of the scale */
export type AccordionRadius = 'default' | 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export type AccordionChevronPosition = 'start' | 'end';

export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface StrictAccordionProps extends BaseProps {
  /** Defaults to `default` */
  variant?: AccordionVariant;

  /** The corner of `contained`, `filled` and `separated`. Defaults to `default`, the theme's */
  radius?: AccordionRadius;

  /**
   * Several items open together, the way the sections of a form or a detail are read. `false` keeps one
   * open at a time, opening one closes the other. Defaults to `true`
   */
  multiple?: boolean;

  /** The values of the open items, controlled */
  value?: readonly string[];

  /** The values of the items open at first, uncontrolled. Defaults to none */
  defaultValue?: readonly string[];

  onValueChange?: (value: string[]) => void;

  /** Where the arrow sits: before the title, or at the end of the header. Defaults to `start` */
  chevronPosition?: AccordionChevronPosition;

  /** The level of the heading of every item. Defaults to 3, under the title of the container */
  headingLevel?: AccordionHeadingLevel;

  /**
   * Keeps the bodies mounted and hidden while closed: their fields keep their value and the validation
   * still sees them. Off by default, when a closed body is not in the document
   */
  keepMounted?: boolean;

  /**
   * The headers run edge to edge of a card: the padding of the card inside the button, a focus ring
   * inside it, and bodies that take the whole width and place their own content. The groups of a
   * `CheckboxGrid`. With the `default` variant
   */
  inset?: boolean;

  /** `Accordion.Item`s */
  children?: React.ReactNode;
}

export type AccordionProps = StrictAccordionProps & Omit<React.ComponentProps<'div'>, keyof StrictAccordionProps | 'defaultValue'>;

export interface StrictAccordionItemProps extends BaseProps {
  /** What identifies the item in `value`. Defaults to an id of its own: give one to open it at first or control it */
  value?: string;

  /** The title, inside the button that opens it */
  title: React.ReactNode;

  /** A mark right after the title: "modified", with its dot */
  status?: React.ReactNode;

  /** A summary at the end of the button, always with its unit: "12 entries", never "12" */
  meta?: React.ReactNode;

  /** Controls at the end of the header, outside the button: never a control inside another */
  actions?: React.ReactNode;

  disabled?: boolean;

  /** The body */
  children?: React.ReactNode;
}

export type AccordionItemProps = StrictAccordionItemProps & Omit<React.ComponentProps<'div'>, keyof StrictAccordionItemProps>;

interface AccordionSettings {
  readonly variant: AccordionVariant;
  readonly radiusClass: string;
  readonly chevronPosition: AccordionChevronPosition;
  readonly headingLevel: AccordionHeadingLevel;
  readonly inset: boolean;
}


/* --------
 * Constants Definition
 * -------- */

const DEFAULT_VARIANTS = {
  variant        : 'default',
  radius         : 'default',
  chevronPosition: 'start',
  headingLevel   : 3
} as const;

const HEADING_ELEMENT = {
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6'
} as const;

const RADIUS: Readonly<Record<AccordionRadius, string>> = {
  default: 'rounded-accordion',
  none   : 'rounded-none',
  sm     : 'rounded-sm',
  md     : 'rounded-md',
  lg     : 'rounded-lg',
  xl     : 'rounded-xl',
  '2xl'  : 'rounded-2xl'
};

/** The variants whose items are boxes of their own, padded inside */
const BOXED: ReadonlySet<AccordionVariant> = new Set([ 'contained', 'filled', 'separated' ]);

/**
 * The hover is the header's, not the button's: the row runs edge to edge of the item, actions included,
 * while the button stops where the actions start. It is a layer over the background, never the background
 * itself, so a header given an opaque one keeps it: the sticky headers of a CheckboxGrid, over rows that
 * scroll under them.
 */
const HEADER_HOVER = [
  'has-[[data-slot=accordion-trigger]:not([data-disabled]):hover]:bg-linear-to-r',
  'has-[[data-slot=accordion-trigger]:not([data-disabled]):hover]:from-foreground/5',
  'has-[[data-slot=accordion-trigger]:not([data-disabled]):hover]:to-foreground/5'
].join(' ');

/**
 * What an item is, per variant: the rules of `default` and `contained` are the root's (`divided`). A rounded
 * item clips what it holds, as the root of `contained` does, so the hover of its header follows the inner
 * edge of its corner (one pixel tighter inside the border of `separated`) with no radius of its own.
 */
const ITEM: Readonly<Record<AccordionVariant, string>> = {
  default  : '',
  contained: '',
  filled   : 'overflow-hidden transition-colors duration-100 motion-reduce:transition-none data-open:bg-accordion-filled',
  separated: [
    'overflow-hidden border border-transparent bg-accordion-item',
    'transition-colors duration-100 motion-reduce:transition-none',
    'data-open:border-accordion-open-border data-open:bg-accordion-item-open'
  ].join(' ')
};


/* --------
 * Context Definition
 * -------- */

const [ AccordionContext, useAccordionContext ] = optionalContextBuilder<AccordionSettings>('Accordion', {
  variant        : DEFAULT_VARIANTS.variant,
  radiusClass    : RADIUS.default,
  chevronPosition: DEFAULT_VARIANTS.chevronPosition,
  headingLevel   : DEFAULT_VARIANTS.headingLevel,
  inset          : false
});


/* --------
 * Glyphs
 * -------- */

/** A chevron that points at the body: right and turning down before the title, down and turning up at the end */
function ChevronGlyph(props: { position: AccordionChevronPosition }): React.ReactNode {
  const atEnd = props.position === 'end';

  return (
    <svg
      data-slot={'accordion-chevron'}
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={1.75}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
      focusable={'false'}
      className={cn(
        'size-4 shrink-0 text-muted-foreground transition-transform duration-150 motion-reduce:transition-none',
        atEnd ? 'group-data-panel-open/accordion-trigger:rotate-180' : 'group-data-panel-open/accordion-trigger:rotate-90'
      )}
    >
      <path d={atEnd ? 'm6 9 6 6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  );
}


/* --------
 * Parts
 * -------- */

/**
 * One section: the header, a real heading with a full width button inside, and the body under it.
 *
 * The name of the button is title, mark and summary, joined with `aria-labelledby` so the package adds
 * no word of its own; the actions are siblings of the heading, never inside the button. A long title
 * wraps, the arrow stays on its first line.
 */
function AccordionItem(props: AccordionItemProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { actions, children, className, disabled = false, meta, status, title, value, ...others } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const { chevronPosition, headingLevel, inset, radiusClass, variant } = useAccordionContext();
  const uid = React.useId();


  // ----
  // Component Render
  // ----
  const Title = HEADING_ELEMENT[headingLevel];
  const boxed = BOXED.has(variant);
  const atEnd = chevronPosition === 'end';
  const hasStatus = isPresent(status);
  const hasMeta = isPresent(meta);
  const titleId = `${uid}-title`;
  const statusId = `${uid}-status`;
  const metaId = `${uid}-meta`;
  const labelledBy = [ titleId, hasStatus && statusId, hasMeta && metaId ].filter(Boolean).join(' ');

  /* The padding of the header and of the body: inside the box, flush with the text around, or edge to edge of a card */
  const sidePadding = boxed ? 'px-4' : (inset ? 'px-6' : 'px-2');
  const rounded = variant === 'filled' || variant === 'separated';

  /*
   * The row of the header. `default` bleeds by its padding on both sides, so the text lines up with the text
   * around and the hover reaches past it evenly; a boxed item clips the row to its own corner.
   */
  const headerShape = !boxed && !inset ? '-mx-2 rounded-md' : undefined;

  /* The body lines up with the title: past the arrow when it is before it */
  const bodyPadding = boxed
    ? (atEnd ? 'px-4 pb-4' : 'ps-10 pe-4 pb-4')
    : (inset ? undefined : (atEnd ? 'pb-4' : 'ps-6 pb-4'));

  const chevron = (
    <Stack gap={0} as={'span'} data-slot={'accordion-chevron-box'} direction={'horizontal'} align={'center'} className={'h-5 shrink-0'}>
      <ChevronGlyph position={chevronPosition} />
    </Stack>
  );

  return (
    <AccordionPrimitive.Item
      value={value}
      disabled={disabled}
      render={<div {...rest} />}
      data-slot={'accordion-item'}
      className={cn(ITEM[variant], rounded && radiusClass, baseClasses, className)}
    >
      <Stack data-slot={'accordion-header'} direction={'horizontal'} align={'center'} gap={2} className={cn('min-h-10', HEADER_HOVER, headerShape)}>
        <AccordionPrimitive.Header render={<Title />} className={'m-0 min-w-0 flex-1 text-sm'}>
          <AccordionPrimitive.Trigger
            data-slot={'accordion-trigger'}
            aria-labelledby={labelledBy}
            render={<Stack as={'button'} direction={'horizontal'} align={'start'} gap={2} />}
            className={cn(
              'group/accordion-trigger min-h-10 w-full py-2.5 text-start',
              'font-semibold text-foreground',
              'data-disabled:cursor-not-allowed data-disabled:opacity-50',
              'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring',
              sidePadding,
              boxed || inset ? 'focus-visible:-outline-offset-2' : 'rounded-md focus-visible:outline-offset-2',
              rounded && cn(radiusClass, 'data-panel-open:rounded-b-none')
            )}
          >
            {!atEnd && chevron}
            <span id={titleId} data-slot={'accordion-title'} className={'min-w-0'}>{title}</span>
            {hasStatus && (
              <Stack
                as={'span'}
                id={statusId}
                data-slot={'accordion-status'}
                direction={'horizontal'}
                align={'center'}
                gap={1.5}
                className={'h-5 shrink-0 text-xs font-normal text-primary-soft-foreground'}
              >
                {status}
              </Stack>
            )}
            {hasMeta && (
              <Stack
                gap={0}
                as={'span'}
                id={metaId}
                data-slot={'accordion-meta'}
                direction={'horizontal'}
                align={'center'}
                className={'ms-auto h-5 shrink-0 ps-2 text-xs font-normal text-muted-foreground'}
              >
                {meta}
              </Stack>
            )}
            {atEnd && <span className={cn('shrink-0', !hasMeta && 'ms-auto')}>{chevron}</span>}
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>

        {isPresent(actions) && (
          <Stack
            data-slot={'accordion-actions'}
            direction={'horizontal'}
            align={'center'}
            gap={1}
            className={cn('shrink-0', inset && !boxed ? 'pe-6' : 'pe-2')}
          >
            {actions}
          </Stack>
        )}
      </Stack>

      <AccordionPrimitive.Panel data-slot={'accordion-panel'} className={'accordion-panel'}>
        <div data-slot={'accordion-content'} className={bodyPadding}>
          {children}
        </div>
      </AccordionPrimitive.Panel>
    </AccordionPrimitive.Item>
  );

}

AccordionItem.displayName = 'Accordion.Item';


/* --------
 * Component Definition
 * -------- */

/**
 * Sections that open and close from their header: an arrow, the title, a mark, the summary on the
 * right, the actions at the end, then the body. A piece of layout, not a container: it stands in a
 * form, a detail, a page or a card.
 *
 * ```tsx
 * <Accordion variant={'contained'} defaultValue={[ 'history' ]}>
 *   <Accordion.Item value={'history'} title={'History'} meta={'12 entries'} actions={<Button size={'sm'}>Add entry</Button>}>
 *     …
 *   </Accordion.Item>
 * </Accordion>
 * ```
 *
 * Four variants: `default` rules between the items and nothing around them, `contained` the same rules
 * in a box, `filled` no rule and the open item on a quiet surface, `separated` each item a box of its own
 * with a border when open. The look of the boxed variants is the theme's (`--accordion-radius`,
 * `--accordion-gap`, `--accordion-filled-background`, `--accordion-item-background`,
 * `--accordion-item-open-background`, `--accordion-open-border`), so a product turns it once.
 *
 * The component never draws the border of the container it sits in: `default` draws only the rules
 * between its items, so it goes inside a card without a line doubling the card's.
 *
 * Several items open together by default, the way the sections of a form are read; `multiple={false}`
 * keeps one. The body opens on its height, a functional animation, and not at all with reduced motion.
 * A single section is an Accordion with one item. On Base UI's `Accordion`, which owns `aria-expanded`,
 * `aria-controls` and the hidden body; every header is a stop of Tab, with no arrows between them (Base UI
 * 1.7 dropped them, and the pattern does not ask for them).
 *
 * Slots: `accordion` (with `data-variant`, `data-radius`, `data-chevron-position`, `data-inset`,
 * `data-multiple`), `accordion-item` (with `data-open`, `data-disabled`, `data-index`), `accordion-header`,
 * `accordion-trigger`, `accordion-chevron-box`, `accordion-chevron`, `accordion-title`,
 * `accordion-status`, `accordion-meta`, `accordion-actions`, `accordion-panel`, `accordion-content`.
 */
function AccordionRoot(props: AccordionProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    chevronPosition = DEFAULT_VARIANTS.chevronPosition,
    children,
    className,
    defaultValue,
    headingLevel = DEFAULT_VARIANTS.headingLevel,
    inset = false,
    keepMounted = false,
    multiple = true,
    onValueChange,
    radius = DEFAULT_VARIANTS.radius,
    value,
    variant = DEFAULT_VARIANTS.variant,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  const settings: AccordionSettings = { variant, radiusClass: RADIUS[radius], chevronPosition, headingLevel, inset };
  const divided = variant === 'default' || variant === 'contained';

  return (
    <AccordionContext.Provider value={settings}>
      <AccordionPrimitive.Root
        value={value as string[] | undefined}
        defaultValue={defaultValue as string[] | undefined}
        onValueChange={(next) => onValueChange?.(next as string[])}
        multiple={multiple}
        keepMounted={keepMounted}
        render={<Stack {...rest} gap={0} divided={divided} />}
        data-slot={'accordion'}
        data-variant={variant}
        data-radius={radius}
        data-chevron-position={chevronPosition}
        data-inset={inset || undefined}
        data-multiple={multiple || undefined}
        className={cn(
          variant === 'contained' && cn('overflow-hidden border border-border', RADIUS[radius]),
          variant === 'separated' && DEFAULT_GAP_CLASS.accordion,
          baseClasses,
          className
        )}
      >
        {children}
      </AccordionPrimitive.Root>
    </AccordionContext.Provider>
  );

}

AccordionRoot.displayName = 'Accordion';

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem
});
