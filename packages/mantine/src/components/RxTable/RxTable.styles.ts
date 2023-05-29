import { createStyles } from '@mantine/core';


/* --------
 * Virtualization Styles
 * -------- */
export interface RxVirtualizedTableStylesParams {
  /** The filter row height */
  filterRowHeight: number;

  /** The footer row height */
  footerRowHeight: number;

  /** The header row height */
  headerRowHeight: number;

  /** The single row height */
  rowHeight: number;

  /** The total table height */
  totalTableHeight: number;
}

export const useVirtualizedStyle = createStyles((theme, params: RxVirtualizedTableStylesParams) => ({

  root: {
    display  : 'block',
    height   : params.totalTableHeight,
    overflow : 'auto',
    minHeight: params.headerRowHeight + params.filterRowHeight + params.footerRowHeight
  },

  section: {
    display : 'block',
    position: 'relative'
  },

  row: {
    display   : 'flex',
    flexWrap  : 'nowrap',
    alignItems: 'center',
    width     : '100%'
  },

  cell: {
    display      : 'flex',
    alignItems   : 'center',
    paddingTop   : '0 !important',
    paddingBottom: '0 !important',

    '& > div': {
      width: '100%'
    }
  },

  aboveContent: {
    zIndex: 2
  },

  filterHeight: {
    height   : params.filterRowHeight,
    maxHeight: params.filterRowHeight
  },

  footerHeight: {
    height   : params.footerRowHeight,
    maxHeight: params.footerRowHeight
  },

  headerHeight: {
    height   : params.headerRowHeight,
    maxHeight: params.headerRowHeight
  },

  rowHeight: {
    height   : params.rowHeight,
    maxHeight: params.rowHeight
  }

}));
