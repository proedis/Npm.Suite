import * as React from 'react';

import { Heading } from '@proedis/ui/display/heading';
import { Surface } from '@proedis/ui/display/surface';
import { BusyVeil } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  return (
    <Surface className={'w-full max-w-md border border-border'}>
      <div className={'relative'} aria-busy>
        <Surface.Section>
          <Heading>
            <Heading.Title size={'lg'}>Order 2026/1184</Heading.Title>
            <Heading.Description>Skip hire, 12 m³, Via Roma 21, Chieri</Heading.Description>
          </Heading>
        </Surface.Section>
        <BusyVeil visible label={'Loading the order'} />
      </div>
    </Surface>
  );
}
