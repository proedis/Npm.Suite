import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster } from '@proedis/ui/layout';
import { Drawer } from '@proedis/ui/overlays/drawer';

import { VehicleFacts } from './VehicleFacts';
import { VEHICLES } from './vehicles';

import type { DrawerVariant } from '@proedis/ui/overlays/drawer';


const VARIANTS: readonly DrawerVariant[] = [ 'floating', 'attached' ];


/** The same drawer, floating 8px from the edges or attached to them */
export default function Example(): React.ReactNode {
  const [ variant, setVariant ] = React.useState<DrawerVariant | null>(null);
  const vehicle = VEHICLES[0];

  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setVariant(null);
    }
  }, []);

  return (
    <React.Fragment>
      <Cluster>
        {VARIANTS.map((item) => (
          <Button key={item} fill={'soft'} tone={'muted'} onClick={() => setVariant(item)}>{`variant="${item}"`}</Button>
        ))}
      </Cluster>

      <Drawer
        open={variant !== null}
        onOpenChange={handleOpenChange}
        variant={variant ?? 'floating'}
        title={vehicle.plate}
        description={vehicle.status}
        labels={{ close: 'Close' }}
      >
        <VehicleFacts vehicle={vehicle} />
      </Drawer>
    </React.Fragment>
  );
}
