'use client';

import * as React from 'react';

import { cn } from '../../core/cn';

import { Spinner } from '../../components/Spinner';

import { useDelayedBusy } from '../../hooks/useDelayedBusy';

import { Button } from '../button/Button';
import { CheckGlyph } from '../choice/choice';
import { ErrorGlyph } from '../field/glyphs';
import {
  LIST_FOOTER,
  LIST_ITEM,
  LIST_ITEMS,
  LIST_MESSAGE,
  LIST_SEARCH,
  LIST_SEARCH_INPUT,
  matchesSearch,
  normalizeForSearch
} from '../list-panel/listPanel';
import { SearchGlyph } from '../text-input/glyphs';

import type { FilterOption, FiltersBarLabels, RemoteListFilter } from './filtersBarTypes';


/* --------
 * Types Definition
 * -------- */

export interface FilterListProps {
  /** The name of the list: the filter's */
  label: string;

  /** Every value of a local list. Ignored with `remote` */
  options: readonly FilterOption[];

  /** The keys chosen */
  value: readonly string[];

  multiple: boolean;

  onChange: (value: string[], items: FilterOption[]) => void;

  /** Past this many values a local list gets a search */
  searchThreshold: number;

  /** A list searched on the server: its results, state and retry */
  remote?: RemoteListFilter;

  /** `actions` "Select all" and "Clear"; `clear` only "Clear"; `none` no footer */
  footer: 'actions' | 'clear' | 'none';

  /** ← with an empty search: back to the names of "More filters" */
  onBack?: () => void;

  /** Where the focus lands: the search, or the list itself */
  focusRef?: React.Ref<HTMLElement>;

  /** Takes the focus when it mounts: the second step of "More filters" */
  autoFocus?: boolean;

  labels: FiltersBarLabels;
}


/* --------
 * Constants Definition
 * -------- */

/** The one item offered after an error. Choosing it asks again and never becomes a value */
const RETRY: FilterOption = { value: '\u0000retry', label: '' };

const OPTION_BOX = [
  'mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-input bg-card text-primary-foreground',
  'group-data-selected/option:border-transparent group-data-selected/option:bg-primary'
].join(' ');

const OPTION_TICK = 'mt-0.5 inline-flex size-4 shrink-0 text-primary opacity-0 group-data-selected/option:opacity-100';

/** How long a typed prefix keeps growing on a list without search */
const TYPEAHEAD_MS = 500;


/* --------
 * Helpers
 * -------- */

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null): void {
  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  if (ref) {
    (ref as React.RefObject<T | null>).current = value;
  }
}

function nextEnabled(items: readonly FilterOption[], from: number, step: 1 | -1): number {
  for (let index = from; index >= 0 && index < items.length; index += step) {
    if (!items[index]!.disabled) {
      return index;
    }
  }

  return -1;
}


/* --------
 * Component Definition
 * -------- */

/**
 * The list of a filter, written once for the buttons of the bar and the second step of "More filters":
 * the look of the list of Select and MultiSelect, and their keys. The focus stays on the search, or on
 * the list when there is none, and the active value follows `aria-activedescendant`.
 *
 * A local list gets a search past the threshold; a server list always has one, with the states of the
 * Combobox: the minimum of characters, "searching" only when slow, the values chosen first and ticked,
 * "Retry" alone after an error, the line past the limit.
 */
export function FilterList(props: FilterListProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    autoFocus = false,
    focusRef,
    footer,
    label,
    labels,
    multiple,
    onBack,
    onChange,
    options,
    remote,
    searchThreshold,
    value
  } = props;


  // ----
  // Internal Hooks
  // ----
  const baseId = React.useId();
  const showBusy = useDelayedBusy(remote?.searching ?? false).visible;

  const targetRef = React.useRef<HTMLElement | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const typeaheadRef = React.useRef({ text: '', at: 0 });


  // ----
  // Internal State
  // ----
  const [ query, setQuery ] = React.useState('');
  const [ activeKey, setActiveKey ] = React.useState<string | null>(value[0] ?? null);

  const searchable = remote !== undefined || options.length > searchThreshold;
  const term = query.trim();
  const minChars = remote?.minChars ?? 2;
  const underMin = remote !== undefined && term.length < minChars;
  const searching = remote?.searching ?? false;
  const failed = (remote?.searchError ?? false) && !searching;

  /* What a server list shows: the values first, ticked, then the results that are not among them */
  const chosen: FilterOption[] = remote
    ? value.map((key) => remote.selectedItems.find((item) => item.value === key) ?? { value: key, label: key })
    : options.filter((option) => value.includes(option.value));

  let items: readonly FilterOption[];

  if (remote) {
    if (underMin) {
      items = chosen;
    }
    else {
      items = failed ? [ RETRY ] : [ ...chosen, ...remote.items.filter((item) => !value.includes(item.value)) ];
    }
  }
  else {
    items = searchable && term !== '' ? options.filter((option) => matchesSearch(option.label, term)) : options;
  }

  /* The active value: the one asked for while it is in the list, or the first that can be chosen */
  const asked = items.findIndex((item) => item.value === activeKey && !item.disabled);
  const activeIndex = asked >= 0 ? asked : nextEnabled(items, 0, 1);
  const activeId = activeIndex >= 0 ? `${baseId}-${activeIndex}` : undefined;


  // ----
  // Handlers
  // ----
  const setTarget = (element: HTMLElement | null): void => {
    targetRef.current = element;
    assignRef(focusRef, element);
  };

  const change = (next: readonly FilterOption[]): void => {
    /* A local list keeps its own order, whatever the order of the clicks */
    const ordered = remote ? [ ...next ] : options.filter((option) => next.some((item) => item.value === option.value));

    onChange(ordered.map((item) => item.value), ordered);
  };

  const pick = (item: FilterOption | undefined): void => {
    if (!item || item.disabled) {
      return;
    }

    if (item === RETRY) {
      remote?.onRetry?.();
      return;
    }

    setActiveKey(item.value);

    if (!multiple) {
      change([ item ]);
      return;
    }

    const known = remote ? [ ...chosen, ...remote.items ] : options;
    const current = known.filter((option, index) => value.includes(option.value)
      && known.findIndex((other) => other.value === option.value) === index);

    change(value.includes(item.value) ? current.filter((option) => option.value !== item.value) : [ ...current, item ]);
  };

  const search = (text: string): void => {
    setQuery(text);
    setActiveKey(null);
    remote?.onSearchChange(text);
  };

  const moveTo = (index: number): void => {
    const item = items[index];

    if (item) {
      setActiveKey(item.value);
    }
  };

  /** Letters on a list without search jump to the first value that starts with them */
  const typeahead = (key: string, now: number): boolean => {
    if (key.length !== 1 || key === ' ') {
      return false;
    }

    const typed = now - typeaheadRef.current.at < TYPEAHEAD_MS ? typeaheadRef.current.text + key : key;

    typeaheadRef.current = { text: typed, at: now };

    const prefix = normalizeForSearch(typed);
    const found = items.findIndex((item) => !item.disabled && normalizeForSearch(item.label).startsWith(prefix));

    if (found >= 0) {
      moveTo(found);
    }

    return true;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>): void => {
    const inInput = event.currentTarget.tagName === 'INPUT';

    switch (event.key) {
      case 'ArrowDown': {
        const next = nextEnabled(items, activeIndex + 1, 1);

        event.preventDefault();
        moveTo(next >= 0 ? next : activeIndex);
        return;
      }

      case 'ArrowUp': {
        const previous = nextEnabled(items, activeIndex - 1, -1);

        event.preventDefault();
        moveTo(previous >= 0 ? previous : activeIndex);
        return;
      }

      case 'Home':
      case 'End':
        if (inInput) {
          return;
        }

        event.preventDefault();
        moveTo(event.key === 'Home' ? nextEnabled(items, 0, 1) : nextEnabled(items, items.length - 1, -1));
        return;

      case 'Enter':
        event.preventDefault();
        pick(items[activeIndex]);
        return;

      case ' ':
        if (inInput) {
          return;
        }

        event.preventDefault();
        pick(items[activeIndex]);
        return;

      case 'ArrowLeft':
        if (onBack && query === '') {
          event.preventDefault();
          onBack();
        }

        return;

      default:
        if (!inInput && !event.ctrlKey && !event.metaKey && !event.altKey && typeahead(event.key, event.timeStamp)) {
          event.preventDefault();
        }
    }
  };


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => {
    if (autoFocus) {
      targetRef.current?.focus();
    }
  }, [ autoFocus ]);

  React.useEffect(() => {
    if (activeId) {
      listRef.current?.querySelector(`[id="${activeId}"]`)?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [ activeId ]);


  // ----
  // Component Render
  // ----
  let message: React.ReactNode = null;

  if (underMin) {
    message = labels.remote.minChars;
  }
  else if (failed) {
    message = (
      <span className={'flex items-start gap-1 text-destructive'}>
        <ErrorGlyph />
        {labels.remote.error}
      </span>
    );
  }
  else if (remote && showBusy) {
    message = labels.remote.searching;
  }
  else if (remote && !searching && remote.items.length === 0) {
    message = labels.remote.noResults(term);
  }
  else if (!remote && items.length === 0) {
    message = labels.noResults;
  }

  let status = '';

  if (remote && !underMin && !searching) {
    if (failed) {
      status = labels.remote.error;
    }
    else if (remote.items.length === 0) {
      status = labels.remote.noResults(term);
    }
    else {
      status = remote.hasMore ? labels.remote.tooMany(remote.items.length) : labels.remote.results(remote.items.length);
    }
  }

  /* The footer acts on the values that can change: the ones found, while searching */
  const reachable = items.filter((item) => !item.disabled && item !== RETRY);
  const allChecked = reachable.length > 0 && reachable.every((item) => value.includes(item.value));
  const noneChecked = reachable.every((item) => !value.includes(item.value));

  const selectAll = (): void => change([ ...chosen, ...reachable.filter((item) => !value.includes(item.value)) ]);
  const clearReachable = (): void => change(chosen.filter((item) => !reachable.some((other) => other.value === item.value)));

  const listProps = {
    id                     : `${baseId}-list`,
    role                   : 'listbox',
    'aria-label'           : label,
    'aria-multiselectable' : multiple || undefined,
    'aria-busy'            : searching || undefined
  } as const;

  return (
    <div data-slot={'filter-list'} className={'flex min-h-0 flex-col'}>
      {searchable && (
        <div className={LIST_SEARCH}>
          <SearchGlyph />
          <input
            ref={setTarget}
            type={'text'}
            role={'combobox'}
            aria-expanded={'true'}
            aria-controls={listProps.id}
            aria-activedescendant={activeId}
            aria-autocomplete={'list'}
            aria-label={label}
            autoComplete={'off'}
            spellCheck={false}
            placeholder={remote ? undefined : labels.search}
            value={query}
            onChange={(event) => search(event.currentTarget.value)}
            onKeyDown={handleKeyDown}
            className={LIST_SEARCH_INPUT}
          />
          {showBusy && <Spinner size={'sm'} className={'size-3.5'} />}
        </div>
      )}

      {message && <div data-slot={'filter-list-message'} className={cn(LIST_MESSAGE, remote && 'text-xs')}>{message}</div>}

      <div
        {...listProps}
        ref={(element) => {
          listRef.current = element;

          if (!searchable) {
            setTarget(element);
          }
        }}
        tabIndex={searchable ? -1 : 0}
        aria-activedescendant={searchable ? undefined : activeId}
        onKeyDown={searchable ? undefined : handleKeyDown}
        className={cn(LIST_ITEMS, 'empty:hidden')}
      >
        {items.map((item, index) => (
          <div
            key={item.value}
            id={`${baseId}-${index}`}
            role={'option'}
            aria-selected={item === RETRY ? false : value.includes(item.value)}
            aria-disabled={item.disabled || undefined}
            data-slot={'filter-list-item'}
            data-highlighted={index === activeIndex ? '' : undefined}
            data-selected={value.includes(item.value) ? '' : undefined}
            data-disabled={item.disabled ? '' : undefined}
            className={cn(LIST_ITEM, 'group/option', (item.code || item.description) && 'min-h-12')}
            onPointerMove={() => {
              if (!item.disabled && index !== activeIndex) {
                moveTo(index);
              }
            }}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => pick(item)}
          >
            {item === RETRY
              ? <span className={'min-w-0 flex-1'}>{labels.remote.retry}</span>
              : (
                <React.Fragment>
                  {multiple && <span className={OPTION_BOX} aria-hidden={'true'}><CheckGlyph /></span>}
                  <span className={'flex min-w-0 flex-1 flex-col'}>
                    <span>{item.label}</span>
                    {(item.code || item.description) && (
                      <span className={'text-xs text-muted-foreground'}>{[ item.code, item.description ].filter(Boolean).join(' · ')}</span>
                    )}
                  </span>
                  {!multiple && <span className={OPTION_TICK} aria-hidden={'true'}><CheckGlyph /></span>}
                </React.Fragment>
              )}
          </div>
        ))}
      </div>

      {remote && !underMin && remote.hasMore && !searching && !failed && (
        <div className={cn(LIST_MESSAGE, 'text-xs')}>{labels.remote.tooMany(remote.items.length)}</div>
      )}

      {remote && <div role={'status'} className={'sr-only'}>{status}</div>}

      {footer !== 'none' && (
        <div data-slot={'filter-list-footer'} className={LIST_FOOTER}>
          {footer === 'actions' && !remote
            ? <Button size={'sm'} fill={'plain'} tone={'primary'} disabled={allChecked} onClick={selectAll}>{labels.selectAll}</Button>
            : <span />}
          <Button
            size={'sm'}
            fill={'plain'}
            tone={'primary'}
            disabled={footer === 'actions' && !remote ? noneChecked : value.length === 0}
            onClick={footer === 'actions' && !remote ? clearReachable : () => change([])}
          >
            {labels.clear}
          </Button>
        </div>
      )}
    </div>
  );

}

FilterList.displayName = 'FilterList';
