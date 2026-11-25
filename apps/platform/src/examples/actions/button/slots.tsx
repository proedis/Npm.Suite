import * as React from 'react';

import { Check, ChevronDown, Truck } from 'lucide-react';

import { Button, IconButton } from '@proedis/ui/actions/button';
import { Switch } from '@proedis/ui/forms/switch';
import { Cluster, Stack } from '@proedis/ui/layout';


/** Every part of a Button on show, and the switches that change what they report */
export default function Example(): React.ReactNode {
  const [ loading, setLoading ] = React.useState(false);
  const [ disabled, setDisabled ] = React.useState(false);

  return (
    <Stack align={'center'} gap={'lg'}>
      <Cluster justify={'center'}>
        <Button leading={<Check />} loading={loading} loadingLabel={'Saving'} disabled={disabled}>Save</Button>
        <Button fill={'soft'} trailing={<ChevronDown />} disabled={disabled}>Export</Button>
        <IconButton label={'Vehicles'} icon={<Truck />} disabled={disabled} />
        <Button size={'sm'} fill={'plain'} tone={'destructive'} disabled={disabled}>Archive</Button>
      </Cluster>
      <Cluster justify={'center'} gap={'lg'}>
        <Switch checked={loading} onCheckedChange={setLoading}>Loading</Switch>
        <Switch checked={disabled} onCheckedChange={setDisabled}>Disabled</Switch>
      </Cluster>
    </Stack>
  );
}
