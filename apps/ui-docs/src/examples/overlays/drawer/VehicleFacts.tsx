import * as React from 'react';

import { LabeledContent } from '@proedis/ui/display/labeled-content';
import { Stack } from '@proedis/ui/layout';

import type { Vehicle } from './vehicles';


/** The detail of a vehicle, as the Drawer examples show it: a local helper, not part of the package */
export function VehicleFacts(props: { vehicle: Vehicle }): React.ReactNode {
  const { vehicle } = props;

  const facts: readonly (readonly [ string, string ])[] = [
    [ 'Model', vehicle.model ],
    [ 'Depot', vehicle.depot ],
    [ 'Driver', vehicle.driver ],
    [ 'Status', vehicle.status ]
  ];

  return (
    <Stack columns={2} gap={4}>
      {facts.map(([ label, value ]) => (
        <LabeledContent key={label}>
          <LabeledContent.Label>{label}</LabeledContent.Label>
          <LabeledContent.Value>{value}</LabeledContent.Value>
        </LabeledContent>
      ))}
    </Stack>
  );
}
