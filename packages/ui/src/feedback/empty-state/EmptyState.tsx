'use client';

import * as React from 'react';

import { optionalContextBuilder } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';
import { TONE_CLASSES } from '../../core/tone';

import { Stack } from '../../layout/Stack';

import { IconBox } from '../../display/icon-box/IconBox';

import type { BaseProps } from '../../core/base';
import type { PolymorphicProps } from '../../core/polymorphic';
import type { Tone } from '../../core/tone';

import type { IconBoxProps } from '../../display/icon-box/IconBox';


/* --------
 * Types Definition
 * -------- */

/** `page` fills the area of a page, `panel` a card or a table, `inline` is one line of text */
export type EmptyStateSize = 'page' | 'panel' | 'inline';

export interface StrictEmptyStateProps extends BaseProps {
  /** Defaults to `panel` */
  size?: EmptyStateSize;

  /**
   * The tone of the case: the box of the icon, and the ink of an `inline` one. `muted` for an empty list
   * or a search with nothing, `primary` for a first use, `destructive` for a failure. Defaults to `muted`
   */
  tone?: Tone;

  /** `EmptyState.Icon`, `.Title`, `.Description`, `.Actions` */
  children?: React.ReactNode;

  className?: string;
}

export type EmptyStateProps = StrictEmptyStateProps & Omit<React.ComponentProps<'div'>, keyof StrictEmptyStateProps>;

/** The props of an IconBox but its size, which is the empty state's; its tone defaults to the empty state's */
export type EmptyStateIconProps = Omit<IconBoxProps<'span'>, 'size' | 'as'>;

export interface StrictEmptyStateTitleProps extends BaseProps {
  children?: React.ReactNode;
}

/**
 * The title, a `div` by default: `as={'h2'}` where the outline of the page makes it a heading. It takes the
 * focus (`tabIndex={-1}`) for a dialog that moves it there on a failure, through its `ref`
 */
export type EmptyStateTitleProps<E extends React.ElementType = 'div'> = PolymorphicProps<E, StrictEmptyStateTitleProps>;

export type EmptyStateDescriptionProps = BaseProps & React.ComponentProps<'p'>;

export type EmptyStateActionsProps = BaseProps & React.ComponentProps<'div'>;

interface EmptyStateSettings {
  readonly size: EmptyStateSize;
  readonly tone: Tone;
}


/* --------
 * Constants Definition
 * -------- */

const DEFAULT_VARIANTS = {
  size: 'panel',
  tone: 'muted'
} as const;

const LAYOUT = {
  page: {
    root : 'px-6 py-12 text-center',
    icon : 'mb-4',
    title: 'max-w-110 font-heading text-xl font-semibold text-foreground',
    text : 'mt-2 max-w-110 text-sm text-muted-foreground',
    acts : 'mt-6'
  },
  panel: {
    root : 'px-4 py-8 text-center',
    icon : 'mb-3',
    title: 'max-w-90 font-heading text-sm font-semibold text-foreground',
    text : 'mt-1 max-w-90 text-xs text-muted-foreground',
    acts : 'mt-3'
  }
} as const;

/** One line: the ink of the tone, the quiet one for `muted` */
const INLINE_INK: Readonly<Record<Tone, string>> = {
  ...TONE_CLASSES.plain,
  muted      : 'text-muted-foreground',
  destructive: 'text-destructive'
};


/* --------
 * Context Definition
 * -------- */

const [ EmptyStateContext, useEmptyState ] = optionalContextBuilder<EmptyStateSettings>('EmptyState', DEFAULT_VARIANTS);


/* --------
 * Parts
 * -------- */

/**
 * The icon, in a box of the tone: what it is about, never what to do. An `IconBox` whose size follows the
 * empty state; in an `inline` one, the glyph alone, one line tall, in the ink of the line.
 */
function EmptyStateIcon(props: EmptyStateIconProps): React.ReactNode {
  const { children, className, tone, ...rest } = props;
  const settings = useEmptyState();

  if (settings.size === 'inline') {
    return (
      <Stack gap={0} as={'span'} data-slot={'empty-state-icon'} inline direction={'horizontal'} align={'center'} className={cn('h-4 shrink-0 [&_svg]:size-3.5', className)}>
        {children}
      </Stack>
    );
  }

  return (
    <IconBox
      data-slot={'empty-state-icon'}
      size={settings.size === 'page' ? 'md' : 'sm'}
      fill={'soft'}
      tone={tone ?? settings.tone}
      className={cn(LAYOUT[settings.size].icon, className)}
      {...rest}
    >
      {children}
    </IconBox>
  );
}

EmptyStateIcon.displayName = 'EmptyState.Icon';


/** The fact, with the entity: "No contract for “rossy”". In an `inline` empty state, the whole line */
function EmptyStateTitle<E extends React.ElementType = 'div'>(props: EmptyStateTitleProps<E>): React.ReactNode {
  const { as: Component = 'div', className, ...others } = props as EmptyStateTitleProps<'div'>;
  const { baseClasses, rest } = splitBaseProps(others);
  const { size } = useEmptyState();

  return (
    <Component
      tabIndex={-1}
      data-slot={'empty-state-title'}
      className={cn('outline-none', size !== 'inline' && LAYOUT[size].title, baseClasses, className)}
      {...rest}
    />
  );
}

EmptyStateTitle.displayName = 'EmptyState.Title';


/** What to do, in one sentence. Not rendered by an `inline` empty state, which is one line */
function EmptyStateDescription(props: EmptyStateDescriptionProps): React.ReactNode {
  const { className, ...others } = props;
  const { baseClasses, rest } = splitBaseProps(others);
  const { size } = useEmptyState();

  if (size === 'inline') {
    return null;
  }

  return <p data-slot={'empty-state-description'} className={cn(LAYOUT[size].text, baseClasses, className)} {...rest} />;
}

EmptyStateDescription.displayName = 'EmptyState.Description';


/**
 * The actions, centred and wrapping: the Buttons are yours, one to fix it and one to go elsewhere at most.
 * A `md` button on a page, `sm` in a panel. Not rendered by an `inline` empty state
 */
function EmptyStateActions(props: EmptyStateActionsProps): React.ReactNode {
  const { className, ...others } = props;
  const { baseClasses, rest } = splitBaseProps(others);
  const { size } = useEmptyState();

  if (size === 'inline') {
    return null;
  }

  return (
    <Stack
      {...rest}
      data-slot={'empty-state-actions'}
      direction={'horizontal'}
      wrap
      justify={'center'}
      gap={2}
      className={cn(LAYOUT[size].acts, baseClasses, className)}
    />
  );
}

EmptyStateActions.displayName = 'EmptyState.Actions';


/* --------
 * Component Definition
 * -------- */

/**
 * What shows when there is nothing to show: an area with no data on first use, a search with no results,
 * a load that failed, an item that is not there. A composition, like every other component: the parts
 * say what the case is, the application writes its own empty states.
 *
 * ```tsx
 * <EmptyState size={'page'} tone={'primary'}>
 *   <EmptyState.Icon><Truck /></EmptyState.Icon>
 *   <EmptyState.Title as={'h2'}>No vehicle yet</EmptyState.Title>
 *   <EmptyState.Description>Add the first one to plan a round.</EmptyState.Description>
 *   <EmptyState.Actions><Button leading={<Plus />}>Add a vehicle</Button></EmptyState.Actions>
 * </EmptyState>
 * ```
 *
 * `size` lays out every part (the box of the icon, the type of the title and of the text, the room), and
 * `tone` colours the box, or the line of an `inline` one. It has no role: the container announces it,
 * once. The title takes the focus (`tabIndex={-1}`), for a dialog that moves it there on a failure.
 *
 * Parts with a slot: `empty-state` (with `data-size`, `data-tone`), `empty-state-icon`,
 * `empty-state-title`, `empty-state-description`, `empty-state-actions`.
 */
function EmptyStateRoot(props: EmptyStateProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    children,
    className,
    size = DEFAULT_VARIANTS.size,
    tone = DEFAULT_VARIANTS.tone,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Component Render
  // ----
  const settings: EmptyStateSettings = { size, tone };

  if (size === 'inline') {
    return (
      <EmptyStateContext.Provider value={settings}>
        <Stack
          {...rest}
          data-slot={'empty-state'}
          data-size={size}
          data-tone={tone}
          direction={'horizontal'}
          align={'start'}
          gap={1.5}
          className={cn('text-xs wrap-anywhere', INLINE_INK[tone], baseClasses, className)}
        >
          {children}
        </Stack>
      </EmptyStateContext.Provider>
    );
  }

  return (
    <EmptyStateContext.Provider value={settings}>
      <Stack
        gap={0}
        {...rest}
        data-slot={'empty-state'}
        data-size={size}
        data-tone={tone}
        align={'center'}
        className={cn('wrap-anywhere', LAYOUT[size].root, baseClasses, className)}
      >
        {children}
      </Stack>
    </EmptyStateContext.Provider>
  );

}

EmptyStateRoot.displayName = 'EmptyState';

export const EmptyState = Object.assign(EmptyStateRoot, {
  Actions    : EmptyStateActions,
  Description: EmptyStateDescription,
  Icon       : EmptyStateIcon,
  Title      : EmptyStateTitle
});
