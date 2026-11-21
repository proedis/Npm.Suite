import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { TextInput } from '@proedis/ui/forms/text-input';


/** Five digits, as an Italian postcode */
const POSTCODE = /^\d{5}$/;


export default function Example(): React.ReactNode {
  const [ value, setValue ] = React.useState('1012');
  const [ touched, setTouched ] = React.useState(true);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value);
  }, []);

  const handleBlur = React.useCallback(() => setTouched(true), []);

  const error = touched && !POSTCODE.test(value) ? '5 digits' : null;

  return (
    <Field className={'w-full max-w-xs'}>
      <Field.Label required>Postcode</Field.Label>
      <TextInput width={'short'} inputMode={'numeric'} value={value} onChange={handleChange} onBlur={handleBlur} />
      <Field.Description>Of the collection point</Field.Description>
      <Field.Error summary={'Postcode: it must have 5 digits'}>{error}</Field.Error>
    </Field>
  );
}
