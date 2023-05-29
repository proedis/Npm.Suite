import type { ShorthandCollection, UIVoidComponentProps } from '@proedis/react';

import type { DragDropContextProps } from 'react-beautiful-dnd';

import type { ItemProps } from './Item.types';


export type ItemGroupProps = UIVoidComponentProps<StrictItemGroupProps>;

export interface StrictItemGroupProps {
  /** Divide items using a line */
  divided?: boolean;

  /** Shorthand property to define item to render */
  items?: ShorthandCollection<ItemProps>;

  /** Shorthand handler for Sort End event */
  onSortEnd?: (result: { from: number, to: number }) => void;

  /** Add more space between items */
  relaxed?: boolean;

  /** Set the item list as sortable */
  sortable?: boolean;

  /** Set the sortable id container, this is required while rendering a sortable list */
  sortableId?: string;

  /** Set custom sortable props */
  sortableProps?: Partial<Omit<DragDropContextProps, 'children'>>;
}
