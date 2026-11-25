import * as React from 'react';

import { Tabs } from '@proedis/ui/actions/tabs';
import { TextInput } from '@proedis/ui/forms/text-input';


export default function Example(): React.ReactNode {
  return (
    <Tabs aria-label={'Stops'} defaultValue={'search'} labels={{ overflow: 'More' }} className={'w-full max-w-md'}>
      {/* Type, switch to Map and back: the panel was kept, with what was typed */}
      <Tabs.Panel value={'search'} label={'Search'}>
        <TextInput aria-label={'Search the stops'} placeholder={'Type a street'} />
      </Tabs.Panel>
      <Tabs.Panel value={'map'} label={'Map'}>
        <p className={'text-sm text-muted-foreground'}>Mounted the first time this tab opened.</p>
      </Tabs.Panel>
    </Tabs>
  );
}
