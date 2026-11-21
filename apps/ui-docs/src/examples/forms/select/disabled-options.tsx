import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { Select } from '@proedis/ui/forms/select';

import type { SelectOption } from '@proedis/ui/forms/select';
import labels from './labels';


/** Rivoli closed last year: no longer offered, still the value of old rounds */
const DEPOTS: readonly SelectOption[] = [
  { value: 'chieri', label: 'Chieri' },
  { value: 'moncalieri', label: 'Moncalieri' },
  { value: 'pinerolo', label: 'Pinerolo' },
  { value: 'rivoli', label: 'Rivoli (closed)', disabled: true }
];


export default function Example(): React.ReactNode {
  return (
    <Field className={'w-full max-w-xs'}>
      <Field.Label>Depot of the 2025 round</Field.Label>
      <Select options={DEPOTS} defaultValue={'rivoli'} labels={labels} />
      <Field.Description>The value keeps its label; the option cannot be chosen again.</Field.Description>
    </Field>
  );
}
