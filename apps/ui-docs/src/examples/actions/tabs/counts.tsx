import * as React from 'react';

import { FileText, Paperclip, Truck } from 'lucide-react';

import { Tabs } from '@proedis/ui/actions/tabs';

import type { TabItem } from '@proedis/ui/actions/tabs';


/** Icons on every tab or on none; a count only on the sections that are lists, with what it counts */
const ITEMS: readonly TabItem[] = [
  { value: 'data', label: 'Data', leading: <FileText /> },
  { value: 'movements', label: 'Movements', leading: <Truck />, count: 12, countLabel: '12 movements' },
  { value: 'attachments', label: 'Attachments', leading: <Paperclip />, count: 0, countLabel: 'no attachments' }
];


export default function Example(): React.ReactNode {
  return (
    <Tabs
      aria-label={'Container C-2038'}
      items={ITEMS}
      defaultValue={'movements'}
      labels={{ overflow: 'More' }}
      className={'w-full max-w-xl'}
    >
      <Tabs.Panel value={'data'}>
        <p className={'text-sm text-muted-foreground'}>1100 litre container, paper.</p>
      </Tabs.Panel>
      <Tabs.Panel value={'movements'}>
        <p className={'text-sm text-muted-foreground'}>Twelve movements since January.</p>
      </Tabs.Panel>
      <Tabs.Panel value={'attachments'}>
        <p className={'text-sm text-muted-foreground'}>No attachment yet.</p>
      </Tabs.Panel>
    </Tabs>
  );
}
