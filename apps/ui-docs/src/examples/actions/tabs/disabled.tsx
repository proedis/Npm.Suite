import * as React from 'react';

import { Tabs } from '@proedis/ui/actions/tabs';

import type { TabItem } from '@proedis/ui/actions/tabs';


const ITEMS: readonly TabItem[] = [
  { value: 'data', label: 'Data' },
  { value: 'invoices', label: 'Invoices', disabled: true, disabledReason: 'The customer has no contract yet' },
  { value: 'notes', label: 'Notes' }
];


export default function Example(): React.ReactNode {
  return (
    <Tabs aria-label={'Customer'} items={ITEMS} defaultValue={'data'} labels={{ overflow: 'More' }} className={'w-full max-w-lg'}>
      <Tabs.Panel value={'data'}>
        <p className={'text-sm text-muted-foreground'}>Rossi Costruzioni, VAT IT01234567890.</p>
      </Tabs.Panel>
      <Tabs.Panel value={'notes'}>
        <p className={'text-sm text-muted-foreground'}>Ring at the side gate.</p>
      </Tabs.Panel>
    </Tabs>
  );
}
