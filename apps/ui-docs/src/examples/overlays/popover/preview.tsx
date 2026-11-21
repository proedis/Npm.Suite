import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { LabeledContent } from '@proedis/ui/display/labeled-content';
import { Stack } from '@proedis/ui/layout';
import { Popover } from '@proedis/ui/overlays/popover';


const FACTS: readonly (readonly [ string, string ])[] = [
  [ 'Stops', '38' ],
  [ 'Distance', '61 km' ],
  [ 'Vehicle', 'FT-234-KL' ],
  [ 'Driver', 'Luca Ferrero' ]
];


export default function Example(): React.ReactNode {
  return (
    <Popover
      title={'Route R-14'}
      width={'md'}
      trigger={<Button fill={'plain'}>R-14</Button>}
      labels={{ close: 'Close' }}
    >
      <Stack columns={2} gap={3}>
        {FACTS.map(([ label, value ]) => (
          <LabeledContent key={label}>
            <LabeledContent.Label>{label}</LabeledContent.Label>
            <LabeledContent.Value>{value}</LabeledContent.Value>
          </LabeledContent>
        ))}
      </Stack>
    </Popover>
  );
}
