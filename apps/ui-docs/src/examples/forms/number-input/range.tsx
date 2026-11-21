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
      <Field>
        <Field.Label>Containers on the truck</Field.Label>
        <NumberInput value={load} onValueChange={setLoad} max={MAX_LOAD} />
        <Field.Description>Up to {MAX_LOAD}</Field.Description>
        <Field.Error>{overLoad ? `At most ${MAX_LOAD}` : null}</Field.Error>
      </Field>

      <Field>
        <Field.Label>Clock offset</Field.Label>
        <NumberInput value={offset} onValueChange={setOffset} min={-12} max={12} step={0.5} decimals={1} suffix={'h'} locale={'en-GB'} />
        <Field.Description>Negatives allowed: min below zero. Arrows move by 0.5, Shift by 5</Field.Description>
      </Field>
    </Stack>
  );
}
