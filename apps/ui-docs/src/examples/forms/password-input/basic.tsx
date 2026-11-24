import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { PasswordInput } from '@proedis/ui/forms/password-input';


export default function Example(): React.ReactNode {
  return (
    <Field className={'w-full max-w-sm'} required label={'Password'}>
      <PasswordInput autoComplete={'current-password'} labels={{ show: 'Show the password', hide: 'Hide the password' }} />
    </Field>
  );
}
