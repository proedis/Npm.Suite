import type { ComparableFieldType } from '../sorter/types';


export interface ISortable<V extends ComparableFieldType> {

  getSortableValue(): V;

}
