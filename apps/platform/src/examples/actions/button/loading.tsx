import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ saving, setSaving ] = React.useState(false);

  /** Stands in for a request: two seconds, then back */
  const handleSave = React.useCallback(() => {
    setSaving(true);
    window.setTimeout(() => setSaving(false), 2000);
  }, []);

  return (
    <Cluster gap={3}>
      <Button loading={saving} loadingLabel={'Saving'} onClick={handleSave}>
        Save changes
      </Button>
      <Button fill={'soft'} loading loadingLabel={'Exporting'}>Export</Button>
      <Button fill={'plain'} size={'sm'} loading loadingLabel={'Refreshing'}>Refresh</Button>
    </Cluster>
  );
}
