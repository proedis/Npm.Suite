import * as React from 'react';

import { cn } from '../../core/cn';

import { Stack } from '../../layout/Stack';

import { VisuallyHidden } from '../../primitives/VisuallyHidden';

import { IconButton } from '../../actions/button/IconButton';
import { LIST_CHIP, OverflowTooltipList } from '../../actions/list-panel/listPanel';
import { Tooltip } from '../../actions/tooltip/Tooltip';
import { ClearGlyph, ErrorGlyph } from '../../internal/glyphs';

import type { ComboboxItem } from '../combobox/comboboxTypes';


/*
 * What the fields that open a list share beyond its look: the chips of a multiple field and their
 * "+N", the "Retry" item, the messages and the `status` text of a list fed by a server, and the press
 * on the frame that opens the list. Private to the package. The look itself is
 * `actions/list-panel`, which Menu and Tabs share too.
 */


/* --------
 * Types Definition
 * -------- */

/** The labels of a list fed by a server, as Combobox and the remote filter of FiltersBar both declare them */
export interface RemoteListLabels {
  readonly minChars: string;
  readonly searching: string;
  readonly error: string;
  readonly results: (count: number) => string;
  readonly noResults: (text: string) => string;
  readonly tooMany: (count: number) => string;
}

export interface RemoteListState {
  /** The text typed, trimmed */
  term: string;

  /** Fewer characters than a search needs: nothing is asked */
  underMin: boolean;

  /** A search is on its way */
  searching: boolean;

  /** The wait has lasted long enough to be shown */
  busyVisible: boolean;

  /** The search failed, and none is on its way */
  failed: boolean;

  /** How many results the server answered */
  count: number;

  /** Whether the list shows nothing: it may differ from `count`, a list can leave out what is chosen */
  empty: boolean;

  /** The server had more than it sent */
  hasMore: boolean;
}

interface ListChipsProps {
  /** The prefix of the slots: `<slot>-chips`, `<slot>-chip`, `<slot>-chip-remove`, `<slot>-more` */
  slot: string;

  /** The values chosen, in order */
  items: readonly ComboboxItem[];

  /** Chips shown at most, the rest in "+N". Read only shows them all, wrapping */
  maxChips: number;

  readOnly: boolean;

  /** Read only or disabled: no chip has its x */
  inert: boolean;

  /** A value the x cannot take away, which then has none */
  isLocked?: (item: ComboboxItem) => boolean;

  /** Shown when nothing is chosen */
  placeholder?: React.ReactNode;

  labels: {
    readonly remove: (label: string) => string;
    readonly more: (count: number) => string;
    readonly moreRest: (count: number) => string;
  };

  onRemove: (item: ComboboxItem) => void;
}


/* --------
 * Constants Definition
 * -------- */

/**
 * The one item a list fed by a server offers after a failed search. Compared by identity, so it is
 * this object and no other; the value cannot collide with a key coming from the server
 */
export const LIST_RETRY: ComboboxItem = { value: '\u0000retry', label: '' };


/* --------
 * Layout
 * -------- */

/**
 * The layout of the classes of the list panel, given through `render` to the Base UI parts that carry
 * them: the panel a column (`LIST_PANEL`), an option a row aligned at the top (`LIST_ITEM`)
 */
export const LIST_PANEL_LAYOUT = <Stack />;

export const LIST_ITEM_LAYOUT = <Stack direction={'horizontal'} align={'start'} gap={2} />;


/* --------
 * Helpers
 * -------- */

/**
 * The press on the frame of a list field, the arrow and the room around the value: it opens or
 * closes the list and puts the focus on the trigger. `skip` names what handles its own press, the
 * trigger itself and the buttons inside the frame
 */
export function toggleFromFrame(
  event: React.MouseEvent<HTMLElement>,
  skip: string,
  trigger: HTMLElement | null,
  open: boolean,
  onOpenChange: (open: boolean) => void
): void {
  if ((event.target as Element).closest(skip) !== null) {
    return;
  }

  event.preventDefault();
  trigger?.focus();
  onOpenChange(!open);
}


/* --------
 * Parts
 * -------- */

/** The error line of a list, with its mark */
export function ListError(props: { children: React.ReactNode }): React.ReactNode {
  return (
    <Stack as={'span'} data-slot={'list-error'} direction={'horizontal'} align={'start'} gap={1} className={'text-destructive'}>
      <ErrorGlyph />
      {props.children}
    </Stack>
  );
}


/**
 * The values of a multiple field as chips: each with its label, truncated with a tooltip when two or
 * more share the room, and an x that does not take the focus. Past `maxChips` one "+N" chip names
 * the rest in its tooltip. Above the trigger that fills the frame, so only the chips take the pointer.
 */
export function ListChips(props: ListChipsProps): React.ReactNode {
  const { inert, isLocked, items, labels, maxChips, onRemove, placeholder, readOnly, slot } = props;

  const shown = readOnly ? items : items.slice(0, maxChips);
  const hidden = readOnly ? [] : items.slice(maxChips);

  return (
    <Stack
      as={'span'}
      data-slot={`${slot}-chips`}
      direction={'horizontal'}
      wrap={readOnly}
      align={'center'}
      gap={1.5}
      className={cn(
        'pointer-events-none relative z-10 min-w-0 flex-1 *:pointer-events-auto',
        readOnly ? 'py-1' : 'overflow-hidden'
      )}
    >
      {items.length === 0 && placeholder && <span className={'truncate text-placeholder'}>{placeholder}</span>}

      {shown.map((item) => {
        const locked = isLocked?.(item) ?? false;

        return (
          <Stack
            as={'span'}
            key={item.value}
            data-slot={`${slot}-chip`}
            inline
            direction={'horizontal'}
            align={'center'}
            gap={0.5}
            className={cn(LIST_CHIP, (inert || locked) && 'pe-1.5', readOnly && 'border border-border bg-card')}
          >
            <Tooltip content={item.label} truncatedOnly align={'start'}>
              <span data-truncate={''} className={cn('min-w-0 truncate', shown.length > 1 && 'max-w-30')}>{item.label}</span>
            </Tooltip>

            {!inert && !locked && (
              <IconButton
                label={labels.remove(item.label)}
                icon={<ClearGlyph />}
                tabIndex={-1}
                size={'sm'}
                data-slot={`${slot}-chip-remove`}
                className={'size-5 rounded-sm [&_svg]:size-3.5'}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onRemove(item)}
              />
            )}
          </Stack>
        );
      })}

      {hidden.length > 0 && (
        <Tooltip content={<OverflowTooltipList values={hidden.map((item) => item.label)} rest={labels.moreRest} />}>
          <Stack as={'span'} data-slot={`${slot}-more`} inline direction={'horizontal'} align={'center'} gap={0.5} className={cn(LIST_CHIP, 'pe-1.5')}>
            <span aria-hidden={'true'}>{`+${hidden.length}`}</span>
            <VisuallyHidden>{labels.more(hidden.length)}</VisuallyHidden>
          </Stack>
        </Tooltip>
      )}
    </Stack>
  );
}


/* --------
 * List States
 * -------- */

/**
 * What a list fed by a server says, in two places: the line shown in the panel, and the text of the
 * `status` region read after each answer. In order, the panel says: type more, the error, the wait,
 * nothing found. The region speaks only of an answer that arrived.
 */
export function remoteListMessages(
  state: RemoteListState,
  labels: RemoteListLabels
): { message: React.ReactNode; status: string } {
  const { busyVisible, count, empty, failed, hasMore, searching, term, underMin } = state;

  let message: React.ReactNode = null;

  if (underMin) {
    message = labels.minChars;
  }
  else if (failed) {
    message = <ListError>{labels.error}</ListError>;
  }
  else if (busyVisible) {
    message = labels.searching;
  }
  else if (!searching && empty) {
    message = labels.noResults(term);
  }

  let status = '';

  if (!underMin && !searching) {
    if (failed) {
      status = labels.error;
    }
    else if (count === 0) {
      status = labels.noResults(term);
    }
    else {
      status = hasMore ? labels.tooMany(count) : labels.results(count);
    }
  }

  return { message, status };
}
