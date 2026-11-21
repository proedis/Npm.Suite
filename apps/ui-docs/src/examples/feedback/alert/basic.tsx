import * as React from 'react';

import { Alert } from '@proedis/ui/feedback/alert';


export default function Example(): React.ReactNode {
  return (
    <Alert tone={'info'} className={'w-full max-w-xl'}>
      Collections on public holidays move to the next working day.
    </Alert>
  );
}
