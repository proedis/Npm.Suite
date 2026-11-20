'use client';

import * as React from 'react';

import { Button } from '../../actions/button/Button';
import { IconButton } from '../../actions/button/IconButton';
import { Select } from '../../forms/select/Select';

import { TableGlyph } from './tableGlyphs';
import { lastPageIndex } from './tableState';

import type { TableGlyphName } from './tableGlyphs';
import type { TableLabels } from './tableTypes';


/* --------
 * Types Definition
 * -------- */

export interface TablePaginationProps<TData> {
  pageIndex: number;
  pageSize: number;
  rowCount: number;

  /** How many rows the page shows: the position says the rows on screen */
  shown: number;

  pageSizeOptions: readonly number[];
  onPageChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;

  /** The page did not arrive: the rows of the last one stay, the footer says which ones are missing */
  failed?: { onRetry?: () => void };

  labels: TableLabels<TData>;
}


/* --------
 * Helpers
 * -------- */

/**
 * The Select needs the texts of its search and of its clear button: a list of three page sizes has
 * neither, because it is under the search threshold and required.
 */
const NO_SELECT_TEXTS = { search: '', noResults: '', clear: '' };

function Arrow(props: { glyph: TableGlyphName; label: string; off: boolean; onClick: () => void }): React.ReactNode {
  const { glyph, label, off, onClick } = props;

  return (
    <IconButton
      label={label}
      icon={<TableGlyph name={glyph} className={'rtl:rotate-180'} />}
      size={'sm'}
      fill={'plain'}
      tone={'muted'}
      aria-disabled={off || undefined}
      data-disabled={off ? '' : undefined}
      onClick={() => {
        if (!off) {
          onClick();
        }
      }}
    />
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * The footer: rows per page, the position, four arrows. No jump to a page: a long list is narrowed
 * with filters and search, not leafed through. At the first and last page the arrows are
 * `aria-disabled`, not `disabled`, so their tooltip opens and they stay in the Tab order.
 */
export function TablePagination<TData>(props: TablePaginationProps<TData>): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { failed, labels, onPageChange, onPageSizeChange, pageIndex, pageSize, pageSizeOptions, rowCount, shown } = props;


  // ----
  // Internal Hooks
  // ----
  const labelId = React.useId();


  // ----
  // Style Computation
  // ----
  const last = lastPageIndex(rowCount, pageSize);
  const from = rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min(rowCount, pageIndex * pageSize + Math.max(shown, 0));
  const atStart = pageIndex <= 0;
  const atEnd = pageIndex >= last;


  // ----
  // Component Render
  // ----
  return (
    <div
      data-slot={'table-pagination'}
      className={'flex h-11 shrink-0 items-center gap-2 border-t border-border ps-3 pe-2 text-xs text-muted-foreground tabular-nums'}
    >
      <span id={labelId} className={'shrink-0'}>{labels.rowsPerPage}</span>
      <Select
        size={'sm'}
        required
        options={pageSizeOptions.map((option) => ({ value: String(option), label: String(option) }))}
        value={String(pageSize)}
        onValueChange={(value) => {
          if (value) {
            onPageSizeChange(Number(value));
          }
        }}
        aria-label={labels.rowsPerPage}
        labels={NO_SELECT_TEXTS}
        className={'w-18 shrink-0'}
      />

      <span className={'flex-1'} />

      {failed && (
        <span data-slot={'table-pagination-error'} className={'flex min-w-0 items-center gap-1 text-destructive'}>
          <span className={'truncate'}>{labels.rowsError(pageIndex * pageSize + 1, Math.min(rowCount, (pageIndex + 1) * pageSize))}</span>
          {failed.onRetry && (
            <Button size={'sm'} fill={'plain'} tone={'destructive'} onClick={failed.onRetry}>{labels.retry}</Button>
          )}
        </span>
      )}

      <span className={'shrink-0 text-foreground'}>{labels.range(from, to, rowCount)}</span>

      <span className={'ms-2 inline-flex shrink-0 gap-1'}>
        <Arrow glyph={'first'} label={labels.firstPage} off={atStart} onClick={() => onPageChange(0)} />
        <Arrow glyph={'previous'} label={labels.previousPage} off={atStart} onClick={() => onPageChange(pageIndex - 1)} />
        <Arrow glyph={'next'} label={labels.nextPage} off={atEnd} onClick={() => onPageChange(pageIndex + 1)} />
        <Arrow glyph={'last'} label={labels.lastPage} off={atEnd} onClick={() => onPageChange(last)} />
      </span>
    </div>
  );

}

TablePagination.displayName = 'TablePagination';
