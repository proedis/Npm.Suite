import * as React from 'react';

import { Tabs } from '@proedis/ui/actions/tabs';
import { Stack } from '@proedis/ui/layout';

import type { TabsRadius } from '@proedis/ui/actions/tabs';


const RADII: readonly TabsRadius[] = [ 'none', 'default', 'full' ];


/** The tabs and the fill take the corner of the rail less its padding: the two stay concentric */
export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full max-w-md'}>
      {RADII.map((radius) => (
        <Tabs key={radius} aria-label={`Round, radius ${radius}`} radius={radius} defaultValue={'data'} labels={{ overflow: 'More' }}>
          <Tabs.Panel value={'data'} label={'Data'}>
            <p className={'text-sm text-muted-foreground'}>{`radius="${radius}"`}</p>
          </Tabs.Panel>
          <Tabs.Panel value={'route'} label={'Route'}>{null}</Tabs.Panel>
          <Tabs.Panel value={'crew'} label={'Crew'}>{null}</Tabs.Panel>
        </Tabs>
      ))}
    </Stack>
  );
}
