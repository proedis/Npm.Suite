import * as React from 'react';

import { Accordion } from '@proedis/ui/actions/accordion';
import { Grid } from '@proedis/ui/layout';

import type { AccordionRadius } from '@proedis/ui/actions/accordion';


const RADII: readonly AccordionRadius[] = [ 'none', 'md', 'default', '2xl' ];


export default function Example(): React.ReactNode {
  return (
    <Grid minColWidth={240} className={'w-full'}>
      {RADII.map((radius) => (
        <Accordion key={radius} variant={'separated'} radius={radius} defaultValue={[ 'open' ]}>
          <Accordion.Item value={'open'} title={`radius="${radius}"`}>
            <p className={'text-sm text-muted-foreground'}>The open item, with its border.</p>
          </Accordion.Item>
          <Accordion.Item value={'closed'} title={'Closed'}>
            <p className={'text-sm text-muted-foreground'}>A closed item.</p>
          </Accordion.Item>
        </Accordion>
      ))}
    </Grid>
  );
}
