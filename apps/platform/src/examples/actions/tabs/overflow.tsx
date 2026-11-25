import * as React from 'react';

import { Tabs } from '@proedis/ui/actions/tabs';

import type { TabItem } from '@proedis/ui/actions/tabs';


const ITEMS: readonly TabItem[] = [
  { value: 'data', label: 'Data' },
  { value: 'containers', label: 'Containers', count: 4, countLabel: '4 containers' },
  { value: 'collections', label: 'Collections' },
  { value: 'invoices', label: 'Invoices' },
  { value: 'documents', label: 'Documents' },
  { value: 'history', label: 'History' }
];


export default function Example(): React.ReactNode {
  const [ tab, setTab ] = React.useState('data');

  return (
    /* A narrow box, as in a drawer: what does not fit goes into More */
    <Tabs
      aria-label={'Customer'}
      value={tab}
      onValueChange={setTab}
      labels={{ overflow: 'More' }}
      className={'w-full max-w-sm'}
    >
      {ITEMS.map((item) => (
        /* The panels may come from a map: an array of them is read like the panels written one by one */
        <Tabs.Panel key={item.value} {...item}>
          <p className={'text-sm text-muted-foreground'}>{`The panel of ${String(item.label)}.`}</p>
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
