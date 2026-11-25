import * as React from 'react';

import { Switch } from '@proedis/ui/forms/switch';
import { Cluster, Stack } from '@proedis/ui/layout';


/** Stands in for the request: a second, and a failure when asked for */
function saveSetting(fail: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => (fail ? reject(new Error('Not saved')) : resolve()), 1000);
  });
}


export default function Example(): React.ReactNode {
  const [ enabled, setEnabled ] = React.useState(true);
  const [ pending, setPending ] = React.useState(false);
  const [ failing, setFailing ] = React.useState(false);
  const [ error, setError ] = React.useState<string | null>(null);

  /* The thumb moves at once; on a failure it goes back and the page says why */
  const handleChange = React.useCallback((next: boolean) => {
    setEnabled(next);
    setPending(true);
    setError(null);

    saveSetting(failing).then(
      () => setPending(false),
      () => {
        setEnabled(!next);
        setPending(false);
        setError('The setting was not saved: try again.');
      }
    );
  }, [ failing ]);

  return (
    <Stack gap={4} className={'w-full max-w-sm'}>
      <Switch checked={enabled} onCheckedChange={handleChange} pending={pending}>
        Notify the customers before the round
      </Switch>
      {error && <p className={'text-sm text-destructive'}>{error}</p>}
      <Cluster gap={2} className={'border-t border-border pt-4 text-sm text-muted-foreground'}>
        <Switch checked={failing} onCheckedChange={setFailing}>Make the server fail</Switch>
      </Cluster>
    </Stack>
  );
}
