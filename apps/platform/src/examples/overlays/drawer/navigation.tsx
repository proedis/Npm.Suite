import * as React from 'react';

import { Drawer } from '@proedis/ui/overlays/drawer';

import { VehicleFacts } from './VehicleFacts';
import { VehicleList } from './VehicleList';
import { VEHICLES } from './vehicles';


export default function Example(): React.ReactNode {
  const [ index, setIndex ] = React.useState<number | null>(null);
  const [ loading, setLoading ] = React.useState(false);
  const vehicle = index === null ? null : VEHICLES[index];

  /** Moving to another vehicle stands in for a request: the body waits half a second */
  const go = React.useCallback((next: number) => {
    setIndex(next);
    setLoading(true);
    window.setTimeout(() => setLoading(false), 500);
  }, []);

  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setIndex(null);
    }
  }, []);

  return (
    <React.Fragment>
      <VehicleList vehicles={VEHICLES} onOpen={setIndex} />

      {/* Without a handler the arrow is there but off: at the first vehicle there is no previous one */}
      <Drawer
        open={vehicle !== null}
        onOpenChange={handleOpenChange}
        title={vehicle?.plate}
        description={vehicle?.status}
        position={index === null ? undefined : `${index + 1} of ${VEHICLES.length}`}
        onPrevious={index !== null && index > 0 ? () => go(index - 1) : undefined}
        onNext={index !== null && index < VEHICLES.length - 1 ? () => go(index + 1) : undefined}
        busy={loading ? 'load' : false}
        labels={{ close: 'Close', previous: 'Previous vehicle', next: 'Next vehicle', busyLoad: 'Loading the vehicle' }}
      >
        {vehicle && <VehicleFacts vehicle={vehicle} />}
      </Drawer>
    </React.Fragment>
  );
}
