import type * as React from 'react';

import { createShorthandFactory } from '@proedis/react';

import TableCell from '../TableCell';


export const createTableCell = createShorthandFactory(
  TableCell,
  (header: React.ReactNode) => ({
    component: 'td' as React.ElementType,
    header
  })
);
