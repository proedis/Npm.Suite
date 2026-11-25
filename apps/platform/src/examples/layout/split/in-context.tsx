import * as React from 'react';

import { Bell, Building2, CreditCard, Users } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Split, Stack } from '@proedis/ui/layout';
import { Divider } from '@proedis/ui/primitives';
import { cn } from '@proedis/ui/core';


const SECTIONS = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'billing', label: 'Billing', icon: CreditCard }
];


export default function Example(): React.ReactNode {
  const [ current, setCurrent ] = React.useState('company');

  return (
    <Split
      collapseBelow={'md'}
      railWidth={'13rem'}
      gap={{ base: 4, md: 8 }}
      className={'w-full rounded-lg border border-border p-4'}
      rail={(
        <Stack as={'nav'} aria-label={'Settings'} gap={1}>
          {SECTIONS.map(({ icon: Icon, id, label }) => (
            <Stack
              key={id}
              as={'button'}
              type={'button'}
              direction={'horizontal'}
              align={'center'}
              gap={2.5}
              aria-current={current === id ? 'page' : undefined}
              onClick={() => setCurrent(id)}
              className={cn(
                'rounded-md px-3 py-2 text-start text-sm transition-colors',
                current === id ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:bg-muted/60'
              )}
            >
              <Icon aria-hidden className={'size-4'} />
              {label}
            </Stack>
          ))}
        </Stack>
      )}
    >
      <Stack gap={4}>
        <Stack gap={1}>
          <h3 className={'text-lg font-semibold text-foreground'}>{SECTIONS.find((section) => section.id === current)?.label}</h3>
          <p className={'text-sm text-muted-foreground'}>The settings of this section, beside the list of sections.</p>
        </Stack>
        <Divider />
        <Stack direction={'horizontal'} justify={'end'} gap={2}>
          <Button fill={'plain'} tone={'muted'}>Discard</Button>
          <Button>Save</Button>
        </Stack>
      </Stack>
    </Split>
  );
}
