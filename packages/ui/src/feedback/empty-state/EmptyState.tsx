'use client';

import * as React from 'react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { ClearGlyph, ToneGlyph } from '../../internal/glyphs';

import { Button } from '../../actions/button/Button';

import { IconBox } from '../../display/icon-box/IconBox';


import type { BaseProps } from '../../core/base';
import type { LinkTarget } from '../../core/link';

import type { ButtonProps } from '../../actions/button/Button';


/* --------
 * Types Definition
 * -------- */

export type EmptyStateSize = 'page' | 'panel' | 'inline';

/** The case: it fixes the tone of the box and the recipe of the actions */
export type EmptyStateKind = 'first-use' | 'no-results' | 'error' | 'not-found' | 'invalid-view';

/** What an action does: the component picks its fill and size from it */
export type EmptyStateActionRole = 'create' | 'clear' | 'retry' | 'back';

export interface EmptyStateAction {
  label: string;

  /** `clear` always carries one; when it is missing the x is drawn */
  icon?: React.ReactNode;

  role: EmptyStateActionRole;

  /** One of the two: a function, or a destination rendered as a real link */
  onClick?: () => void;
  target?: LinkTarget;
}

interface CommonEmptyStateProps extends BaseProps {
  kind: EmptyStateKind;

  /** The fact, with the entity: "No contract for «rossy»". In `inline` it is the only text */
  title: React.ReactNode;

  className?: string;
}

/**
 * The actions of an empty state, at most two: one to fix it, one to go elsewhere. A tuple, so a third
 * does not compile; it used to be dropped without a word.
 */
export type EmptyStateActions = readonly [] | readonly [EmptyStateAction] | readonly [EmptyStateAction, EmptyStateAction];

type SizedEmptyStateProps =
  | {
    size: 'page';

    /** What it is about, never what to do: the icon of the entity for a first use */
    icon: React.ReactNode;

    /** What to do, in one sentence */
    description?: React.ReactNode;

    /** At most two */
    actions?: EmptyStateActions;

    /** The level of the title, which is a heading of the page */
    headingLevel: 2 | 3 | 4;
  }
  | {
    size?: 'panel';
    icon: React.ReactNode;
    description?: React.ReactNode;
    actions?: EmptyStateActions;
    headingLevel?: never;
  }
  | {
    size: 'inline';
    icon?: never;
    description?: never;
    actions?: never;
    headingLevel?: never;
  };

/** The native props of a `<div>` reach the root; the ref is the title's, which takes the focus */
export type EmptyStateProps = CommonEmptyStateProps & SizedEmptyStateProps & Omit<
  React.ComponentProps<'div'>,
  keyof CommonEmptyStateProps | 'size' | 'icon' | 'description' | 'actions' | 'headingLevel' | 'ref' | 'children'
>;


/* --------
 * Constants Definition
 * -------- */

const BOX_TONE = {
  'first-use'   : 'primary',
  'no-results'  : 'muted',
  error       : 'destructive',
  'not-found'   : 'muted',
  'invalid-view': 'muted'
} as const satisfies Record<EmptyStateKind, string>;

const LAYOUT = {
  page: {
    root : 'px-6 py-12 text-center',
    box  : 'mb-4',
    title: 'max-w-110 text-xl font-semibold text-foreground',
    text : 'mt-2 max-w-110 text-sm text-muted-foreground',
    acts : 'mt-6'
  },
  panel: {
    root : 'px-4 py-8 text-center',
    box  : 'mb-3',
    title: 'max-w-90 text-sm font-semibold text-foreground',
    text : 'mt-1 max-w-90 text-xs text-muted-foreground',
    acts : 'mt-3'
  }
} as const;


/* --------
 * Helpers
 * -------- */

/** Fill and tone of an action, from its role; the size from the empty state's */
function actionLook(role: EmptyStateActionRole, size: 'page' | 'panel'): Pick<ButtonProps, 'fill' | 'tone'> {
  switch (role) {
    case 'create':
      return { fill: size === 'page' ? 'solid' : 'soft', tone: 'primary' };
    case 'clear':
      return { fill: 'plain', tone: 'destructive' };
    default:
      return { fill: 'solid', tone: 'secondary' };
  }
}


/* --------
 * Component Definition
 * -------- */

/**
 * What shows when there is nothing to show: an area with no data on first use, a search with no
 * results, a load that failed, an item that is not there. Three sizes (page, panel, row) and five
 * cases that fix the tone and the actions.
 *
 * ```tsx
 * <EmptyState
 *   kind={'no-results'}
 *   icon={<Search />}
 *   title={'No contract for «rossy»'}
 *   description={'Check the spelling or clear the filters.'}
 *   actions={[ { role: 'clear', label: 'Clear filters', onClick: clearFilters } ]}
 * />
 * ```
 *
 * The case gives the tone (`first-use` primary, `error` destructive, the others muted) and the
 * actions their fill: create `solid primary` on a page and `soft` in a panel, clear `plain
 * destructive` with its icon, retry and back `solid secondary`. A `target` renders a real link.
 * `inline` is a line of text, in `destructive` with the error circle for an error.
 *
 * It has no role: the container announces it, once. The ref goes to the title, which takes the focus
 * (`tabIndex={-1}`): a dialog gives it the focus on an error or a missing item.
 *
 * Parts with a slot: `empty-state` (with `data-size`, `data-kind`), `empty-state-icon`,
 * `empty-state-title`, `empty-state-description`, `empty-state-actions`.
 */
export const EmptyState = React.forwardRef<HTMLElement, EmptyStateProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    actions = [],
    className,
    description,
    headingLevel,
    icon,
    kind,
    size = 'panel',
    title,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  if (size === 'inline') {
    const isError = kind === 'error';

    return (
      <Stack
        {...rest}
        data-slot={'empty-state'}
        data-size={size}
        data-kind={kind}
        direction={'horizontal'}
        align={'start'}
        gap={1.5}
        className={cn('text-xs wrap-anywhere', isError ? 'text-destructive' : 'text-muted-foreground', baseClasses, className)}
      >
        {isError && <ToneGlyph tone={'destructive'} className={'mt-px size-3.5 shrink-0'} />}
        <span ref={ref as React.Ref<HTMLSpanElement>} tabIndex={-1} data-slot={'empty-state-title'} className={'outline-none'}>
          {title}
        </span>
      </Stack>
    );
  }

  const layout = LAYOUT[size];
  const TitleTag = size === 'page' && headingLevel ? (`h${headingLevel}` as const) : 'div';
  const buttonSize = size === 'page' ? 'md' : 'sm';

  return (
    <Stack
      {...rest}
      data-slot={'empty-state'}
      data-size={size}
      data-kind={kind}
      align={'center'}
      className={cn('wrap-anywhere', layout.root, baseClasses, className)}
    >
      <IconBox data-slot={'empty-state-icon'} size={size === 'page' ? 'md' : 'sm'} fill={'soft'} tone={BOX_TONE[kind]} className={layout.box}>
        {icon}
      </IconBox>

      <TitleTag ref={ref as React.Ref<HTMLHeadingElement>} tabIndex={-1} data-slot={'empty-state-title'} className={cn('outline-none', layout.title)}>
        {title}
      </TitleTag>

      {description !== null && description !== undefined && description !== '' && (
        <p data-slot={'empty-state-description'} className={layout.text}>{description}</p>
      )}

      {actions.length > 0 && (
        <Stack data-slot={'empty-state-actions'} direction={'horizontal'} wrap justify={'center'} gap={2} className={layout.acts}>
          {actions.slice(0, 2).map((action) => (
            <Button
              key={action.label}
              {...actionLook(action.role, size)}
              size={buttonSize}
              to={action.target}
              leading={action.icon ?? (action.role === 'clear' ? <ClearGlyph /> : undefined)}
              onClick={action.target ? undefined : action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </Stack>
      )}
    </Stack>
  );

});

EmptyState.displayName = 'EmptyState';
