import { contextBuilder } from '@proedis/react';
import type { AnyObject } from '@proedis/types';

import type { EmptyContentProps } from '../EmptyContent';

import type { RxTableFactory } from './RxTable.factory';


/* --------
 * RxTable Context Definition
 * -------- */
export interface RxTableContext<Data extends AnyObject> extends RxTableFactory<Data> {
  /** Set default empty content props, used to render an EmptyContent when no data are defined */
  noDataEmptyContentProps?: Partial<EmptyContentProps>;

  /** Set default empty content props, used to render an EmptyContent when no data exists after filter */
  noFilteredDataEmptyContentProps?: Partial<EmptyContentProps>;
}


/* --------
 * Context Building
 * -------- */
const {
  useRxTable: defaultUseRxTable,
  RxTableProvider,
  RxTableConsumer
} = contextBuilder<RxTableContext<any>, 'RxTable'>('RxTable');

function useRxTable<Data extends AnyObject>(): RxTableContext<Data> {
  return defaultUseRxTable();
}

export {
  useRxTable,
  RxTableProvider,
  RxTableConsumer
};
