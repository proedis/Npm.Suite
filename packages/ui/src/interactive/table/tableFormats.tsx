'use client';

import * as React from 'react';

import { optionalContextBuilder } from '@proedis/react';

import type { TableNumberFormat } from './tableTypes';


/* --------
 * Types Definition
 * -------- */

/**
 * How the values of the kinds read, given once by the application with its own formatters: the
 * package knows no locale and no date library. Each function answers `''` for a value it cannot read.
 */
export interface TableFormats {
  readonly date: (value: unknown) => string;
  readonly datetime: (value: unknown) => string;
  readonly number: (value: unknown, format: TableNumberFormat) => string;

  /** The label of a domain value, for `enum` and `status` columns */
  readonly enumLabel: (value: unknown) => string;
}

export interface TableFormatsProviderProps {
  formats: TableFormats;
  children?: React.ReactNode;
}


/* --------
 * Constants Definition
 * -------- */

const asText = (value: unknown): string => (value === null || value === undefined ? '' : String(value));

/** Without a provider a value reads as it is: visible in a review, never thrown */
const RAW_FORMATS: TableFormats = {
  date    : asText,
  datetime: asText,
  number  : (value) => asText(value),
  enumLabel: asText
};

const [ TableFormatsContext, useTableFormatsContext ] = optionalContextBuilder<TableFormats>('TableFormats', RAW_FORMATS);


/* --------
 * Component Definition
 * -------- */

/**
 * The formats of the table's kinds, mounted once at the top of the application. The same values
 * read the same way in the Table and in the ModalSelector.
 *
 * ```tsx
 * const formats: TableFormats = {
 *   date     : (value) => dateFormatter(value),
 *   datetime : (value) => dateTimeFormatter(value),
 *   number   : (value, format) => numberFormatters[format](value),
 *   enumLabel: (value) => enumLabel(value)
 * };
 *
 * <TableFormatsProvider formats={formats}>…</TableFormatsProvider>
 * ```
 *
 * Keep `formats` a constant of the module, or memoized: every cell reads it.
 */
export function TableFormatsProvider(props: TableFormatsProviderProps): React.ReactNode {
  const { children, formats } = props;

  return <TableFormatsContext.Provider value={formats}>{children}</TableFormatsContext.Provider>;
}

TableFormatsProvider.displayName = 'TableFormatsProvider';


/** The formats in effect, for the cells of the package */
export function useTableFormats(): TableFormats {
  return useTableFormatsContext();
}
