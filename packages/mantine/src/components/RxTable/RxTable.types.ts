import type * as React from 'react';

import type { UIVoidComponentProps } from '@proedis/react';
import type { AnyObject } from '@proedis/types';

import type { EmptyContentProps } from '../EmptyContent';

import type { StrictTableProps } from '../Table';

import type { UseRxTableFactoryConfig } from './RxTable.factory';


/* --------
 * RxTable Component
 * -------- */
export type RxTableProps<Data extends AnyObject> = UIVoidComponentProps<StrictRxTableProps<Data>, StrictTableProps>;

export interface StrictRxTableProps<Data extends AnyObject> extends Omit<UseRxTableFactoryConfig<Data>, 'width'> {
  /** The row key or a function to get it */
  getRowKey: keyof Data | ((row: Data, index: number, array: Data[]) => React.Key);

  /** Set the maximum width */
  maxWidth?: number;

  /** Set the minimum width */
  minWidth?: number;

  /** Set default empty content props, used to render an EmptyContent when no data are defined */
  noDataEmptyContentProps?: Partial<EmptyContentProps>;

  /** Set default empty content props, used to render an EmptyContent when no data exists after filter */
  noFilteredDataEmptyContentProps?: Partial<EmptyContentProps>;

  /** On Row Click Handler */
  onRowClick?: (row: Data, index: number, array: Data[]) => void;

  /** Table fixed Width */
  width?: number;
}
