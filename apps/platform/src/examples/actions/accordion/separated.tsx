import * as React from 'react';

import { Accordion } from '@proedis/ui/actions/accordion';


export default function Example(): React.ReactNode {
  return (
    <Accordion variant={'separated'} defaultValue={[ 'route' ]} className={'w-full max-w-lg'}>
      <Accordion.Item value={'route'} title={'Route'} meta={'38 stops'}>
        <p className={'text-sm text-muted-foreground'}>North district, starting from the depot at 06:00.</p>
      </Accordion.Item>

      <Accordion.Item value={'vehicle'} title={'Vehicle'} meta={'FT-234-KL'}>
        <p className={'text-sm text-muted-foreground'}>Rear loader, 18 cubic metres.</p>
      </Accordion.Item>

      <Accordion.Item value={'crew'} title={'Crew'} meta={'3 people'}>
        <p className={'text-sm text-muted-foreground'}>One driver and two operators.</p>
      </Accordion.Item>
    </Accordion>
  );
}
