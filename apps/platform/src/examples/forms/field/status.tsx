import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { NumberInput } from '@proedis/ui/forms/number-input';
import { Select } from '@proedis/ui/forms/select';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


const VEHICLES = [
  { value: 'iveco', label: 'Iveco Eurocargo, FT 234 KL' },
  { value: 'scania', label: 'Scania P280, GA 118 ZT' }
];


/** An error stops the submit; a warning and a success colour the frame and the line, and the value stays valid */
export default function Example(): React.ReactNode {
  return (
    <Stack gap={'lg'} className={'w-full max-w-sm'}>
      <Field label={'Plate'} error={'The plate is not in the registry'}>
        <TextInput width={'code'} defaultValue={'XX 000 XX'} />
      </Field>

      <Field label={'Load'} status={'warning'} message={'Over 90% of the capacity: weigh it again at the depot'}>
        <NumberInput defaultValue={16800} suffix={'kg'} locale={'en-GB'} />
      </Field>

      <Field label={'Vehicle'} status={'success'} message={'Available all day'}>
        <Select options={VEHICLES} defaultValue={'iveco'} labels={{ search: 'Search', noResults: 'No vehicle', clear: 'Clear' }} />
      </Field>
    </Stack>
  );
}
