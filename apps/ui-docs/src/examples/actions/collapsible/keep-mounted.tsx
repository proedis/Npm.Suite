import * as React from 'react';

import { CollapsibleSection } from '@proedis/ui/actions/collapsible';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack className={'w-full max-w-lg'}>
      {/* Closed, the body leaves the document: what was typed is gone when it opens again */}
      <CollapsibleSection defaultOpen title={'Unmounted when closed'}>
        <TextInput aria-label={'Note on the stop'} placeholder={'Type, close, open again'} />
      </CollapsibleSection>

      {/* Closed, the body stays in the document, hidden: the field keeps its value */}
      <CollapsibleSection defaultOpen keepMounted title={'Kept mounted'}>
        <TextInput aria-label={'Note on the stop, kept'} placeholder={'Type, close, open again'} />
      </CollapsibleSection>
    </Stack>
  );
}
