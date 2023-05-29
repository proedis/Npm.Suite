import type * as React from 'react';

import { createStyles, getSize, rem } from '@mantine/core';
import type { MantineNumberSize, MantineColor } from '@mantine/core';

import { TABLE_REFS } from './Table.constants';


/* --------
 * Style Params
 * -------- */
export interface TableStyleParams {
  /** The table border color */
  borderColor: MantineColor;

  /** Set the horizontal spacing */
  horizontalSpacing: MantineNumberSize;

  /** Set the table layout */
  layout: React.CSSProperties['tableLayout'];

  /** Set the vertical spacing */
  verticalSpacing: MantineNumberSize;
}


/* --------
 * Style Definition
 * -------- */
export default createStyles((theme, params: TableStyleParams) => {

  /** Create the default border style for headers and footers */
  const borderColor = theme.fn.variant({ variant: 'filled', color: params.borderColor });
  const thickBorder = `${rem(2)} solid ${borderColor}`;
  const thinBorder = `${rem(1)} solid ${borderColor}`;

  /** Build the table style */
  return {
    root: {

      // ----
      // Define Base Table Style
      // ----
      ...theme.fn.fontStyles(),
      display       : 'table',
      color         : theme.black,
      width         : '100%',
      maxWidth      : '100%',
      lineHeight    : theme.lineHeight,
      border        : 'none',
      borderCollapse: 'collapse',
      tableLayout   : params.layout,


      // ----
      // Define Cell Gutter
      // ----
      [`.${TABLE_REFS.ROW} .${TABLE_REFS.CELL}`]: {
        padding: [
          getSize({ size: params.verticalSpacing, sizes: theme.spacing }),
          getSize({ size: params.horizontalSpacing, sizes: theme.spacing })
        ].join(' ')
      },


      // ----
      // Header Cell Style must be defined in the root element to override local style
      // ----
      [`.${TABLE_REFS.HEADER} .${TABLE_REFS.HEADER_CELL}`]: {
        color: theme.colors.cloud[4],

        '&[data-sortable]': {
          cursor: 'pointer',

          '&:hover': theme.fn.hover({
            color: theme.colors.primary[4]
          }),

          '&[data-sorted]': {
            color: theme.colors.primary[5]
          }
        }
      },


      // ----
      // Define Responsive Table
      // ----
      '&[data-responsive]': {
        [theme.fn.smallerThan('md')]: {
          overflowX: 'auto',
          display  : 'block'
        }
      },


      // ----
      // Define Solid Table
      // ----
      '&[data-solid]': {
        backgroundColor: theme.white,
        borderRadius   : theme.radius.lg,
        boxShadow      : theme.shadows.xs
      },


      // ----
      // Define Bordered Table
      // ----
      '&[data-bordered]': {
        border: thinBorder
      },

      // ----
      // Define Rows and Contents Divider
      // ----
      '&[data-divided]': {
        [`.${TABLE_REFS.HEADER} .${TABLE_REFS.ROW}:last-of-type .${TABLE_REFS.CELL}`]: {
          borderBottom: thickBorder
        },

        [`.${TABLE_REFS.BODY} .${TABLE_REFS.ROW}:not(:last-of-type) .${TABLE_REFS.CELL}`]: {
          borderBottom: thinBorder
        },

        [`.${TABLE_REFS.FOOTER} .${TABLE_REFS.ROW}:first-of-type .${TABLE_REFS.CELL}`]: {
          borderTop: thickBorder
        },

        [`.${TABLE_REFS.ROW} .${TABLE_REFS.CELL}:not(:last-of-type)`]: {
          borderRight: thinBorder
        }
      },


      // ----
      // Define striped row
      // ----
      '&[data-striped]': {
        [`.${TABLE_REFS.BODY} .${TABLE_REFS.ROW}:nth-of-type(odd)`]: {
          backgroundColor: theme.colors.cloud[0]
        }
      }
    }
  };

});
