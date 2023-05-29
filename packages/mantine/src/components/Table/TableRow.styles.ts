import { createStyles } from '@mantine/core';
import type { MantineColor } from '@mantine/core';

import { TABLE_REFS } from './Table.constants';


/* --------
 * Style Params
 * -------- */
export interface TableRowStyleParams {
  /** Set the row as clickable */
  clickable: boolean;

  /** Change the row background color */
  color?: MantineColor;
}


/* --------
 * Style Definition
 * -------- */
export default createStyles((theme, params: TableRowStyleParams) => {

  /** Compute the row background color */
  let backgroundColor: string | undefined = undefined;
  let backgroundHoverColor = theme.colors.cloud[1];
  let textColor = theme.black;

  /** Compute variant if color is defined */
  if (params.color) {
    const variant = theme.fn.variant({ variant: 'light', color: params.color });

    backgroundColor = variant.background as string;
    backgroundHoverColor = variant.hover as string;
    textColor = variant.color as string;
  }

  return {
    root: {
      ref            : TABLE_REFS.ROW,
      backgroundColor: backgroundColor ? `${backgroundColor} !important` : undefined,
      color          : textColor,

      ...(!params.clickable ? undefined : {
        cursor: 'pointer',

        '&:hover': theme.fn.hover({
          backgroundColor: `${backgroundHoverColor} !important`
        })
      })
    }
  };
});
