'use client';

import * as React from 'react';

import { optionalContextBuilder, useAnnouncer } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';
import { responsiveClasses, toResponsiveMap } from '../../core/responsive';

import { Stack } from '../../layout/Stack';

import { Label } from '../../primitives/Label';

import { isPresent } from '../../internal/presence';

import { Button } from '../../actions/button/Button';
import { Tooltip } from '../../actions/tooltip/Tooltip';

import { EmptyState } from '../../feedback/empty-state/EmptyState';

import { FIELD_SPAN } from '../../forms/field/Field';

import type { BaseProps } from '../../core/base';
import type { Responsive } from '../../core/responsive';

import type { FieldSpan } from '../../forms/field/Field';


/* --------
 * Types Definition
 * -------- */

export type DetailHeadingLevel = 2 | 3 | 4 | 5 | 6;

/** The kind of a value: it decides the columns it takes, the same as the field of the same kind */
export type DetailValueType =
  | 'text'
  | 'text-short'
  | 'text-code'
  | 'text-long'
  | 'date'
  | 'number'
  | 'boolean'
  | 'choice'
  | 'person'
  | 'record'
  | 'list'
  | 'paragraph';

/** Every text of service a detail shows. The package writes none */
export interface DetailLabels {
  /** The accessible name of "—", the value that is not there */
  empty: string;

  /** A `true` and a `false` of a `boolean` value */
  yes: string;
  no: string;

  /** Name and tooltip of the copy button */
  copy: string;

  /** Announced once the value is copied, and once the copy fails */
  copied: string;
  copyFailed: string;

  /** The button that loads a section again after an error */
  retry: string;
}

export interface DetailProps extends BaseProps, Omit<React.ComponentProps<'div'>, 'ref'> {
  /** The texts of service, once for the whole detail */
  labels: DetailLabels;
}

export interface DetailSectionProps extends BaseProps, Omit<React.ComponentProps<'div'>, 'title' | 'ref'> {
  /** Without it the section is the only one of its detail, named by its container */
  title?: React.ReactNode;

  /** Defaults to 3, under the title of the drawer, dialog or page around the detail */
  headingLevel?: DetailHeadingLevel;

  /** The section arrives from a call of its own and is not there yet: real labels, a skeleton per value */
  loading?: boolean;

  /** The section could not be loaded: the message takes the place of its data, the rest stays */
  error?: React.ReactNode;

  /** Loads the section again. Without it the error has no button */
  onRetry?: () => void;
}

export type DetailGridProps = BaseProps & Omit<React.ComponentProps<'dl'>, 'ref'>;

export interface DetailItemProps extends BaseProps, Omit<React.ComponentProps<'div'>, 'children' | 'ref'> {
  /** The label above the value. Always given: with `hideLabel` it is still the accessible name */
  label: React.ReactNode;

  /** Gives the columns, from `DETAIL_SPAN`. Defaults to `text` */
  type?: DetailValueType;

  /**
   * The columns, overriding the type's: only for a reason said in review. The same contract as the
   * `span` of a `Field`, so the value and its field keep the same place: one value lets the grid decide
   * below 32rem of its own width, a map per breakpoint of the window is the caller's decision at every
   * width, `{ base: 6, md: 3, xl: 2 }`. A map without `base` starts from the type's columns
   */
  span?: Responsive<FieldSpan>;

  /** Starts a new row: the first of two related values, or a row that does not close. Per breakpoint too */
  breakBefore?: Responsive<boolean>;

  /**
   * The label is read and not shown: the only value of a section that is a collection, named by the
   * title of its section. The value then takes the whole row
   */
  hideLabel?: boolean;

  /** A button that copies the text of the value: emails, codes, phone numbers */
  copyable?: boolean;

  /**
   * The value, already formatted. `null`, `undefined` and the empty string are the value that is not
   * there; a boolean of a `boolean` value is written with `labels.yes` and `labels.no`
   */
  children?: React.ReactNode;
}

interface DetailState {
  readonly labels: DetailLabels;
  readonly announce: (text: string) => void;
}


/* --------
 * Constants Definition
 * -------- */

/**
 * The columns of each kind of value: the same as the field that edits it, so in edit the fields take
 * the place of the values and nothing moves. The text kinds are `FIELD_SPAN`'s.
 */
export const DETAIL_SPAN = {
  ...FIELD_SPAN,
  date     : 2,
  number   : 2,
  boolean  : 3,
  choice   : 3,
  person   : 4,
  record   : 4,
  list     : 4,
  paragraph: 6
} as const satisfies Readonly<Record<DetailValueType, FieldSpan>>;

const HEADING_ELEMENT = {
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6'
} as const;

/**
 * Written literally, so the scanner finds them. Below 32rem of grid (`@max-lg`, measured on the grid)
 * the short values take half a row and the others a whole one, as the fields of a form section.
 */
const SPAN_CLASSES: Readonly<Record<FieldSpan, string>> = {
  1: 'col-span-1 @max-lg:col-span-3',
  2: 'col-span-2 @max-lg:col-span-3',
  3: 'col-span-3 @max-lg:col-span-6',
  4: 'col-span-4 @max-lg:col-span-6',
  6: 'col-span-6'
};

/**
 * The span of a map, one class per breakpoint and no fallback: the caller decided every width. Each
 * one is declared in `theme.css`, since the scanner cannot read a class built here.
 */
function spanClasses(span: Responsive<FieldSpan>, typeSpan: FieldSpan): string[] {
  if (typeof span !== 'object') {
    return [ SPAN_CLASSES[span] ];
  }

  return responsiveClasses({ base: typeSpan, ...span }, (value) => `col-span-${value}`);
}

/** The new row, with `col-start-auto` undoing it at a breakpoint that does not want it */
function breakClasses(breakBefore: Responsive<boolean>): string[] {
  if (typeof breakBefore !== 'object') {
    return breakBefore ? [ 'col-start-1' ] : [];
  }

  return responsiveClasses(breakBefore, (value) => (value ? 'col-start-1' : 'col-start-auto'));
}

/** How long the check stays after a copy: a constant, not a prop */
const COPIED_FOR = 1500;

/**
 * The six columns of a form section, and the container its spans query (`@max-lg`). Written by hand:
 * the gap across is not the gap down, which one `gap` of Stack cannot say.
 */
// eslint-disable-next-line no-restricted-syntax -- gap-x differs from gap-y, and it is the container the spans query
const GRID = '@container grid grid-cols-6 gap-x-6 gap-y-5';

/** One value on the three rows of the grid it sits in, so a label that wraps keeps the values aligned */
// eslint-disable-next-line no-restricted-syntax -- a subgrid on the rows of the parent, which Stack cannot express
const ITEM = 'group/detail-item row-span-3 grid min-w-0 grid-rows-subgrid gap-y-1';


/* --------
 * Context Definition
 * -------- */

const [ DetailContext, useDetailContext ] = optionalContextBuilder<DetailState | null>('Detail', null);


const [ DetailSectionLoadingContext, useDetailSectionLoadingContext ] = optionalContextBuilder('DetailSectionLoading', false);


/* --------
 * Helpers
 * -------- */

function useDetail(part: string): DetailState {
  const state = useDetailContext();

  if (!state) {
    throw new Error(`${part} must be rendered inside a Detail`);
  }

  return state;
}


/* --------
 * Glyphs
 * -------- */

function CopyGlyph(): React.ReactNode {
  return (
    <svg viewBox={'0 0 24 24'} fill={'none'} stroke={'currentColor'} strokeWidth={1.75} strokeLinecap={'round'} strokeLinejoin={'round'} aria-hidden={'true'} focusable={'false'} className={'size-3.5'}>
      <rect width={'14'} height={'14'} x={'8'} y={'8'} rx={'2'} ry={'2'} />
      <path d={'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2'} />
    </svg>
  );
}


function CopiedGlyph(): React.ReactNode {
  return (
    <svg viewBox={'0 0 24 24'} fill={'none'} stroke={'currentColor'} strokeWidth={2} strokeLinecap={'round'} strokeLinejoin={'round'} aria-hidden={'true'} focusable={'false'} className={'size-3.5 text-success-soft-foreground'}>
      <path d={'M20 6 9 17l-5-5'} />
    </svg>
  );
}


/* --------
 * Parts
 * -------- */

/**
 * A group of values with a title, the same as the section of the form of the same record, in the same
 * order. Two sections in a row are separated by a rule with room on both sides.
 *
 * A `div` with `role="group"` named by its title, not a `section`: a named section is a landmark.
 *
 * Slots: `detail-section` (with `data-heading-level`, `data-loading`, `data-error`), `detail-section-title`,
 * `detail-section-error`.
 */
const DetailSection = React.forwardRef<HTMLDivElement, DetailSectionProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    className,
    error,
    headingLevel = 3,
    loading = false,
    onRetry,
    title,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const { labels } = useDetail('Detail.Section');
  const titleId = React.useId();


  // ----
  // Component Render
  // ----
  const hasTitle = isPresent(title);
  const hasError = isPresent(error);
  const Title = HEADING_ELEMENT[headingLevel];

  return (
    <Stack
      {...rest}
      ref={ref}
      data-slot={'detail-section'}
      data-heading-level={headingLevel}
      data-loading={loading || undefined}
      data-error={hasError || undefined}
      role={hasTitle ? 'group' : undefined}
      aria-labelledby={hasTitle ? titleId : undefined}
      aria-busy={loading || undefined}
      gap={3}
      className={cn(
        'border-border',
        '[[data-slot=detail-section]+&]:mt-6 [[data-slot=detail-section]+&]:border-t [[data-slot=detail-section]+&]:pt-6',
        baseClasses,
        className
      )}
    >
      {hasTitle && (
        <Title id={titleId} data-slot={'detail-section-title'} className={'text-sm font-semibold text-foreground'}>
          {title}
        </Title>
      )}

      {hasError
        ? (
          <Stack data-slot={'detail-section-error'} align={'start'} gap={2}>
            <EmptyState size={'inline'} kind={'error'} title={error} />
            {onRetry && <Button size={'sm'} fill={'solid'} tone={'secondary'} onClick={onRetry}>{labels.retry}</Button>}
          </Stack>
        )
        : (
          <DetailSectionLoadingContext.Provider value={loading}>
            {children}
          </DetailSectionLoadingContext.Provider>
        )}
    </Stack>
  );

});

DetailSection.displayName = 'Detail.Section';


/**
 * The six columns of a form section, as a description list. Each value takes the columns of the field
 * of its kind, so a detail and its form line up.
 *
 * The grid **is** the list, so a class on it reaches the columns, as on `Form.Section`.
 *
 * Slots: `detail-grid`.
 */
const DetailGrid = React.forwardRef<HTMLDListElement, DetailGridProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const { className, ...others } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  return (
    <dl
      {...rest}
      ref={ref}
      data-slot={'detail-grid'}
      className={cn(GRID, baseClasses, className)}
    />
  );

});

DetailGrid.displayName = 'Detail.Grid';


/**
 * One value with its label above, on the three tracks of a field of a form section: label, value, an
 * empty track where the field has its messages. That is what keeps a detail and its form aligned when
 * a label wraps.
 *
 * Slots: `detail-item` (with `data-type`, `data-span`, `data-break-before`, `data-empty`,
 * `data-label-hidden`, `data-copyable`), `label`, `detail-value`, `detail-value-text`, `detail-empty`,
 * `detail-copy`, `detail-skeleton`.
 */
const DetailItem = React.forwardRef<HTMLDivElement, DetailItemProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    breakBefore = false,
    children,
    className,
    copyable = false,
    hideLabel = false,
    label,
    span,
    type = 'text',
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const { announce, labels } = useDetail('Detail.Item');
  const loading = useDetailSectionLoadingContext();


  // ----
  // Internal State
  // ----
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [ copied, setCopied ] = React.useState(false);


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timer = window.setTimeout(() => setCopied(false), COPIED_FOR);

    return () => window.clearTimeout(timer);
  }, [ copied ]);


  // ----
  // Handlers
  // ----
  const handleCopy = (): void => {
    const text = textRef.current?.innerText ?? '';

    /*
     * The clipboard exists only in a secure context: on a plain http intranet `navigator.clipboard`
     * is undefined, and calling it threw before the `catch` below could say the copy had failed.
     */
    const clipboard = navigator.clipboard as Clipboard | undefined;

    if (!clipboard) {
      announce(labels.copyFailed);
      return;
    }

    clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        announce(labels.copied);
      })
      .catch(() => announce(labels.copyFailed));
  };


  // ----
  // Component Render
  // ----
  const resolvedSpan: Responsive<FieldSpan> = hideLabel ? 6 : (span ?? DETAIL_SPAN[type]);
  const baseSpan = typeof resolvedSpan === 'object' ? (toResponsiveMap(resolvedSpan).base ?? DETAIL_SPAN[type]) : resolvedSpan;
  const baseBreak = typeof breakBefore === 'object' ? toResponsiveMap(breakBefore).base : breakBefore;
  const value = typeof children === 'boolean' ? (children ? labels.yes : labels.no) : children;
  const empty = !isPresent(value);

  const renderValue = (): React.ReactNode => {
    if (loading) {
      return (
        <span
          data-slot={'detail-skeleton'}
          aria-hidden={'true'}
          className={'block h-2.5 w-2/5 rounded-sm bg-secondary animate-pulse motion-reduce:animate-none'}
        />
      );
    }

    if (empty) {
      return (
        <React.Fragment>
          <span data-slot={'detail-empty'} aria-hidden={'true'} className={'text-muted-foreground'}>—</span>
          <span className={'sr-only'}>{labels.empty}</span>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <span
          ref={textRef}
          data-slot={'detail-value-text'}
          className={cn('min-w-0 wrap-anywhere', type === 'paragraph' && 'max-w-prose whitespace-pre-line')}
        >
          {value}
        </span>

        {copyable && (
          <Tooltip content={labels.copy}>
            <Button
              data-slot={'detail-copy'}
              size={'sm'}
              fill={'plain'}
              tone={'muted'}
              aria-label={labels.copy}
              leading={copied ? <CopiedGlyph /> : <CopyGlyph />}
              className={cn(
                'ms-auto shrink-0 opacity-0',
                'group-hover/detail-item:opacity-100 group-focus-within/detail-item:opacity-100 focus-visible:opacity-100',
                copied && 'opacity-100'
              )}
              onClick={handleCopy}
            />
          </Tooltip>
        )}
      </React.Fragment>
    );
  };

  return (
    <div
      {...rest}
      ref={ref}
      data-slot={'detail-item'}
      data-type={type}
      data-span={baseSpan}
      data-break-before={baseBreak || undefined}
      data-empty={(!loading && empty) || undefined}
      data-label-hidden={hideLabel || undefined}
      data-copyable={copyable || undefined}
      className={cn(
        ITEM,
        spanClasses(resolvedSpan, DETAIL_SPAN[type]),
        breakClasses(breakBefore),
        baseClasses,
        className
      )}
    >
      <Label as={'dt'} emphasis={'quiet'} className={cn('self-end', hideLabel && 'sr-only')}>
        {label}
      </Label>

      <Stack
        as={'dd'}
        data-slot={'detail-value'}
        direction={'horizontal'}
        align={type === 'paragraph' || type === 'list' ? 'start' : 'center'}
        gap={2}
        className={cn(
          'm-0 min-h-control-md min-w-0 text-sm text-foreground',
          (type === 'paragraph' || type === 'list') && 'py-1.5'
        )}
      >
        {renderValue()}
      </Stack>
    </div>
  );

});

DetailItem.displayName = 'Detail.Item';


/* --------
 * Component Definition
 * -------- */

/**
 * The read-only content of a record: sections with a title, values with their label above, on the
 * grid of six of a form section. It is a content, not a container: it stands in a drawer, a dialog or
 * a page and does not know which.
 *
 * ```tsx
 * <Detail labels={detailLabels}>
 *   <Detail.Section title={'Account'}>
 *     <Detail.Grid>
 *       <Detail.Item label={'Surname'}>{account.surname}</Detail.Item>
 *       <Detail.Item label={'Email'} type={'text-long'} copyable>{account.email}</Detail.Item>
 *       <Detail.Item label={'Two factors'} type={'boolean'} breakBefore>{account.twoFactors}</Detail.Item>
 *     </Detail.Grid>
 *   </Detail.Section>
 * </Detail>
 * ```
 *
 * The values arrive already formatted. The texts of service arrive once, in `labels`: the package
 * writes no string. The `status` region that announces a copy is always mounted, one per detail.
 *
 * Slots: `detail`, `detail-status`.
 */
const DetailRoot = React.forwardRef<HTMLDivElement, DetailProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const { children, className, labels, ...others } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal State
  // ----
  const [ announcement, announce ] = useAnnouncer();


  // ----
  // Memoized Data
  // ----
  const state = React.useMemo<DetailState>(() => ({ labels, announce }), [ labels, announce ]);


  // ----
  // Component Render
  // ----
  return (
    <Stack gap={0} {...rest} ref={ref} data-slot={'detail'} className={cn(baseClasses, className)}>
      <DetailContext.Provider value={state}>
        {children}
      </DetailContext.Provider>

      <span data-slot={'detail-status'} role={'status'} className={'sr-only'}>{announcement}</span>
    </Stack>
  );

});

DetailRoot.displayName = 'Detail';

export const Detail = Object.assign(DetailRoot, {
  Section: DetailSection,
  Grid   : DetailGrid,
  Item   : DetailItem
});
