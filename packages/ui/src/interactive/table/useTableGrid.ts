'use client';

import * as React from 'react';


/* --------
 * Types Definition
 * -------- */

export interface TableGridOptions {
  /** Space on a body row: choose it, with Shift the range from the last one chosen */
  onSpace?: (row: HTMLTableRowElement, shift: boolean) => void;

  /** Shift F10 or the Menu key on a body row: its menu, anchored to its ⋯ */
  onRowMenu?: (row: HTMLTableRowElement) => void;
}

export interface TableGrid {
  onKeyDown: (event: React.KeyboardEvent<HTMLTableElement>) => void;
  onFocus: (event: React.FocusEvent<HTMLTableElement>) => void;
}

interface Position {
  row: number;
  col: number;
}


/* --------
 * Constants Definition
 * -------- */

const FOCUSABLE = 'a[href], button, input:not([type="hidden"]), select, textarea, [role="checkbox"], [tabindex]';

/** What takes the focus in a cell: a marked control, a link, a button that is not a hover shortcut, a checkbox */
const TARGET = '[data-grid-target], a[href], button:not([data-grid-skip]), [role="checkbox"]';

const TYPEABLE = 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]), textarea, select, [contenteditable="true"], [role="combobox"], [role="textbox"]';


/* --------
 * Helpers
 * -------- */

function gridRows(table: HTMLTableElement): HTMLTableRowElement[] {
  return Array.from(table.querySelectorAll<HTMLTableRowElement>(':scope > thead > tr, :scope > tbody > tr[data-grid-row]'));
}

function rowCells(row: HTMLTableRowElement): HTMLElement[] {
  return Array.from(row.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
}

function cellTarget(cell: HTMLElement): HTMLElement {
  return cell.querySelector<HTMLElement>(TARGET) ?? cell;
}

function isBodyRow(row: HTMLTableRowElement): boolean {
  return row.parentElement?.tagName === 'TBODY';
}

/** The first visit lands on the code of the first row, or its first cell */
function entryPosition(rows: HTMLTableRowElement[]): Position {
  const firstBody = rows.findIndex(isBodyRow);

  if (firstBody < 0) {
    return { row: 0, col: 0 };
  }

  const code = rowCells(rows[firstBody]!).findIndex((cell) => cell.dataset.kind === 'code');

  return { row: firstBody, col: Math.max(0, code) };
}


/* --------
 * Hook Definition
 * -------- */

/**
 * The table as a grid: one stop in the Tab order, the arrows inside. The stop is the last cell
 * visited, the first time the code of the first row. A cell with a control gives the focus to it;
 * a cell without one takes it itself, so a truncated value can be read in its tooltip.
 *
 * The roving tab index is written on the DOM after each render rather than through props, because the
 * controls inside the cells (links, checkboxes, the ⋯, a custom cell) are not ours to render. When the
 * focused control disappears with its row, the focus goes to the same place in the rows that remain.
 */
export function useTableGrid(ref: { readonly current: HTMLTableElement | null }, options: TableGridOptions): TableGrid {

  // ----
  // Options Deconstruct
  // ----
  const { onRowMenu, onSpace } = options;


  // ----
  // Internal State
  // ----
  const activeRef = React.useRef<Position | null>(null);
  const lastFocusedRef = React.useRef<HTMLElement | null>(null);


  // ----
  // Handlers
  // ----
  const resolve = React.useCallback((table: HTMLTableElement): { rows: HTMLTableRowElement[]; position: Position } => {
    const rows = gridRows(table);
    const wanted = activeRef.current ?? entryPosition(rows);
    const row = Math.min(Math.max(0, wanted.row), Math.max(0, rows.length - 1));
    const cells = rows[row] ? rowCells(rows[row]) : [];
    const col = Math.min(Math.max(0, wanted.col), Math.max(0, cells.length - 1));

    return { rows, position: { row, col } };
  }, []);

  const sync = React.useCallback((): HTMLElement | null => {
    const table = ref.current;

    if (!table) {
      return null;
    }

    const { position, rows } = resolve(table);
    let active: HTMLElement | null = null;

    rows.forEach((row, rowIndex) => {
      rowCells(row).forEach((cell, colIndex) => {
        const target = cellTarget(cell);

        cell.querySelectorAll<HTMLElement>(FOCUSABLE).forEach((element) => {
          element.tabIndex = -1;
        });

        if (target === cell) {
          cell.tabIndex = -1;
        }
        else {
          cell.removeAttribute('tabindex');
        }

        if (rowIndex === position.row && colIndex === position.col) {
          target.tabIndex = 0;
          active = target;
        }
      });
    });

    return active;
  }, [ ref, resolve ]);

  const focusAt = (position: Position): void => {
    activeRef.current = position;

    const target = sync();

    target?.focus();
    target?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  };

  const onFocus = (event: React.FocusEvent<HTMLTableElement>): void => {
    const table = ref.current;
    const cell = (event.target as HTMLElement).closest<HTMLElement>('th, td');
    const row = cell?.parentElement;

    if (!table || !cell || !(row instanceof HTMLTableRowElement)) {
      return;
    }

    const rows = gridRows(table);
    const rowIndex = rows.indexOf(row);

    if (rowIndex < 0) {
      return;
    }

    lastFocusedRef.current = event.target as HTMLElement;
    activeRef.current = { row: rowIndex, col: rowCells(row).indexOf(cell) };
    sync();
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTableElement>): void => {
    const table = ref.current;
    const element = event.target as HTMLElement;
    const cell = element.closest<HTMLElement>('th, td');
    const row = cell?.parentElement;

    if (!table || !cell || !(row instanceof HTMLTableRowElement)) {
      return;
    }

    /*
     * Before anything else, because the checkbox handles both keys itself and stops them: Space on it
     * chooses the row here, where Shift is known; F10 is not its key at all.
     */
    if (isBodyRow(row) && element.getAttribute('role') === 'checkbox' && event.key === ' ' && onSpace) {
      event.preventDefault();
      onSpace(row, event.shiftKey);
      return;
    }

    if (event.defaultPrevented) {
      return;
    }

    /* A field in a cell keeps its own keys */
    if (element.matches(TYPEABLE)) {
      return;
    }

    const rows = gridRows(table);
    const rowIndex = rows.indexOf(row);

    if (rowIndex < 0) {
      return;
    }

    const colIndex = rowCells(row).indexOf(cell);
    const rtl = getComputedStyle(table).direction === 'rtl';
    const lastRow = rows.length - 1;
    const lastCol = (index: number): number => rowCells(rows[index]!).length - 1;

    let next: Position | null = null;

    switch (event.key) {
      case 'ArrowUp':
        next = { row: Math.max(0, rowIndex - 1), col: colIndex };
        break;

      case 'ArrowDown':
        next = { row: Math.min(lastRow, rowIndex + 1), col: colIndex };
        break;

      case 'ArrowLeft':
      case 'ArrowRight': {
        const forward = (event.key === 'ArrowRight') !== rtl;

        next = { row: rowIndex, col: Math.min(lastCol(rowIndex), Math.max(0, colIndex + (forward ? 1 : -1))) };
        break;
      }

      case 'Home': {
        const firstBody = rows.findIndex(isBodyRow);

        next = event.ctrlKey || event.metaKey ? { row: Math.max(0, firstBody), col: 0 } : { row: rowIndex, col: 0 };
        break;
      }

      case 'End':
        next = event.ctrlKey || event.metaKey
          ? { row: lastRow, col: lastCol(lastRow) }
          : { row: rowIndex, col: lastCol(rowIndex) };
        break;

      case ' ': {
        /* The ⋯ and the other buttons open on Space; on a link or a plain cell it chooses the row */
        const native = element.tagName === 'BUTTON';

        if (isBodyRow(row) && onSpace && !native) {
          event.preventDefault();
          onSpace(row, event.shiftKey);
        }

        return;
      }

      case 'F10':
      case 'ContextMenu':
        if ((event.key === 'ContextMenu' || event.shiftKey) && isBodyRow(row) && onRowMenu) {
          event.preventDefault();
          onRowMenu(row);
        }

        return;

      default:
        return;
    }

    event.preventDefault();
    focusAt(next);
  };


  // ----
  // Lifecycle Events
  // ----
  React.useLayoutEffect(() => {
    const active = sync();
    const lost = lastFocusedRef.current;

    /* The focused control left with its row: the same place in the rows that remain takes it */
    if (lost && !lost.isConnected && (document.activeElement === document.body || document.activeElement === null)) {
      lastFocusedRef.current = null;
      active?.focus({ preventScroll: true });
    }
  });


  // ----
  // Hook Return
  // ----
  return { onKeyDown, onFocus };
}
