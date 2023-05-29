import { createStyles } from '@mantine/core';
import type { MantineColor } from '@mantine/core';

import { TABLE_REFS } from './Table.constants';


/* --------
 * Style Params
 * -------- */
export interface TableCellStyleParams {
  /** Set the text align */
  align: 'left' | 'center' | 'right';

  /** Set the text color */
  color?: MantineColor;

  /** Truncate the text */
  truncate: boolean;
}


/* --------
 * Styles Definition
 * -------- */
export default createStyles((theme, params: TableCellStyleParams) => ({

  root: {
    ...theme.fn.fontStyles(),
    ...theme.fn.focusStyles(),
    ref          : TABLE_REFS.CELL,
    color        : theme.fn.variant({ variant: 'filled', color: params.color }).background,
    position     : 'relative',
    verticalAlign: 'middle',
    textAlign    : params.align,
    outline      : 'none',
    fontSize     : theme.fontSizes.xs
  },

  contentWrapper: {
    flexGrow: 1,
    ...(!params.truncate ? {} : {
      overflow    : 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace  : 'nowrap'
    })
  },

  text: {
    display: 'block',
    ...(!params.truncate ? {} : {
      overflow    : 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace  : 'nowrap'
    })
  },

  header: {
    ref       : TABLE_REFS.CELL_HEADER,
    fontWeight: theme.other.fontWeight.medium
  },

  content: {
    ref     : TABLE_REFS.CELL_CONTENT,
    opacity : .75,
    fontSize: '.9em'
  },

  meta: {
    ref       : TABLE_REFS.CELL_META,
    fontSize  : '.9em',
    fontWeight: theme.other.fontWeight.medium,
    opacity   : .5
  }

}));
