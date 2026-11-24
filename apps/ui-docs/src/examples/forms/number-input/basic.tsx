import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { NumberInput } from '@proedis/ui/forms/number-input';


export default function Example(): React.ReactNode {
  const [ weight, setWeight ] = React.useState<number | null>(1248.5);

  return (
    <Field
      label={'Net weight'}
      description={<React.Fragment>Up to 5.000 kg. Value: {weight === null ? 'empty' : weight}</React.Fragment>}
    >
      <NumberInput value={weight} onValueChange={setWeight} max={5000} decimals={2} suffix={'kg'} locale={'it-IT'} />
    </Field>
  );
}
