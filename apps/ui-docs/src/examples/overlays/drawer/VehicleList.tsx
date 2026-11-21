import * as React from 'react';

import { ChevronRight } from 'lucide-react';

import { Item } from '@proedis/ui/display/item';
import { Stack } from '@proedis/ui/layout';

import type { Vehicle } from './vehicles';


/** The list the Drawer examples open from: one row per vehicle, each a real button */
export function VehicleList(props: { vehicles: readonly Vehicle[]; onOpen: (index: number) => void }): React.ReactNode {
  const { onOpen, vehicles } = props;

  return (
    <Stack divided className={'w-full max-w-md rounded-md border border-border'}>
      {vehicles.map((vehicle, index) => (
        <Item key={vehicle.plate} as={'button'} type={'button'} interactive inset className={'text-start'} onClick={() => onOpen(index)}>
          <Stack gap={0.5} className={'grow'}>
            <span className={'font-medium'}>{vehicle.plate}</span>
            <span className={'text-xs text-muted-foreground'}>{vehicle.model}</span>
          </Stack>
          <Item.Trailing><ChevronRight className={'size-4'} /></Item.Trailing>
        </Item>
      ))}
    </Stack>
  );
}
