'use client';

import * as React from 'react';

import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

import { useDelayedBusy } from '@proedis/react';

import { LoadingBar } from '../../primitives/LoadingBar';
import { cn } from '../../core/cn';

import { Button } from '../../actions/button/Button';
import { IconButton } from '../../actions/button/IconButton';
import { CheckGlyph } from '../../forms/choice/choice';
import { Dialog } from '../../overlays/dialog/Dialog';
import { EmptyState } from '../../feedback/empty-state/EmptyState';
import { FiltersBar } from '../filters-bar/FiltersBar';
import { matchesSearch } from '../../actions/list-panel/listPanel';
import { SearchInput } from '../../forms/search-input/SearchInput';
import { ALIGN_CLASS, COLUMN_STEPS, CellContent, SELECT_COLUMN_STEPS, cellText, columnAlign, readCellValue } from '../table/tableCells';
import { useTableFormats } from '../table/tableFormats';
import { TableGlyph } from '../table/tableGlyphs';
import { CELL, ColumnGroup, HEAD, PIN_START, ROW, SkeletonRows, TruncationTooltip, markScroll } from '../table/tableParts';
import { EMPTY_SELECTION, isRowSelected, selectionCount, setRowsSelected } from '../table/tableState';
import { ClearGlyph } from '../../forms/text-input/glyphs';
import { Tooltip } from '../../actions/tooltip/Tooltip';

import type { TableColumn, TableSelection } from '../table/tableTypes';

import type { ModalSelectorColumn, ModalSelectorProps, ModalSelectorRowBlock } from './modalSelectorTypes';


/* --------
 * Constants Definition
 * -------- */

const DEFAULT_LIMIT = 50;

/** Ten rows and the header: the body never changes height with the results, so the footer stays still */
const SKELETON_ROWS = 10;

/** A row that is active from the keyboard: the surface of the pointer; on a chosen one, its ink at 8% */
const SELECTOR_ROW = [
  ROW,
  'cursor-default data-active:not-data-selected:[--row-bg:var(--color-accent)]',
  'data-disabled:text-muted-foreground'
].join(' ');

const ACTIVE_INK = [
  'group-data-selected/row:group-data-active/row:bg-linear-to-b',
  'group-data-selected/row:group-data-active/row:from-primary-soft-foreground/8',
  'group-data-selected/row:group-data-active/row:to-primary-soft-foreground/8'
].join(' ');

/** The 2px bar of a chosen row, on its first cell (pinned, so it is positioned) */
const CHOSEN_BAR = [
  'after:pointer-events-none after:absolute after:inset-y-0 after:start-0 after:w-0.5 after:bg-primary',
  'after:opacity-0 group-data-selected/row:after:opacity-100'
].join(' ');

/** The box of a row with several values: the Checkbox's drawing, with no focus of its own */
const ROW_BOX = [
  'inline-flex size-4 shrink-0 items-center justify-center rounded-sm border border-input bg-card align-middle text-primary-foreground',
  'group-data-selected/row:border-transparent group-data-selected/row:bg-primary',
  'data-locked:border-transparent data-locked:bg-muted-foreground'
].join(' ');

const KBD = 'rounded-sm border border-border bg-muted px-1 font-sans text-xs text-muted-foreground';


/* --------
 * Helpers
 * -------- */

function asColumn<TData>(column: ModalSelectorColumn<TData>): TableColumn<TData> {
  return column as TableColumn<TData>;
}

function sameIds(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id) => b.includes(id));
}


/* --------
 * Component Definition
 * -------- */

/**
 * The choice of a record from a list of records, in a Dialog `lg`. The toolbar holds the search, the
 * filters of the FiltersBar and a count line; the body a compact table with the kinds of the Table.
 * With one value a row is chosen and the primary confirms it; with several the rows are ticked and the
 * primary takes them all.
 *
 * ```tsx
 * <ModalSelector
 *   open={open} onOpenChange={setOpen}
 *   title={t('…CHOOSE_CONTRACT')} description={t('…CONTRACT_OF_SIGNAL')} icon={<FileText />} iconTone={'muted'}
 *   columns={contractColumns} rows={search.rows} hasMore={search.hasMore} rowCount={search.total} status={search.status}
 *   getRowId={(row) => row.id} getRowLabel={(row) => ({ label: row.holder, code: row.code })}
 *   search={{ value: term, onValueChange: setTerm, label: t('…SEARCH_SCOPE'), placeholder: t('…EXAMPLE') }}
 *   value={contractId} selectedRow={contract} onConfirm={(id, row) => setContract(row)}
 *   confirmLabel={() => t('COMMON.ACTION.CHOOSE')}
 *   labels={modalSelectorLabels}
 * />
 * ```
 *
 * The focus stays in the search: ↑ ↓ move the row (chosen with one value, active with several), Enter
 * confirms with one value and ticks with several, Ctrl or ⌘ Enter confirms with several. Enter during a
 * search waits for the answer and picks on its own only a row whose code matches the text. Esc empties
 * the search, then closes, asking first when there are choices not confirmed.
 *
 * Semantically a `listbox` with the search as its `combobox`: the rows are options named by their
 * cells, the header is hidden from assistive technology. The choices stay when the search and the
 * filters change; "Show only the chosen ones" suspends them. "Select all" (with `supportsAll`) chooses
 * every row of the filter, and changing the search or the filters undoes it.
 *
 * Slots: `modal-selector-toolbar`, `modal-selector-count`, `modal-selector-frame`, `modal-selector-list`,
 * `modal-selector-row` (with `data-selected`, `data-active`, `data-disabled`). The frame reports
 * `data-mode`, `data-multiple` and `data-status`. The footer is the dialog's, `dialog-footer`: the selector
 * is a `Dialog`, and the slots of its shell are the dialog's.
 */
export function ModalSelector<TData>(props: ModalSelectorProps<TData>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    columns,
    confirmLabel,
    description,
    enableRowSelection,
    filters,
    getRowId,
    getRowLabel,
    hasMore: serverHasMore = false,
    icon,
    iconTone,
    labels,
    limit = DEFAULT_LIMIT,
    mode = 'server',
    onClearFilters,
    onOpenChange,
    onRetry,
    open,
    returnFocus,
    rowCount: serverRowCount,
    rows: givenRows,
    search,
    status = 'ready',
    title
  } = props;

  const multiple = props.multiple === true;


  // ----
  // Internal Hooks
  // ----
  const formats = useTableFormats();
  const baseId = React.useId();
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const pendingEnterRef = React.useRef(false);
  const [ tooltipHandle ] = React.useState(() => TooltipPrimitive.createHandle<string>());

  const waiting = status === 'loading' || status === 'fetching';
  const showBusy = useDelayedBusy(status === 'fetching').visible;


  // ----
  // Internal State
  // ----
  const startIds = multiple ? (props.value as readonly string[]) : [];
  const startRows: readonly TData[] = props.multiple ? props.selectedRows : (props.selectedRow ? [ props.selectedRow ] : []);

  const [ seenOpen, setSeenOpen ] = React.useState(false);
  const [ pick, setPick ] = React.useState<string | null>(null);
  const [ draft, setDraft ] = React.useState<TableSelection>(EMPTY_SELECTION);
  const [ known, setKnown ] = React.useState<ReadonlyMap<string, TData>>(new Map());
  const [ activeId, setActiveId ] = React.useState<string | null>(null);
  const [ onlySelected, setOnlySelected ] = React.useState(false);
  const [ confirming, setConfirming ] = React.useState(false);
  const [ confirmError, setConfirmError ] = React.useState(false);
  const [ quietSearch, setQuietSearch ] = React.useState(false);

  /* Every opening starts from the value: what was chosen and not confirmed is gone */
  if (open !== seenOpen) {
    setSeenOpen(open);

    if (open) {
      setPick(multiple ? null : (props.value as string | null));
      setDraft({ ids: [ ...startIds ] });
      setKnown(new Map(startRows.map((row) => [ getRowId(row), row ])));
      setActiveId(null);
      setOnlySelected(false);
      setConfirmError(false);
    }
  }

  /* A new search or a filter changed: the active row starts again, "all" is undone */
  const searchKey = JSON.stringify([ search.value, (filters ?? []).map((filter) => filter.value) ]);
  const [ seenKey, setSeenKey ] = React.useState(searchKey);

  if (seenKey !== searchKey) {
    setSeenKey(searchKey);
    setActiveId(null);

    if (draft.all) {
      setDraft(EMPTY_SELECTION);
    }
  }

  const query = search.value.trim();
  const blockOf = (row: TData): ModalSelectorRowBlock | null => {
    const verdict = enableRowSelection?.(row) ?? true;

    return verdict === true ? null : verdict;
  };

  /* The rows in view */
  let rows: readonly TData[];
  let hasMore = serverHasMore;
  let rowCount = serverRowCount;

  if (onlySelected && !draft.all) {
    rows = draft.ids.map((id) => known.get(id)).filter((row): row is TData => row !== undefined);
    hasMore = false;
    rowCount = rows.length;
  }
  else if (mode === 'client') {
    const found = query === ''
      ? givenRows
      : givenRows.filter((row) => {
        const { code, label } = getRowLabel(row);

        return matchesSearch(`${code ?? ''} ${label} ${columns.map((column) => cellText(asColumn(column), readCellValue(asColumn(column), row), formats) ?? '').join(' ')}`, query);
      });

    rows = found.slice(0, limit);
    hasMore = found.length > limit;
    rowCount = found.length;
  }
  else {
    rows = givenRows.slice(0, limit);
    hasMore = serverHasMore || givenRows.length > limit;
  }

  const ids = rows.map(getRowId);
  const isChosen = (id: string): boolean => (multiple ? isRowSelected(draft, id) : pick === id);

  /* The rows of the value that cannot be chosen are ticked, read only, and are not counted */
  const lockedIds = draft.all ? [] : draft.ids.filter((id) => {
    const row = known.get(id) ?? rows[ids.indexOf(id)];

    return row !== undefined && blockOf(row) !== null;
  });
  const count = multiple ? selectionCount(draft, rowCount ?? 0) - lockedIds.length : (pick ? 1 : 0);

  if (onlySelected && (count === 0 || draft.all)) {
    setOnlySelected(false);
  }

  /* The active row: with several values the first when none was asked; with one, the chosen one */
  let active: string | null = activeId !== null && ids.includes(activeId) ? activeId : null;

  if (active === null) {
    active = multiple ? (ids[0] ?? null) : (pick !== null && ids.includes(pick) ? pick : null);
  }

  const dirty = multiple && (draft.all || !sameIds(draft.ids, startIds));


  // ----
  // Handlers
  // ----
  const remember = (row: TData): void => {
    setKnown((current) => new Map(current).set(getRowId(row), row));
  };

  const confirmWith = (chosenPick: string | null): void => {
    let result: void | Promise<unknown>;

    if (props.multiple) {
      const chosenRows = draft.all ? [] : draft.ids.map((id) => known.get(id)).filter((row): row is TData => row !== undefined);
      const selection: TableSelection = draft.all ? draft : { ids: draft.ids.filter((id) => !lockedIds.includes(id)) };

      result = props.onConfirm(selection, chosenRows);
    }
    else {
      const row = chosenPick ? known.get(chosenPick) : undefined;

      if (!chosenPick || !row) {
        return;
      }

      result = props.onConfirm(chosenPick, row);
    }

    if (!(result instanceof Promise)) {
      onOpenChange(false);
      return;
    }

    setConfirming(true);
    setConfirmError(false);
    result
      .then(() => onOpenChange(false))
      .catch(() => setConfirmError(true))
      .finally(() => setConfirming(false));
  };

  const choose = (row: TData): void => {
    if (blockOf(row)) {
      return;
    }

    const id = getRowId(row);

    remember(row);

    if (multiple) {
      setDraft(setRowsSelected(draft, [ id ], !isRowSelected(draft, id)));
      return;
    }

    setPick(id);
  };

  const move = (step: 1 | -1): void => {
    if (ids.length === 0) {
      return;
    }

    const from = active === null ? -1 : ids.indexOf(active);
    const index = from < 0 ? (step === 1 ? 0 : ids.length - 1) : Math.min(ids.length - 1, Math.max(0, from + step));
    const row = rows[index]!;

    setActiveId(ids[index]!);

    if (!multiple && !blockOf(row)) {
      remember(row);
      setPick(ids[index]!);
    }
  };

  /** Enter that waited for the answer: only a row whose code is the text */
  const exactRow = (): TData | undefined => rows.find((row) => {
    const { code } = getRowLabel(row);

    return code !== undefined && code.trim().toLocaleLowerCase() === query.toLocaleLowerCase();
  });

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    setQuietSearch(true);

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        move(event.key === 'ArrowDown' ? 1 : -1);
        return;

      case 'Enter': {
        event.preventDefault();

        if (multiple && (event.ctrlKey || event.metaKey)) {
          if (count > 0) {
            confirmWith(null);
          }

          return;
        }

        if (waiting) {
          pendingEnterRef.current = true;
          return;
        }

        const row = active === null ? undefined : rows[ids.indexOf(active)];

        if (multiple) {
          if (row) {
            choose(row);
          }

          return;
        }

        if (pick !== null && active === pick) {
          confirmWith(pick);
        }

        break;
      }

      default:
    }
  };

  const clearAllFilters = (): void => {
    search.onValueChange('');
    onClearFilters?.();
  };


  // ----
  // Lifecycle Events
  // ----

  /* The answer Enter was waiting for: the latest handler, called when the search settles */
  const resolvePendingRef = React.useRef<() => void>(() => undefined);

  React.useEffect(() => {
    resolvePendingRef.current = (): void => {
      if (!pendingEnterRef.current) {
        return;
      }

      pendingEnterRef.current = false;

      const row = exactRow();

      if (!row || blockOf(row)) {
        return;
      }

      if (multiple) {
        choose(row);
        return;
      }

      remember(row);
      setPick(getRowId(row));
      confirmWith(getRowId(row));
    };
  });

  React.useEffect(() => {
    if (!waiting) {
      resolvePendingRef.current();
    }
  }, [ waiting ]);

  React.useEffect(() => {
    if (scrollerRef.current) {
      markScroll(scrollerRef.current);
    }
  });

  React.useEffect(() => {
    if (active) {
      document.getElementById(`${baseId}-${active}`)?.scrollIntoView?.({ block: 'nearest' });
    }
  }, [ active, baseId ]);


  // ----
  // Component Render
  // ----
  const firstLoad = status === 'loading' && rows.length === 0;
  const failed = status === 'error' && !onlySelected;
  const noRows = !firstLoad && !failed && rows.length === 0;
  const nameColumn = Math.max(0, columns.findIndex((column) => column.kind !== 'code'));
  const minSteps = columns.reduce((sum, column) => sum + COLUMN_STEPS[column.width ?? 'md'], 0) + (multiple ? SELECT_COLUMN_STEPS : 0);
  const pinAt = multiple ? 'start-10' : 'start-0';

  let countText = '';

  if (!firstLoad && !failed) {
    if (hasMore) {
      countText = labels.more(limit, rowCount ?? null);
    }
    else {
      countText = labels.count(rowCount ?? rows.length, onlySelected ? '' : query);
    }
  }

  const showSelectAll = props.multiple && props.supportsAll === true && !draft.all && !onlySelected
    && rowCount !== undefined && rowCount > 0 && !failed;

  const renderRow = (row: TData, index: number): React.ReactNode => {
    const id = ids[index]!;
    const block = blockOf(row);
    const chosen = isChosen(id);
    const locked = chosen && block !== null;
    const note = block?.note ?? (!multiple && id === props.value ? labels.currentNote : undefined);
    const texts = columns.map((column) => cellText(asColumn(column), readCellValue(asColumn(column), row), formats));
    const named = texts.filter((text): text is string => text !== null);
    const name = (note && !named.includes(note) ? [ ...named, note ] : named).join(', ');

    return (
      <tr
        key={id}
        id={`${baseId}-${id}`}
        role={'option'}
        aria-selected={chosen && !locked}
        aria-disabled={block ? true : undefined}
        aria-label={name}
        aria-describedby={block ? `${baseId}-${id}-reason` : undefined}
        data-slot={'modal-selector-row'}
        data-selected={chosen ? '' : undefined}
        data-active={id === active ? '' : undefined}
        data-disabled={block ? '' : undefined}
        className={SELECTOR_ROW}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          setActiveId(id);
          choose(row);
        }}
        onDoubleClick={() => {
          if (!multiple && !block) {
            confirmWith(id);
          }
        }}
      >
        {multiple && (
          <td className={cn(CELL, ACTIVE_INK, PIN_START, CHOSEN_BAR, 'start-0 ps-3 pe-0')}>
            <span aria-hidden={'true'} data-locked={locked ? '' : undefined} className={ROW_BOX}><CheckGlyph /></span>
          </td>
        )}

        {columns.map((column, columnIndex) => {
          const text = texts[columnIndex];
          const isName = columnIndex === nameColumn;
          const content = <CellContent column={asColumn(column)} row={row} formats={formats} labels={labels} />;
          const cellProps = {
            'data-kind': column.kind,
            className  : cn(
              CELL,
              ACTIVE_INK,
              ALIGN_CLASS[columnAlign(asColumn(column))],
              columnIndex === 0 && cn(PIN_START, pinAt, !multiple && CHOSEN_BAR)
            )
          };
          const body = isName && note
            ? (
              <span className={'flex min-w-0 items-baseline gap-1.5'}>
                <span data-truncate={''} className={'min-w-0 truncate'}>{content}</span>
                <span className={'shrink-0 text-xs text-muted-foreground'}>{note}</span>
              </span>
            )
            : content;

          if (text === null) {
            return <td key={column.id} {...cellProps}>{body}</td>;
          }

          return (
            <TooltipPrimitive.Trigger key={column.id} handle={tooltipHandle} payload={text} render={<td {...cellProps} />}>
              {body}
            </TooltipPrimitive.Trigger>
          );
        })}

        {block && <td hidden id={`${baseId}-${id}-reason`}>{block.reason}</td>}
      </tr>
    );
  };

  let state: React.ReactNode = null;

  if (failed) {
    state = (
      <EmptyState
        kind={'error'}
        size={'panel'}
        icon={<TableGlyph name={'alert'} />}
        title={labels.error}
        description={labels.errorHint}
        actions={onRetry ? [ { label: labels.retry, role: 'retry', onClick: onRetry } ] : []}
      />
    );
  }
  else if (noRows && status === 'ready') {
    state = (
      <EmptyState
        kind={'no-results'}
        size={'panel'}
        icon={<TableGlyph name={'searchX'} />}
        title={query === '' ? labels.noResultsFilters : labels.noResults(query)}
        description={labels.noResultsHint}
        actions={[ { label: query === '' ? labels.clearFilters : labels.clearFiltersAndSearch, role: 'clear', onClick: clearAllFilters } ]}
      />
    );
  }

  const keysLine = (
    <span aria-hidden={'true'} className={'ms-auto flex shrink-0 items-center gap-3'}>
      {labels.keys.map((key) => (
        <span key={key.label} className={'inline-flex items-center gap-1'}>
          {key.keys.map((name) => <kbd key={name} className={KBD}>{name}</kbd>)}
          <span>{key.label}</span>
        </span>
      ))}
    </span>
  );

  const toolbar = (
    <div data-slot={'modal-selector-toolbar'} className={'flex min-w-0 flex-col gap-2'}>
      <div className={'flex h-7 min-w-0 items-center gap-2'}>
        {onlySelected && (
          <span className={'inline-flex shrink-0 items-center'}>
            <span className={'inline-flex h-control-sm items-center rounded-s-md bg-primary-soft ps-2.5 pe-1.5 text-xs font-medium text-primary-soft-foreground'}>
              {labels.onlySelected}
            </span>
            <IconButton
              label={labels.removeOnlySelected}
              icon={<ClearGlyph />}
              size={'sm'}
              fill={'soft'}
              tone={'primary'}
              className={'w-6 rounded-s-none focus-visible:-outline-offset-2 focus-visible:ring-0'}
              onClick={() => setOnlySelected(false)}
            />
          </span>
        )}

        <div inert={onlySelected} className={cn('flex min-w-0 flex-1 items-center gap-2', onlySelected && 'opacity-50')}>
          <Tooltip content={search.label} disabled={quietSearch}>
            <SearchInput
              size={'sm'}
              role={'combobox'}
              aria-label={search.label}
              aria-expanded={'true'}
              aria-controls={`${baseId}-list`}
              aria-activedescendant={active ? `${baseId}-${active}` : undefined}
              aria-autocomplete={'list'}
              aria-description={labels.instructions}
              autoComplete={'off'}
              placeholder={search.placeholder}
              value={search.value}
              onValueChange={search.onValueChange}
              onKeyDown={handleSearchKeyDown}
              onPointerEnter={() => setQuietSearch(false)}
              labels={{ clear: labels.filtersBar.clearSearch }}
              className={'w-60 shrink-0'}
            />
          </Tooltip>

          {filters && filters.length > 0 && (
            <FiltersBar filters={filters} onClear={onClearFilters ?? (() => undefined)} labels={labels.filtersBar} />
          )}
        </div>
      </div>

      <div data-slot={'modal-selector-count'} className={'flex h-4 min-w-0 items-center gap-2 text-xs text-muted-foreground tabular-nums'}>
        <span className={'truncate'}>{countText}</span>
        {showSelectAll && (
          <Button size={'sm'} fill={'plain'} tone={'primary'} className={'h-4 px-1'} onClick={() => setDraft({ all: true, excludedIds: [] })}>
            {labels.selectAll(rowCount ?? 0)}
          </Button>
        )}
        {keysLine}
      </div>

      <div role={'status'} className={'sr-only'}>{waiting ? '' : countText}</div>
    </div>
  );

  let footerStart: React.ReactNode = null;

  if (props.multiple) {
    footerStart = (
      <span className={'flex items-center gap-2'}>
        <span aria-live={'polite'} className={'text-sm font-medium tabular-nums'}>
          {draft.all ? labels.allSelected(count, draft.excludedIds.length) : labels.selected(count)}
        </span>
        {count > 0 && !draft.all && (
          <Button size={'sm'} fill={'plain'} tone={'primary'} aria-pressed={onlySelected} onClick={() => setOnlySelected((value) => !value)}>
            {labels.showOnlySelected}
          </Button>
        )}
      </span>
    );
  }
  else if (props.selectedRow) {
    const current = getRowLabel(props.selectedRow);

    footerStart = <span className={'truncate text-sm text-muted-foreground'}>{labels.current(current.label, current.code)}</span>;
  }

  const canConfirm = multiple ? count > 0 : pick !== null && !failed;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size={'lg'}
      title={title}
      description={description}
      icon={icon}
      iconTone={iconTone}
      toolbar={toolbar}
      error={confirmError ? labels.confirmError : undefined}
      dirty={dirty}
      discard={props.multiple ? props.discard : undefined}
      busy={confirming ? 'submit' : false}
      returnFocus={returnFocus}
      footerStart={footerStart}
      footer={(
        <React.Fragment>
          <Dialog.Cancel>{labels.cancel}</Dialog.Cancel>
          <Button disabled={!canConfirm} onClick={() => confirmWith(pick)}>{confirmLabel(count)}</Button>
        </React.Fragment>
      )}
      labels={{ close: labels.close, busySubmit: labels.busySubmit }}
    >
      <div className={'flex h-88 min-h-56 flex-col pb-2'}>
        <div
          data-slot={'modal-selector-frame'}
          data-mode={mode}
          data-multiple={multiple || undefined}
          data-status={status}
          className={'relative flex max-h-full min-h-0 flex-col overflow-hidden rounded-md border border-border'}
        >
          {showBusy && <LoadingBar className={'absolute inset-x-0 top-8 z-30 -mt-0.5'} />}

          <div
            ref={scrollerRef}
            onScroll={(event) => markScroll(event.currentTarget)}
            className={'group/scroller relative isolate min-h-0 overflow-auto overscroll-contain'}
          >
            <table
              id={`${baseId}-list`}
              role={'listbox'}
              aria-label={labels.caption}
              aria-multiselectable={multiple || undefined}
              aria-busy={waiting || undefined}
              data-slot={'modal-selector-list'}
              style={{ minWidth: `calc(var(--spacing) * ${minSteps})` }}
              className={'w-full table-fixed border-separate border-spacing-0 text-sm tabular-nums'}
            >
              <ColumnGroup columns={columns} leading={multiple} trailing={false} />

              <thead aria-hidden={'true'}>
                <tr>
                  {multiple && <th className={cn(HEAD, PIN_START, 'start-0 z-30')} />}
                  {columns.map((column, index) => (
                    <th
                      key={column.id}
                      className={cn(HEAD, ALIGN_CLASS[columnAlign(asColumn(column))], index === 0 && cn(PIN_START, pinAt, 'z-30'))}
                    >
                      <span className={'block truncate'}>{column.header}</span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody role={'presentation'} className={cn(status === 'fetching' && showBusy && 'pointer-events-none opacity-60')}>
                {firstLoad
                  ? <SkeletonRows rows={SKELETON_ROWS} columns={columns} leading={multiple} trailing={false} />
                  : !failed && rows.map(renderRow)}
              </tbody>
            </table>

            {state}
          </div>
        </div>
      </div>

      <TruncationTooltip handle={tooltipHandle} />
    </Dialog>
  );

}

ModalSelector.displayName = 'ModalSelector';
