import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { MultiSelect } from '@proedis/ui/forms/multi-select';

import labels from './labels';
import { WASTE } from './options';


export default function Example(): React.ReactNode {
  const [ waste, setWaste ] = React.useState<string[]>([ 'paper', 'glass' ]);

  return (
    <Field
      className={'w-full max-w-sm'}
      label={'Waste collected'}
      description={'The kinds the vehicle can take on this round.'}
    >
      <MultiSelect options={WASTE} value={waste} onValueChange={setWaste} placeholder={'Select'} labels={labels} />
    </Field>
  );
}
