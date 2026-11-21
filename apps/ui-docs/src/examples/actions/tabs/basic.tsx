import * as React from 'react';

import { Tabs } from '@proedis/ui/actions/tabs';

import type { TabItem } from '@proedis/ui/actions/tabs';


const ITEMS: readonly TabItem[] = [
  { value: 'data', label: 'Data' },
  { value: 'containers', label: 'Containers' },
  { value: 'history', label: 'History' }
];


export default function Example(): React.ReactNode {
  const [ tab, setTab ] = React.useState('data');

  return (
    <Tabs
      aria-label={'Collection point'}
      items={ITEMS}
      value={tab}
      onValueChange={setTab}
      labels={{ overflow: 'More' }}
      className={'w-full max-w-lg'}
    >
      <Tabs.Panel value={'data'}>
        <p className={'text-sm text-muted-foreground'}>Via Roma 14, Chieri. Weekly collection on Monday.</p>
      </Tabs.Panel>
      <Tabs.Panel value={'containers'}>
        <p className={'text-sm text-muted-foreground'}>Two for paper, one for glass, one for organic waste.</p>
      </Tabs.Panel>
      <Tabs.Panel value={'history'}>
        <p className={'text-sm text-muted-foreground'}>Last collection on Monday 14 October at 06:42.</p>
      </Tabs.Panel>
    </Tabs>
  );
}
