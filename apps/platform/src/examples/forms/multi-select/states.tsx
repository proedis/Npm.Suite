import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { MultiSelect } from '@proedis/ui/forms/multi-select';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';
import { WASTE } from './options';


/** Garden waste is no longer collected: chosen on an old round, it stays, with no x */
const OPTIONS = WASTE.map((option) => (option.value === 'green' ? { ...option, label: 'Garden waste (ended)', disabled: true } : option));


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 2 }} gap={5} className={'w-full max-w-2xl'}>
      <Field label={'Read only'} description={'Every value in view, the chips wrap.'}>
        <MultiSelect options={WASTE} defaultValue={[ 'paper', 'plastic', 'glass', 'organic', 'residual' ]} readOnly labels={labels} />
      </Field>

      <Field label={'A value no longer offered'} description={'Its chip has no x.'}>
        <MultiSelect options={OPTIONS} defaultValue={[ 'paper', 'green' ]} labels={labels} />
      </Field>

      <Field label={'Invalid'} error={'Choose at least one kind'}>
        <MultiSelect options={WASTE} placeholder={'Select'} labels={labels} />
      </Field>

      <Field disabled label={'Disabled'} description={'Out of the Tab order.'}>
        <MultiSelect options={WASTE} defaultValue={[ 'paper' ]} labels={labels} />
      </Field>

      <Field label={'Loading'} description={'It does not open until the options arrive.'}>
        <MultiSelect options={[]} placeholder={'Select'} loading loadingLabel={'Loading the kinds of waste'} labels={labels} />
      </Field>
    </Stack>
  );
}
