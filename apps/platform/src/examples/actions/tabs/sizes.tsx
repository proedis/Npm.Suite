import * as React from 'react';

import { Tabs } from '@proedis/ui/actions/tabs';
import { Stack } from '@proedis/ui/layout';

import type { TabItem } from '@proedis/ui/actions/tabs';


const ITEMS: readonly TabItem[] = [
  { value: 'data', label: 'Data' },
  { value: 'route', label: 'Route' },
  { value: 'crew', label: 'Crew' }
];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={5} className={'w-full max-w-md'}>
      <Tabs aria-label={'Round, medium'} defaultValue={'data'} size={'md'} labels={{ overflow: 'More' }}>
        {ITEMS.map((item) => <Tabs.Panel key={item.value} {...item}>{null}</Tabs.Panel>)}
      </Tabs>
      <Tabs aria-label={'Round, small'} defaultValue={'data'} size={'sm'} labels={{ overflow: 'More' }}>
        {ITEMS.map((item) => <Tabs.Panel key={item.value} {...item}>{null}</Tabs.Panel>)}
      </Tabs>
    </Stack>
  );
}
