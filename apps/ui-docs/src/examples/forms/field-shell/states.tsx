import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Stack } from '@proedis/ui/layout';

import { PlateTags } from './plate-tags';


export default function Example(): React.ReactNode {
  const [ plates, setPlates ] = React.useState<string[]>([ 'AB 123 CD' ]);

  return (
    <Stack gap={5} className={'w-full max-w-md'}>
      <Field>
        <Field.Label>Invalid, from the field</Field.Label>
        <PlateTags value={plates} onChange={setPlates} />
        <Field.Error>At least two vehicles</Field.Error>
      </Field>

      <Field>
        <Field.Label>Read only</Field.Label>
        <PlateTags value={[ 'FT 234 KL', 'GH 567 MN' ]} onChange={setPlates} readOnly />
      </Field>

      <Field disabled>
        <Field.Label>Disabled, from the field</Field.Label>
        <PlateTags value={[ 'FT 234 KL' ]} onChange={setPlates} />
      </Field>
    </Stack>
  );
}
