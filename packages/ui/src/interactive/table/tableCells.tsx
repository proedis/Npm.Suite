'use client';

import * as React from 'react';

import { Badge } from '../../components/Badge';
import { cn } from '../../core/cn';
import { linkProps } from '../../core/link';

import { AvatarGroup, Person } from '../person/Person';

import { TableGlyph } from './tableGlyphs';

import type { TableFormats } from './tableFormats';
import type { TableColumn, TableColumnWidth, TableLabels, TablePersonValue } from './tableTypes';
import type { AvatarGroupItem } from '../person/Person';


/* --------
 * Types Definition
 * -------- */

/** The texts a cell reads: the empty value and the two booleans */
export type TableCellLabels = Pick<TableLabels<unknown>, 'yes' | 'no' | 'noValue'>;


/* --------
 * Measures
 * -------- */

/** The widths of the kinds' steps, the checkbox and the actions, as `col` classes */
export const COLUMN_WIDTH: Readonly<Record<Exclude<TableColumnWidth, 'fill'>, string>> = {
  xs: 'w-16',
  sm: 'w-24',
  md: 'w-35',
  lg: 'w-50'
};

/** The same steps in units of `--spacing`, to give the table its minimum width */
export const COLUMN_STEPS: Readonly<Record<TableColumnWidth, number>> = { xs: 16, sm: 24, md: 35, lg: 50, fill: 50 };

export const SELECT_COLUMN_STEPS = 10;
export const ACTIONS_COLUMN_STEPS = 28;

export type CellAlign = 'start' | 'center' | 'end';

export function columnAlign<TData>(column: TableColumn<TData>): CellAlign {
  if (column.kind === 'number') {
    return 'end';
  }

  if (column.kind === 'boolean') {
    return 'center';
  }

  return column.kind === 'custom' ? column.align ?? 'start' : 'start';
}

export const ALIGN_CLASS: Readonly<Record<CellAlign, string>> = {
  start : 'text-start',
  center: 'text-center',
  end   : 'text-end'
};


/* --------
 * Values
 * -------- */

/** The value of a cell, through the column's accessor or the key named like its id */
export function readCellValue<TData>(column: TableColumn<TData>, row: TData): unknown {
  const { accessor } = column;

  if (typeof accessor === 'function') {
    return accessor(row);
  }

  return (row as Record<string, unknown>)[accessor ?? column.id];
}

export function isAbsent(value: unknown): boolean {
  return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
}

function isPeople(value: unknown): value is readonly AvatarGroupItem[] {
  return Array.isArray(value);
}

/**
 * The text a cell reads as, for the tooltip of a truncated value and for the client sort. `null` for
 * a cell that has no text of its own (a boolean, a custom cell, a group of people).
 */
export function cellText<TData>(column: TableColumn<TData>, value: unknown, formats: TableFormats): string | null {
  if (isAbsent(value)) {
    return null;
  }

  switch (column.kind) {
    case 'code':
    case 'reference':
    case 'text':
      return String(value);

    case 'enum':
    case 'status':
      return formats.enumLabel(value);

    case 'date':
      return formats.date(value);

    case 'datetime':
      return formats.datetime(value);

    case 'number':
      return formats.number(value, column.format ?? 'integer');

    case 'person':
      return isPeople(value) ? null : (value as TablePersonValue).name;

    default:
      return null;
  }
}

/**
 * What the engine sorts by in a client table: the name of a person, the raw value of the rest. An
 * absent value is `undefined`, which the engine puts last.
 */
export function sortValue<TData>(column: TableColumn<TData>, row: TData): unknown {
  const value = readCellValue(column, row);

  if (isAbsent(value)) {
    return undefined;
  }

  if (column.kind === 'person') {
    return isPeople(value) ? undefined : (value as TablePersonValue).name;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  /* A dayjs value, or anything else that reads as a number, compares as that number */
  if (typeof value === 'object' && typeof (value as { valueOf?: unknown }).valueOf === 'function') {
    const primitive = (value as { valueOf: () => unknown }).valueOf();

    return typeof primitive === 'number' ? primitive : String(value);
  }

  return value;
}


/* --------
 * Rendering
 * -------- */

const LINK = 'outline-none hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring';

function Truncated(props: { children: React.ReactNode; className?: string }): React.ReactNode {
  return <span data-truncate className={cn('block truncate', props.className)}>{props.children}</span>;
}

function Absent(props: { labels: TableCellLabels }): React.ReactNode {
  return (
    <span data-slot={'table-cell-empty'} className={'text-muted-foreground'}>
      <span aria-hidden>—</span>
      <span className={'sr-only'}>{props.labels.noValue}</span>
    </span>
  );
}

/** The content of one cell, from the kind of its column */
export function CellContent<TData>(props: {
  column: TableColumn<TData>;
  row: TData;
  formats: TableFormats;
  labels: TableCellLabels;
}): React.ReactNode {
  const { column, formats, labels, row } = props;

  if (column.kind === 'custom') {
    return column.cell(row);
  }

  const value = readCellValue(column, row);

  if (column.kind === 'boolean') {
    return value === true
      ? (
        <span className={'inline-flex align-middle text-muted-foreground'}>
          <TableGlyph name={'check'} className={'size-4'} />
          <span className={'sr-only'}>{labels.yes}</span>
        </span>
      )
      : <span className={'sr-only'}>{labels.no}</span>;
  }

  if (isAbsent(value)) {
    return <Absent labels={labels} />;
  }

  switch (column.kind) {
    case 'code':
    case 'reference': {
      const target = column.target?.(row);
      const text = String(value);

      if (!target) {
        return <Truncated className={column.kind === 'code' ? 'font-medium' : undefined}>{text}</Truncated>;
      }

      return (
        <a
          {...linkProps(target)}
          data-grid-target
          data-truncate
          className={cn(
            'block truncate rounded-sm text-primary-soft-foreground',
            column.kind === 'code' ? 'font-medium' : 'font-normal',
            LINK
          )}
        >
          {text}
        </a>
      );
    }

    case 'status': {
      const { fill = 'soft', tone } = column.tone(value, row);

      return (
        <Badge dot tone={tone} fill={fill} className={'max-w-full align-middle'}>
          {formats.enumLabel(value)}
        </Badge>
      );
    }

    case 'person': {
      if (isPeople(value)) {
        const group = column.group?.(value, row);

        return (
          <AvatarGroup
            items={value}
            size={24}
            label={group?.label ?? ''}
            title={group?.title ?? null}
            className={'align-middle'}
          />
        );
      }

      const person = value as TablePersonValue;

      return <Person avatar={person.avatar} name={person.name} target={person.target} className={'align-middle'} />;
    }

    default:
      return <Truncated>{cellText(column, value, formats)}</Truncated>;
  }
}
