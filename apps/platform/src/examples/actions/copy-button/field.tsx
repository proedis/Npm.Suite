import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


const LABELS = { copy: 'Copy', copied: 'Copied' } as const;


/** A read only field keeps its copy: it is the field one most often copies from */
export default function Example(): React.ReactNode {
  return (
    <Stack className={'w-full max-w-md'}>
      <Field label={'API key'} hint={'Read only: the key is shown once, copy it now.'}>
        <TextInput readOnly value={'pk_live_51Hq8sV2eZvKYlo2C0xK7f3'} trailing={<TextInput.Copy labels={LABELS} />} />
      </Field>
      <Field label={'Share link'}>
        <TextInput defaultValue={'https://app.proedis.it/r/R-14'} trailing={<TextInput.Copy labels={LABELS} />} />
      </Field>
    </Stack>
  );
}
