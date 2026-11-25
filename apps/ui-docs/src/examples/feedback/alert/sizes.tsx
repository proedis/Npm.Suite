import * as React from 'react';

import { Alert } from '@proedis/ui/feedback/alert';
import { Surface } from '@proedis/ui/display/surface';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={4} className={'w-full max-w-xl'}>
      {/* md: on the page background, with a shadow */}
      <Alert tone={'warning'} toneLabel={'Warning'} title={'Two stops without coordinates'}>
        They are left out of the map until an address is fixed.
      </Alert>

      {/* sm: inside a card, a drawer or a dialog, with a line */}
      <Surface className={'p-4'}>
        <Alert size={'sm'} tone={'warning'} toneLabel={'Warning'} title={'Two stops without coordinates'}>
          They are left out of the map until an address is fixed.
        </Alert>
      </Surface>
    </Stack>
  );
}
