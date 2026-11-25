import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { NumberInput } from '@proedis/ui/forms/number-input';
import { Stack } from '@proedis/ui/layout';


const MAX_LOAD = 12;


export default function Example(): React.ReactNode {
  const [ load, setLoad ] = React.useState<number | null>(14);
  const [ offset, setOffset ] = React.useState<number | null>(-2);

  const overLoad = load !== null && load > MAX_LOAD;

  return (
    <Stack columns={{ base: 1, sm: 2 }} gap={5} className={'w-full max-w-xl'}>
      <Field
        label={'Containers on the truck'}
        description={<React.Fragment>Up to {MAX_LOAD}</React.Fragment>}
        error={overLoad ? `At most ${MAX_LOAD}` : null}
      >
        <NumberInput value={load} onValueChange={setLoad} max={MAX_LOAD} />
      </Field>

      <Field label={'Clock offset'} description={'Negatives allowed: min below zero. Arrows move by 0.5, Shift by 5'}>
        <NumberInput value={offset} onValueChange={setOffset} min={-12} max={12} step={0.5} decimals={1} suffix={'h'} locale={'en-GB'} />
      </Field>
    </Stack>
  );
}
