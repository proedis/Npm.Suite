import * as React from 'react';

import { Plus } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { CollapsibleSection } from '@proedis/ui/actions/collapsible';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={0} className={'w-full max-w-lg'}>
      <CollapsibleSection
        defaultOpen
        title={'Contract'}
        status={(
          <React.Fragment>
            <span aria-hidden className={'size-1.5 rounded-full bg-primary'} />
            Modified
          </React.Fragment>
        )}
      >
        <p className={'text-sm text-muted-foreground'}>Weekly collection, 1100 litre container, renewed every year.</p>
      </CollapsibleSection>

      <CollapsibleSection
        title={'Containers'}
        meta={'4 containers'}
        actions={<Button size={'sm'} fill={'soft'} leading={<Plus />}>Add</Button>}
      >
        <p className={'text-sm text-muted-foreground'}>Two for paper, one for glass, one for organic waste.</p>
      </CollapsibleSection>

      <CollapsibleSection title={'Notes'} meta={'No notes'}>
        <p className={'text-sm text-muted-foreground'}>Nothing written yet.</p>
      </CollapsibleSection>
    </Stack>
  );
}
