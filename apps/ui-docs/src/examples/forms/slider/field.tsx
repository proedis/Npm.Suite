import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Slider } from '@proedis/ui/forms/slider';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


/** The field look is as tall as a control, so it lines up with the fields of a row */
export default function Example(): React.ReactNode {
  const [ width, setWidth ] = React.useState(3);

  return (
    <Stack columns={2} className={'w-full max-w-lg'}>
      <Field label={'Name of the layer'}>
        <TextInput defaultValue={'Collection points'} />
      </Field>
      <Field label={'Stroke'}>
        <Slider variant={'field'} label={'Width'} min={1} max={6} value={width} onValueChange={setWidth} />
      </Field>
    </Stack>
  );
}
