import * as React from 'react';

import { DatePicker } from '@proedis/ui/forms/date-picker';
import { Field } from '@proedis/ui/forms/field';

import type { DateValidity } from '@proedis/ui/forms/date-picker';
import labels from './labels';


/** The messages are the application's: the field only says what was wrong */
function message(validity: DateValidity): string | null {
  switch (validity?.code) {
    case 'incomplete':
      return `The ${validity.missing} is missing`;
    case 'impossible':
      return 'This date does not exist';
    case 'outOfRange':
      return 'Choose a date in 2026';
    default:
      return null;
  }
}


export default function Example(): React.ReactNode {
  const [ error, setError ] = React.useState<string | null>(null);

  const handleValidityChange = React.useCallback((validity: DateValidity) => setError(message(validity)), []);

  return (
    <Field className={'w-full max-w-xs'}>
      <Field.Label>Date of the inspection</Field.Label>
      <DatePicker
        locale={'en-GB'}
        min={'2026-01-01'}
        max={'2026-12-31'}
        onValidityChange={handleValidityChange}
        labels={labels}
      />
      <Field.Description>Try “3102”, “31/02/2026” or a date in 2027, then leave the field.</Field.Description>
      {error && <Field.Error>{error}</Field.Error>}
    </Field>
  );
}
