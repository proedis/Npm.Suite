import * as React from 'react';

import { Drawer } from '@proedis/ui/overlays/drawer';

import { VehicleFacts } from './VehicleFacts';
import { VehicleList } from './VehicleList';
import { VEHICLES } from './vehicles';


export default function Example(): React.ReactNode {
  const [ index, setIndex ] = React.useState<number | null>(null);
  const vehicle = index === null ? null : VEHICLES[index];

  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setIndex(null);
    }
  }, []);

  return (
    <React.Fragment>
      <VehicleList vehicles={VEHICLES.slice(0, 3)} onOpen={setIndex} />

      <Drawer
        open={vehicle !== null}
        onOpenChange={handleOpenChange}
        title={vehicle?.plate}
        description={vehicle?.status}
        labels={{ close: 'Close' }}
      >
        {vehicle && <VehicleFacts vehicle={vehicle} />}
      </Drawer>
    </React.Fragment>
  );
}
