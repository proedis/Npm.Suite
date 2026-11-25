import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';

import { PlateTags } from './plate-tags';


export default function Example(): React.ReactNode {
  const [ plates, setPlates ] = React.useState<string[]>([ 'AB 123 CD' ]);

  return (
    <Stack gap={5} className={'w-full max-w-md'}>
      <Field label={'Invalid, from the field'} error={'At least two vehicles'}>
        <PlateTags value={plates} onChange={setPlates} />
      </Field>

      <Field label={'Read only'}>
        <PlateTags value={[ 'FT 234 KL', 'GH 567 MN' ]} onChange={setPlates} readOnly />
      </Field>

      <Field disabled label={'Disabled, from the field'}>
        <PlateTags value={[ 'FT 234 KL' ]} onChange={setPlates} />
      </Field>
    </Stack>
  );
}
