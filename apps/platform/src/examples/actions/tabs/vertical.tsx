import * as React from 'react';

import { Bell, Shield, User, Users } from 'lucide-react';

import { Tabs } from '@proedis/ui/actions/tabs';


/** The settings of an account: a column at the start, the panel beside it, every tab in view */
export default function Example(): React.ReactNode {
  return (
    <Tabs aria-label={'Settings'} orientation={'vertical'} variant={'plain'} defaultValue={'profile'} labels={{ overflow: 'More' }} className={'w-full'}>
      <Tabs.Panel value={'profile'} label={'Profile'} leading={<User />}>
        <p className={'text-sm text-muted-foreground'}>Name, photo and the language of the interface.</p>
      </Tabs.Panel>
      <Tabs.Panel value={'team'} label={'Team'} leading={<Users />} count={8} countLabel={'8 people'}>
        <p className={'text-sm text-muted-foreground'}>The eight people of the north depot.</p>
      </Tabs.Panel>
      <Tabs.Panel value={'alerts'} label={'Alerts'} leading={<Bell />}>
        <p className={'text-sm text-muted-foreground'}>What reaches you, and when.</p>
      </Tabs.Panel>
      <Tabs.Panel value={'security'} label={'Security'} leading={<Shield />}>
        <p className={'text-sm text-muted-foreground'}>Password and the devices signed in.</p>
      </Tabs.Panel>
    </Tabs>
  );
}
