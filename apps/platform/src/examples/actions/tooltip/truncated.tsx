import * as React from 'react';

import { Tooltip } from '@proedis/ui/actions/tooltip';
import { Stack } from '@proedis/ui/layout';


const CUSTOMERS = [
  'Rossi Costruzioni',
  'Cooperativa Agricola del Basso Monferrato e delle Colline Torinesi',
  'Bar Centrale'
];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={1} className={'w-60 text-sm'}>
      {CUSTOMERS.map((name) => (
        /* Opens only when the name does not fit, laid exactly over the clipped text */
        <Tooltip key={name} content={name} truncatedOnly align={'start'}>
          <span className={'truncate px-1 py-0.5'}>
            {name}
          </span>
        </Tooltip>
      ))}
    </Stack>
  );
}
