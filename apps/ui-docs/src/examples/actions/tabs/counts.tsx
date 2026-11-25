import * as React from 'react';

import { FileText, Paperclip, Truck } from 'lucide-react';

import { Tabs } from '@proedis/ui/actions/tabs';


export default function Example(): React.ReactNode {
  return (
    <Tabs
      aria-label={'Container C-2038'}
      defaultValue={'movements'}
      labels={{ overflow: 'More' }}
      className={'w-full max-w-xl'}
    >
      {/* Icons on every tab or on none; a count only on the sections that are lists, with what it counts */}
      <Tabs.Panel value={'data'} label={'Data'} leading={<FileText />}>
        <p className={'text-sm text-muted-foreground'}>1100 litre container, paper.</p>
      </Tabs.Panel>
      <Tabs.Panel value={'movements'} label={'Movements'} leading={<Truck />} count={12} countLabel={'12 movements'}>
        <p className={'text-sm text-muted-foreground'}>Twelve movements since January.</p>
      </Tabs.Panel>
      <Tabs.Panel value={'attachments'} label={'Attachments'} leading={<Paperclip />} count={0} countLabel={'no attachments'}>
        <p className={'text-sm text-muted-foreground'}>No attachment yet.</p>
      </Tabs.Panel>
    </Tabs>
  );
}
