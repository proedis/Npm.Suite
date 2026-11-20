'use client';

import * as React from 'react';

import { useForkRef } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Button } from '../button/Button';
import { SearchInput } from '../search-input/SearchInput';
import { Tooltip } from '../tooltip/Tooltip';

import { FilterButton, FilterButtonCopy } from './FilterButton';
import { filtersBarGlyph } from './filtersBarGlyphs';
import { fitFilters, isFilterActive, sameFit } from './filtersBarState';
import { MoreFilters, moreFiltersButtonProps } from './MoreFilters';

import type { BaseProps } from '../../core/base';

import type { FilterFit, FilterMeasure } from './filtersBarState';
import type { FiltersBarFilter, FiltersBarLabels, FiltersBarSearch } from './filtersBarTypes';


/* --------
 * Types Definition
 * -------- */

export interface StrictFiltersBarProps extends BaseProps {
  /** The filters, in the order they appear. The bar holds no value: the page does, usually in its address */
  filters: readonly FiltersBarFilter[];

  /** The search at the start of the row. Without it there is none */
  search?: FiltersBarSearch;

  /** "Clear filters": every filter off, the ones in "More filters" too. The search stays */
  onClear: () => void;

  /** Past this many values a list gets a search. Defaults to 8 */
  searchThreshold?: number;

  labels: FiltersBarLabels;

  className?: string;
}

export type FiltersBarProps = StrictFiltersBarProps & Omit<React.ComponentProps<'div'>, keyof StrictFiltersBarProps | 'ref' | 'children'>;

interface Measures {
  available: number;
  filters: readonly FilterMeasure[];
  more: number;
  clear: number;
  gap: number;
}


/* --------
 * Constants Definition
 * -------- */

const DEFAULT_THRESHOLD = 8;

const MORE_ID = '\u0000more';


/* --------
 * Helpers
 * -------- */

function sameMeasures(a: Measures | null, b: Measures): boolean {
  return a !== null
    && a.available === b.available
    && a.gap === b.gap
    && a.more === b.more
    && a.clear === b.clear
    && a.filters.length === b.filters.length
    && a.filters.every((filter, index) => (
      filter.width === b.filters[index]!.width
      && filter.values === b.filters[index]!.values
      && filter.active === b.filters[index]!.active
    ));
}


/* --------
 * Component Definition
 * -------- */

/**
 * The row of filters between the header of a page and its table: the search, a button per filter,
 * "More filters" and, with a filter on, "Clear filters". Every choice filters at once.
 *
 * ```tsx
 * <Table
 *   toolbar={(
 *     <FiltersBar
 *       search={{ value: query, onValueChange: setQuery, placeholder: t('…EXAMPLE'), label: t('…SEARCH') }}
 *       filters={[
 *         { id: 'status', label: t('…STATUS'), multiple: true, options: statuses, value: status, onValueChange: setStatus },
 *         { id: 'opened', label: t('…OPENED'), kind: 'date', value: opened, onValueChange: setOpened }
 *       ]}
 *       onClear={clearFilters}
 *       labels={filtersBarLabels}
 *     />
 *   )}
 *   …
 * />
 * ```
 *
 * Everything is `sm`, 28px high. The buttons never shrink: the ones that do not fit go into "More
 * filters", the last ones first, and an active one at the edge cuts its values before it moves. The
 * count is done again when the width changes and when a list closes, never with a list open, so a
 * button never moves under the pointer; a filter in "More filters" stays there when it turns on. When
 * not even the first fits, every filter goes into one "Filters" button.
 *
 * The bar counts the active filters by itself. "Clear filters" asks no confirmation, and gives the
 * focus to the first filter. The widths come from a hidden copy of the row, so measuring never moves
 * what the user sees.
 *
 * Slots: `filters-bar` (with `data-narrow`, `data-active`), `filter` (with `data-kind`, `data-active`,
 * `data-open`, `data-disabled`, `data-loading`), `filter-trigger`, `filter-values`, `filter-remove`,
 * `filter-panel`, `filter-list`, `filter-list-search`, `filter-list-input`, `filter-list-message`,
 * `filter-list-items`, `filter-list-item` (with `data-highlighted`, `data-selected`, `data-disabled`),
 * `filter-list-box`, `filter-list-tick`, `filter-list-item-text`, `filter-list-item-label`,
 * `filter-list-item-description`, `filter-list-retry`, `filter-list-too-many`, `filter-list-status`,
 * `filter-list-footer`, `filter-list-select-all`, `filter-list-clear`, `filter-date`,
 * `filter-date-footer`, `filter-date-from`, `filter-date-until`, `filter-date-clear`, `more-filters`
 * (with `data-narrow`, `data-active`, `data-open`), `more-filters-panel` (with `data-step`),
 * `more-filters-header`, `more-filters-back`, `more-filters-title`, `more-filters-names`,
 * `more-filters-row` (with `data-active`, `data-disabled`, `data-loading`), `more-filters-row-text`,
 * `more-filters-row-label`, `more-filters-row-values`, `more-filters-row-end`, `filters-bar-clear`.
 *
 * Native `div` props and `ref` reach the root; the search, the filters and the panels are configured
 * through their own props.
 */
export const FiltersBar = React.forwardRef<HTMLDivElement, FiltersBarProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    filters,
    labels,
    onClear,
    search,
    searchThreshold = DEFAULT_THRESHOLD,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const barRef = React.useRef<HTMLDivElement>(null);
  const handleBarRef = useForkRef(barRef, ref);
  const copyRef = React.useRef<HTMLDivElement>(null);
  const triggersRef = React.useRef(new Map<string, HTMLButtonElement>());
  const moreRef = React.useRef<HTMLButtonElement | null>(null);

  /** The filter whose list just closed: if the count moves it into "More filters", the focus follows it there */
  const closedRef = React.useRef<string | null>(null);


  // ----
  // Internal State
  // ----
  const [ openId, setOpenId ] = React.useState<string | null>(null);
  const [ measures, setMeasures ] = React.useState<Measures | null>(null);
  const [ shown, setShown ] = React.useState<FilterFit | null>(null);
  const [ quietSearch, setQuietSearch ] = React.useState(false);

  const fit = measures && measures.filters.length === filters.length
    ? fitFilters(measures)
    : null;

  /* The row is counted again only with every list closed: nothing moves under the pointer */
  if (openId === null && fit && (shown === null || !sameFit(shown, fit))) {
    setShown(fit);
  }

  const layout = shown ?? fit ?? { visible: filters.length, squeeze: null, narrow: false };
  const visibleCount = layout.narrow ? 0 : Math.min(layout.visible, filters.length);
  const inRow = filters.slice(0, visibleCount);
  const inMore = filters.slice(visibleCount);
  const anyActive = filters.some(isFilterActive);


  // ----
  // Handlers
  // ----
  const openChange = (id: string, next: boolean, reason?: string): void => {
    if (next) {
      setOpenId(id);
      return;
    }

    if (openId === id) {
      /* Closed from the keyboard or by a choice; a press outside leaves the focus where it went */
      closedRef.current = reason === 'outside-press' || reason === 'focus-out' ? null : id;
      setOpenId(null);
    }
  };

  const handleClear = (): void => {
    onClear();

    const first = inRow[0];
    const target = first ? triggersRef.current.get(first.id) : moreRef.current;

    target?.focus();
  };


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => {
    const closed = closedRef.current;

    closedRef.current = null;

    if (closed === null || closed === MORE_ID || triggersRef.current.has(closed)) {
      return undefined;
    }

    /* After Base UI has given the focus back as it could: the button it closed from is gone */
    const frame = window.requestAnimationFrame(() => moreRef.current?.focus());

    return () => window.cancelAnimationFrame(frame);
  });

  React.useLayoutEffect(() => {
    const bar = barRef.current;
    const copy = copyRef.current;

    if (!bar || !copy) {
      return undefined;
    }

    /*
     * The gap and the room of the search are read from the copy, never written here in pixels: they
     * are `gap-2` and `w-60`, steps of `--spacing`, and a rescaled theme would otherwise be fitted on
     * the default widths. The search is measured whole, at the width it shrinks from.
     */
    const measure = (): void => {
      const faces = Array.from(copy.querySelectorAll<HTMLElement>(':scope > [data-filter-copy]'));
      const gap = Number.parseFloat(getComputedStyle(copy).columnGap) || 0;
      const searchWidth = copy.querySelector(':scope > [data-copy=search]')?.getBoundingClientRect().width;
      const next: Measures = {
        gap,
        available: bar.clientWidth - (searchWidth === undefined ? 0 : searchWidth + gap),
        filters  : faces.map((face) => ({
          width : face.getBoundingClientRect().width,
          values: face.querySelector('[data-slot=filter-values]')?.getBoundingClientRect().width ?? 0,
          active: face.dataset.active !== undefined
        })),
        more : copy.querySelector(':scope > [data-copy=more]')?.getBoundingClientRect().width ?? 0,
        clear: copy.querySelector(':scope > [data-copy=clear]')?.getBoundingClientRect().width ?? 0
      };

      setMeasures((previous) => (sameMeasures(previous, next) ? previous : next));
    };

    const observer = new ResizeObserver(measure);

    observer.observe(bar);
    observer.observe(copy);
    measure();

    return () => observer.disconnect();
  }, []);


  // ----
  // Component Render
  // ----
  const morePanel = moreFiltersButtonProps(visibleCount === 0, filters.filter(isFilterActive).length, labels);

  return (
    <div
      {...rest}
      ref={handleBarRef}
      data-slot={'filters-bar'}
      data-narrow={visibleCount === 0 || undefined}
      data-active={anyActive || undefined}
      className={cn('relative flex h-7 min-w-0 flex-1 items-center gap-2', baseClasses, className)}
    >
      {search && (
        <Tooltip content={search.label} disabled={quietSearch}>
          <SearchInput
            size={'sm'}
            aria-label={search.label}
            placeholder={search.placeholder}
            value={search.value}
            onValueChange={search.onValueChange}
            labels={{ clear: labels.clearSearch }}
            className={'w-60 min-w-35 shrink'}
            onKeyDown={() => setQuietSearch(true)}
            onPointerEnter={() => setQuietSearch(false)}
          />
        </Tooltip>
      )}

      {inRow.map((filter, index) => (
        <FilterButton
          key={filter.id}
          filter={filter}
          open={openId === filter.id}
          onOpenChange={(next, reason) => openChange(filter.id, next, reason)}
          squeeze={index === visibleCount - 1 ? layout.squeeze : null}
          searchThreshold={searchThreshold}
          labels={labels}
          triggerRef={(element) => {
            if (element) {
              triggersRef.current.set(filter.id, element);
            }
            else {
              triggersRef.current.delete(filter.id);
            }
          }}
        />
      ))}

      {inMore.length > 0 && (
        <MoreFilters
          filters={inMore}
          narrow={visibleCount === 0}
          open={openId === MORE_ID}
          onOpenChange={(next, reason) => openChange(MORE_ID, next, reason)}
          searchThreshold={searchThreshold}
          labels={labels}
          triggerRef={(element) => {
            moreRef.current = element;
          }}
        />
      )}

      {anyActive && (
        <Button size={'sm'} fill={'plain'} tone={'destructive'} data-slot={'filters-bar-clear'} className={'shrink-0'} onClick={handleClear}>
          {labels.clearAll}
        </Button>
      )}

      {/* The copy that measures: every filter as it would look in the row, "More filters", "Clear filters" */}
      <div aria-hidden={'true'} inert className={'pointer-events-none invisible absolute start-0 top-0 size-0 overflow-hidden'}>
        <div ref={copyRef} className={'flex w-max items-center gap-2'}>
          {search && <span data-copy={'search'} className={'w-60 shrink-0'} />}
          {filters.map((filter) => <FilterButtonCopy key={filter.id} filter={filter} squeeze={null} labels={labels} />)}
          <span data-copy={'more'} className={'inline-flex'}>
            <Button tabIndex={-1} size={'sm'} fill={morePanel.fill} tone={morePanel.tone} leading={filtersBarGlyph('filter')}>
              {moreFiltersButtonProps(false, filters.filter(isFilterActive).length, labels).children}
            </Button>
          </span>
          <span data-copy={'clear'} className={'inline-flex'}>
            <Button tabIndex={-1} size={'sm'} fill={'plain'} tone={'destructive'}>{labels.clearAll}</Button>
          </span>
        </div>
      </div>
    </div>
  );

});

FiltersBar.displayName = 'FiltersBar';
