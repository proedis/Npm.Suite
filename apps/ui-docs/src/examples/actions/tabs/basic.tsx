import * as React from 'react';

import { Tabs } from '@proedis/ui/actions/tabs';


export default function Example(): React.ReactNode {
  const [ tab, setTab ] = React.useState('data');

  return (
    <Tabs
      aria-label={'Collection point'}
      value={tab}
      onValueChange={setTab}
      labels={{ overflow: 'More' }}
      className={'w-full max-w-lg'}
    >
      <Tabs.Panel value={'data'} label={'Data'}>
        <p className={'text-sm text-muted-foreground'}>Via Roma 14, Chieri. Weekly collection on Monday.</p>
      </Tabs.Panel>
      <Tabs.Panel value={'containers'} label={'Containers'}>
        <p className={'text-sm text-muted-foreground'}>Two for paper, one for glass, one for organic waste.</p>
      </Tabs.Panel>
      <Tabs.Panel value={'history'} label={'History'}>
        <p className={'text-sm text-muted-foreground'}>Last collection on Monday 14 October at 06:42.</p>
      </Tabs.Panel>
    </Tabs>
  );
}
