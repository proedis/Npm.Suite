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

  /** A summary after the title, always with its unit: "12 entries", never "12" */
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
 * A section that opens and closes from its header: an arrow, the title, a summary, the actions at the
 * end, then the body. A piece of layout, not a container: it stands in a form, a detail or a page.
 *
 * ```tsx
 * <CollapsibleSection title={'History'} meta={'12 entries'} actions={<Button size={'sm'}>Add</Button>}>
 *   …
 * </CollapsibleSection>
 * ```
 *
 * The header is a real heading with a full width button inside, so the sections can be browsed by
 * their headings even when closed; the actions are siblings of the heading. Closed by default and not
 * remembered between visits. No animation of the height, since a body can be dozens of rows long: the
 * arrow turns, and not even that with reduced motion.
 *
 * On Base UI's `Collapsible`, which owns `aria-expanded`, `aria-controls` and the hidden body.
 * Several sections open together need no group, so not its `Accordion`.
 *
 * Slots: `collapsible-section` (with `data-open`), `collapsible-section-header`,
 * `collapsible-section-trigger`, `collapsible-section-chevron`, `collapsible-section-title`,
 * `collapsible-section-meta`, `collapsible-section-actions`, `collapsible-section-panel`.
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
    keepMounted = false,
    meta,
    onOpenChange,
    open,
    title,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


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
  const hasMeta = meta !== null && meta !== undefined && meta !== false && meta !== '';

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={handleOpenChange}
      render={(
        <div
          {...rest}
          data-slot={'collapsible-section'}
          data-open={isOpen || undefined}
          className={cn('border-t border-border last:border-b', baseClasses, className)}
        />
      )}
    >
      <div data-slot={'collapsible-section-header'} className={'flex min-h-10 items-center gap-2'}>
        <Title className={'m-0 min-w-0 flex-1 text-sm'}>
          <Collapsible.Trigger
            data-slot={'collapsible-section-trigger'}
            className={cn(
              'group/collapsible-trigger flex min-h-10 w-full items-center gap-2 rounded-md py-2 pe-2 text-start',
              'font-semibold text-foreground',
              'hover:bg-foreground/8',
              'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
            )}
          >
            <ChevronGlyph />
            <span data-slot={'collapsible-section-title'} className={'min-w-0'}>{title}</span>
            {hasMeta && (
              <span data-slot={'collapsible-section-meta'} className={'shrink-0 text-xs font-normal text-muted-foreground'}>
                {meta}
              </span>
            )}
          </Collapsible.Trigger>
        </Title>

        {actions && (
          <div data-slot={'collapsible-section-actions'} className={'flex shrink-0 items-center gap-1'}>
            {actions}
          </div>
        )}
      </div>

      <Collapsible.Panel
        keepMounted={keepMounted}
        data-slot={'collapsible-section-panel'}
        className={'ps-6 pb-4'}
      >
        {children}
      </Collapsible.Panel>
    </Collapsible.Root>
  );

}

CollapsibleSection.displayName = 'CollapsibleSection';
