import * as React from 'react';

import { inertValue, useDelayedBusy } from '@proedis/react';
import { Button } from '@proedis/ui/actions/button';
import { Heading } from '@proedis/ui/display/heading';
import { Surface } from '@proedis/ui/display/surface';
import { BusyVeil } from '@proedis/ui/primitives';


export default function Example(): React.ReactNode {
  const [ saving, setSaving ] = React.useState(false);

  /** `busy` at once, `visible` after 300ms and for at least 400ms */
  const wait = useDelayedBusy(saving);

  const handleSave = React.useCallback(() => {
    setSaving(true);
    window.setTimeout(() => setSaving(false), 2000);
  }, []);

  return (
    <Surface className={'w-full max-w-md border border-border'}>
      {/* The container blocks the clicks and says it is busy; the veil is only the look */}
      <div className={'relative'} aria-busy={wait.busy} inert={inertValue(wait.busy)}>
        <Surface.Section>
          <Heading size={'lg'}>
            <Heading.Title>Collection round 14</Heading.Title>
            <Heading.Description>North district, 38 stops, vehicle FT-234-KL</Heading.Description>
          </Heading>
        </Surface.Section>
        <Surface.Footer>
          <Button onClick={handleSave}>Save the round</Button>
        </Surface.Footer>
        <BusyVeil visible={wait.visible} label={'Saving the round'} />
      </div>
    </Surface>
  );
}
