import * as React from 'react';

import { Truck } from 'lucide-react';

import { Badge } from '@proedis/ui/display/badge';
import { Heading } from '@proedis/ui/display/heading';
import { IconBox } from '@proedis/ui/display/icon-box';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';
import { Grid } from '@proedis/ui/layout';

import type { Tone } from '@proedis/ui/core';


const VEHICLES: readonly { plate: string; model: string; state: string; tone: Tone }[] = [
  { plate: 'FT-234-KL', model: 'Rear loader, 18 t', state: 'On a round', tone: 'success' },
  { plate: 'GA-118-PB', model: 'Side loader, 26 t', state: 'At the depot', tone: 'muted' },
  { plate: 'EZ-907-TM', model: 'Crane truck, 12 t', state: 'In the workshop', tone: 'warning' },
  { plate: 'HB-450-CN', model: 'Rear loader, 18 t', state: 'On a round', tone: 'success' },
  { plate: 'FX-071-DA', model: 'Sweeper', state: 'At the depot', tone: 'muted' }
];


export default function Example(): React.ReactNode {
  /* As many cards per row as fit at least 240px each: no breakpoint declared anywhere */
  return (
    <Grid minColWidth={240} gap={4} className={'w-full'}>
      {VEHICLES.map((vehicle) => (
        <Surface key={vehicle.plate} radius={'xl'}>
          <Surface.Header inset align={'start'}>
            <Item.Icon><IconBox size={'sm'} fill={'soft'} tone={'secondary'}><Truck /></IconBox></Item.Icon>
            <Item.Heading>
              <Heading.Title className={'font-mono'}>{vehicle.plate}</Heading.Title>
              <Heading.Description>{vehicle.model}</Heading.Description>
            </Item.Heading>
            <Item.Trailing>
              <Badge size={'sm'} fill={'soft'} tone={vehicle.tone}>{vehicle.state}</Badge>
            </Item.Trailing>
          </Surface.Header>
        </Surface>
      ))}
    </Grid>
  );
}
