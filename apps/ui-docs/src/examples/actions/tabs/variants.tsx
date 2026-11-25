import * as React from 'react';

import { Tabs } from '@proedis/ui/actions/tabs';
import { Stack } from '@proedis/ui/layout';

import type { TabsVariant } from '@proedis/ui/actions/tabs';


const VARIANTS: readonly TabsVariant[] = [ 'elevated', 'contained', 'plain' ];


/** The variants of SegmentedControl: one look for the two, each with its own meaning */
export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full max-w-md'}>
      {VARIANTS.map((variant) => (
        <Tabs key={variant} aria-label={`Round, ${variant}`} variant={variant} defaultValue={'data'} labels={{ overflow: 'More' }}>
          <Tabs.Panel value={'data'} label={'Data'}>
            <p className={'text-sm text-muted-foreground'}>{`variant="${variant}"`}</p>
          </Tabs.Panel>
          <Tabs.Panel value={'route'} label={'Route'}>{null}</Tabs.Panel>
          <Tabs.Panel value={'crew'} label={'Crew'}>{null}</Tabs.Panel>
        </Tabs>
      ))}
    </Stack>
  );
}
