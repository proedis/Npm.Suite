import * as React from 'react';

import { Plus } from 'lucide-react';

import { Accordion } from '@proedis/ui/actions/accordion';
import { Button } from '@proedis/ui/actions/button';


export default function Example(): React.ReactNode {
  return (
    <Accordion defaultValue={[ 'contract' ]} className={'w-full max-w-lg'}>
      <Accordion.Item
        value={'contract'}
        title={'Contract'}
        status={(
          <React.Fragment>
            <span aria-hidden className={'size-1.5 rounded-full bg-primary'} />
            Modified
          </React.Fragment>
        )}
      >
        <p className={'text-sm text-muted-foreground'}>Weekly collection, 1100 litre container, renewed every year.</p>
      </Accordion.Item>

      <Accordion.Item
        value={'containers'}
        title={'Containers'}
        meta={'4 containers'}
        actions={<Button size={'sm'} fill={'soft'} leading={<Plus />}>Add</Button>}
      >
        <p className={'text-sm text-muted-foreground'}>Two for paper, one for glass, one for organic waste.</p>
      </Accordion.Item>

      <Accordion.Item value={'notes'} title={'Notes'} meta={'No notes'} disabled>
        <p className={'text-sm text-muted-foreground'}>Nothing written yet.</p>
      </Accordion.Item>
    </Accordion>
  );
}
