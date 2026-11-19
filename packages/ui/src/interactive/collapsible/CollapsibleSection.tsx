'use client';

import * as React from 'react';

import { Collapsible } from '@base-ui/react/collapsible';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import type { BaseProps } from '../../core/base';


/* --------
 * Types Definition
 * -------- */

export type CollapsibleSectionHeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface CollapsibleSectionProps extends BaseProps, Omit<React.ComponentProps<'div'>, 'title'> {
  /** The title of the section, inside the button that opens it */
  title: React.ReactNode;

  /** A mark right after the title: "modified", with its dot */
  status?: React.ReactNode;

  /** A summary at the end of the button, always with its unit: "12 entries", never "12" */
  meta?: React.ReactNode;

  /** Controls at the end of the header, outside the button: never a control inside another */
  actions?: React.ReactNode;

  /** Open, controlled */
  open?: boolean;

  /** Open at first, uncontrolled. Defaults to closed */
  defaultOpen?: boolean;

  onOpenChange?: (open: boolean) => void;

  /** Defaults to 3, under the title of the container */
  headingLevel?: CollapsibleSectionHeadingLevel;

  /**
   * Keeps the body mounted and hidden while closed. For a body with fields: they keep their value and
   * the validation still sees them. Off by default, when a closed body is not in the document
   */
  keepMounted?: boolean;

  /**
   * The header runs edge to edge of a card: the padding of the card inside the button, a focus ring
   * inside it (one outside would be cut), and a body that takes the whole width and places its own
   * content. The groups of a `CheckboxGrid`
   */
  inset?: boolean;
}


/* --------
 * Constants Definition
 * -------- */

const HEADING_ELEMENT = {
  2: 'h2',
  3: 'h3',
  4: 'h4',
  5: 'h5',
  6: 'h6'
} as const;


/* --------
 * Helpers
 * -------- */

function hasNode(node: React.ReactNode): boolean {
  return node !== null && node !== undefined && node !== false && node !== '';
}


/* --------
 * Glyphs
 * -------- */

function ChevronGlyph(): React.ReactNode {
  return (
    <svg
      data-slot={'collapsible-section-chevron'}
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={1.75}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
      focusable={'false'}
      className={cn(
        'size-4 shrink-0 text-muted-foreground transition-transform duration-100 motion-reduce:transition-none',
        'group-data-panel-open/collapsible-trigger:rotate-90'
      )}
    >
      <path d={'m9 18 6-6-6-6'} />
    </svg>
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * A section that opens and closes from its header: an arrow, the title, a mark, the summary on the
 * right, the actions at the end, then the body. A piece of layout, not a container: it stands in a
 * form, a detail or a page.
 *
 * ```tsx
 * <CollapsibleSection title={'History'} meta={'12 entries'} actions={<Button size={'sm'}>Add entry</Button>}>
 *   …
 * </CollapsibleSection>
 * ```
 *
 * The header is a real heading with a full width button inside, so the sections can be browsed by
 * their headings even when closed; the actions are siblings of the heading. The name of the button is
 * title, mark and summary, joined with `aria-labelledby` so the package adds no word of its own. A long
 * title wraps, the arrow stays on its first line. Closed by default and not remembered between visits.
 * No animation of the height, since a body can be dozens of rows long: the arrow turns, and not even
 * that with reduced motion.
 *
 * On Base UI's `Collapsible`, which owns `aria-expanded`, `aria-controls` and the hidden body.
 * Several sections open together need no group, so not its `Accordion`.
 *
 * Slots: `collapsible-section` (with `data-open`, `data-inset`), `collapsible-section-header`,
 * `collapsible-section-trigger`, `collapsible-section-chevron`, `collapsible-section-title`,
 * `collapsible-section-status`, `collapsible-section-meta`, `collapsible-section-actions`,
 * `collapsible-section-panel`.
 */
export function CollapsibleSection(props: CollapsibleSectionProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    actions,
    children,
    className,
    defaultOpen = false,
    headingLevel = 3,
    inset = false,
    keepMounted = false,
    meta,
    onOpenChange,
    open,
    status,
    title,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const uid = React.useId();


  // ----
  // Internal State
  // ----
  /* Mirrored only to report `data-open` on the root: Base UI owns the state */
  const [ uncontrolledOpen, setUncontrolledOpen ] = React.useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;


  // ----
  // Handlers
  // ----
  const handleOpenChange = (next: boolean): void => {
    setUncontrolledOpen(next);
    onOpenChange?.(next);
  };


  // ----
  // Component Render
  // ----
  const Title = HEADING_ELEMENT[headingLevel];
  const hasStatus = hasNode(status);
  const hasMeta = hasNode(meta);
  const titleId = `${uid}-title`;
  const statusId = `${uid}-status`;
  const metaId = `${uid}-meta`;
  const labelledBy = [ titleId, hasStatus && statusId, hasMeta && metaId ].filter(Boolean).join(' ');

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={handleOpenChange}
      render={(
        <div
          {...rest}
          data-slot={'collapsible-section'}
          data-open={isOpen || undefined}
          data-inset={inset || undefined}
          className={cn('border-t border-border last:border-b', baseClasses, className)}
        />
      )}
    >
      <div data-slot={'collapsible-section-header'} className={'flex min-h-10 items-center gap-2'}>
        <Title className={cn('my-0 me-0 min-w-0 flex-1 text-sm', inset ? 'ms-0' : '-ms-2')}>
          <Collapsible.Trigger
            data-slot={'collapsible-section-trigger'}
            aria-labelledby={labelledBy}
            className={cn(
              'group/collapsible-trigger flex min-h-10 w-full items-start gap-2 py-2.5 text-start',
              'font-semibold text-foreground',
              'hover:bg-foreground/8',
              'outline-none focus-visible:outline-2 focus-visible:outline-ring',
              inset
                ? 'px-6 focus-visible:-outline-offset-2'
                : 'rounded-md px-2 focus-visible:outline-offset-2'
            )}
          >
            <span className={'flex h-5 shrink-0 items-center'}><ChevronGlyph /></span>
            <span id={titleId} data-slot={'collapsible-section-title'} className={'min-w-0'}>{title}</span>
            {hasStatus && (
              <span
                id={statusId}
                data-slot={'collapsible-section-status'}
                className={'flex h-5 shrink-0 items-center gap-1.5 text-xs font-normal text-primary-soft-foreground'}
              >
                {status}
              </span>
            )}
            {hasMeta && (
              <span
                id={metaId}
                data-slot={'collapsible-section-meta'}
                className={'ms-auto flex h-5 shrink-0 items-center ps-2 text-xs font-normal text-muted-foreground'}
              >
                {meta}
              </span>
            )}
          </Collapsible.Trigger>
        </Title>

        {actions && (
          <div data-slot={'collapsible-section-actions'} className={cn('flex shrink-0 items-center gap-1', inset && 'pe-6')}>
            {actions}
          </div>
        )}
      </div>

      <Collapsible.Panel
        keepMounted={keepMounted}
        data-slot={'collapsible-section-panel'}
        className={inset ? undefined : 'ps-6 pb-4'}
      >
        {children}
      </Collapsible.Panel>
    </Collapsible.Root>
  );

}

CollapsibleSection.displayName = 'CollapsibleSection';
