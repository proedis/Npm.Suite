import * as React from 'react';

import { Accordion } from '@proedis/ui/actions/accordion';


export default function Example(): React.ReactNode {
  return (
    <Accordion defaultValue={[ 'history' ]} className={'w-full max-w-lg'}>
      <Accordion.Item value={'history'} title={'Collection history'} meta={'3 entries'}>
        <ul className={'text-sm text-muted-foreground'}>
          <li>Monday 14 October, emptied at 06:42</li>
          <li>Thursday 10 October, emptied at 07:05</li>
          <li>Monday 7 October, skipped: access blocked</li>
        </ul>
      </Accordion.Item>

      <Accordion.Item value={'containers'} title={'Containers'} meta={'4 containers'}>
        <p className={'text-sm text-muted-foreground'}>Two for paper, one for glass, one for organic waste.</p>
      </Accordion.Item>

      <Accordion.Item value={'notes'} title={'Notes'} meta={'No notes'}>
        <p className={'text-sm text-muted-foreground'}>Nothing written yet.</p>
      </Accordion.Item>
    </Accordion>
  );
}
