import * as React from 'react';

import { Accordion } from '@proedis/ui/actions/accordion';


export default function Example(): React.ReactNode {
  return (
    <Accordion variant={'contained'} chevronPosition={'end'} defaultValue={[ 'billing' ]} className={'w-full max-w-lg'}>
      <Accordion.Item value={'billing'} title={'Billing'} meta={'Monthly'}>
        <p className={'text-sm text-muted-foreground'}>Invoiced on the first working day of the month.</p>
      </Accordion.Item>

      <Accordion.Item value={'contacts'} title={'Contacts'} meta={'2 people'}>
        <p className={'text-sm text-muted-foreground'}>The site manager and the administration office.</p>
      </Accordion.Item>
    </Accordion>
  );
}
