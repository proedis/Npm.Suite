import * as React from 'react';

import { Accordion } from '@proedis/ui/actions/accordion';


export default function Example(): React.ReactNode {
  return (
    <Accordion variant={'filled'} multiple={false} defaultValue={[ 'pickup' ]} className={'w-full max-w-lg'}>
      <Accordion.Item value={'pickup'} title={'When is my bin collected?'}>
        <p className={'text-sm text-muted-foreground'}>On the days printed on the calendar of your street, from 06:00.</p>
      </Accordion.Item>

      <Accordion.Item value={'missed'} title={'My bin was not emptied'}>
        <p className={'text-sm text-muted-foreground'}>Report it by noon of the following day and the crew comes back.</p>
      </Accordion.Item>

      <Accordion.Item value={'bulky'} title={'How do I dispose of a sofa?'}>
        <p className={'text-sm text-muted-foreground'}>Book a bulky waste pickup: it is free twice a year.</p>
      </Accordion.Item>
    </Accordion>
  );
}
