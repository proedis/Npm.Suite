import * as React from 'react';

import { Accordion } from '@proedis/ui/actions/accordion';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full max-w-lg'}>
      {/* Closed, the body leaves the document: what was typed is gone when it opens again */}
      <Accordion defaultValue={[ 'note' ]}>
        <Accordion.Item value={'note'} title={'Unmounted when closed'}>
          <TextInput aria-label={'Note on the stop'} placeholder={'Type, close, open again'} />
        </Accordion.Item>
      </Accordion>

      {/* Closed, the body stays in the document, hidden: the field keeps its value */}
      <Accordion keepMounted defaultValue={[ 'note' ]}>
        <Accordion.Item value={'note'} title={'Kept mounted'}>
          <TextInput aria-label={'Note on the stop, kept'} placeholder={'Type, close, open again'} />
        </Accordion.Item>
      </Accordion>
    </Stack>
  );
}
