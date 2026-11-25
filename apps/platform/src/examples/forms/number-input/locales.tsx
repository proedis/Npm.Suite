import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { NumberInput } from '@proedis/ui/forms/number-input';
import { Stack } from '@proedis/ui/layout';


const LOCALES = [ 'it-IT', 'en-GB', 'de-CH', 'fr-FR' ];


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 2 }} gap={5}>
      {LOCALES.map((locale) => (
        <Field key={locale} label={locale}>
          <NumberInput defaultValue={1234567.5} max={99999999} decimals={2} suffix={'€'} locale={locale} />
        </Field>
      ))}
    </Stack>
  );
}
