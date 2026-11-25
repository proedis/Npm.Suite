import * as React from 'react';

import { Alert } from '@proedis/ui/feedback/alert';
import { Stack } from '@proedis/ui/layout';

import type { AlertVariant } from '@proedis/ui/feedback/alert';


const VARIANTS: readonly AlertVariant[] = [ 'flat', 'soft', 'solid' ];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'xl'} className={'w-full max-w-xl'}>
      {VARIANTS.map((variant) => (
        <Stack key={variant} gap={'sm'}>
          <Alert variant={variant} tone={'info'} title={`variant="${variant}"`}>
            The winter calendar starts on Monday 4 November.
          </Alert>
          <Alert variant={variant} tone={'warning'} toneLabel={'Warning'} title={'Container with no contract'}>
            It is not emptied until it is assigned to a customer.
          </Alert>
          <Alert variant={variant} tone={'destructive'} toneLabel={'Error'} title={'Route cannot start'}>
            The vehicle FT-234-KL is in the workshop until Thursday.
          </Alert>
        </Stack>
      ))}
    </Stack>
  );
}
