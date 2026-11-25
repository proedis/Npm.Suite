import * as React from 'react';

import { ArrowLeft, Map } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Cluster, Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ opened, setOpened ] = React.useState(false);

  return (
    <Stack gap={'sm'} align={'start'}>
      <Cluster gap={'sm'}>
        {/* An address: the LinkProvider of the site turns a plain click into a navigation in the page */}
        <Button to={'/'} fill={'soft'} leading={<ArrowLeft />}>Back to the overview</Button>
        <Button to={'/'} fill={'plain'} disabled>Disabled link</Button>

        {/* The long form, for the one link that goes somewhere its own way */}
        <Button to={{ href: '#map', go: () => setOpened(true) }} fill={'plain'} leading={<Map />}>Open the map here</Button>
      </Cluster>

      {opened && <p className={'text-sm text-muted-foreground'}>The map opened beside the list, with no page load.</p>}
    </Stack>
  );
}
