import * as React from 'react';

import { Tabs } from '@proedis/ui/actions/tabs';


export default function Example(): React.ReactNode {
  return (
    <Tabs aria-label={'Customer'} defaultValue={'data'} labels={{ overflow: 'More' }} className={'w-full max-w-lg'}>
      <Tabs.Panel value={'data'} label={'Data'}>
        <p className={'text-sm text-muted-foreground'}>Rossi Costruzioni, VAT IT01234567890.</p>
      </Tabs.Panel>
      {/* A tab that exists and is not needed now: its panel declares it, with the reason */}
      <Tabs.Panel value={'invoices'} label={'Invoices'} disabled disabledReason={'The customer has no contract yet'}>{null}</Tabs.Panel>
      <Tabs.Panel value={'notes'} label={'Notes'}>
        <p className={'text-sm text-muted-foreground'}>Ring at the side gate.</p>
      </Tabs.Panel>
    </Tabs>
  );
}
