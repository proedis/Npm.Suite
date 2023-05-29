import type * as React from 'react';

import { createShorthandFactory } from '@proedis/react';

import TableHeaderCell from '../TableHeaderCell';


export const createTableHeaderCell = createShorthandFactory(
  TableHeaderCell,
  (header: React.ReactNode) => ({
    component: 'th' as React.ElementType,
    header
  })
);
