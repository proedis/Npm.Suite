import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { PasswordInput } from '@proedis/ui/forms/password-input';
import { Stack } from '@proedis/ui/layout';


const LABELS = { show: 'Show the password', hide: 'Hide the password' };

const MIN_LENGTH = 12;


export default function Example(): React.ReactNode {
  const [ password, setPassword ] = React.useState('');
  const [ repeat, setRepeat ] = React.useState('');

  const handlePassword = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value);
  }, []);

  const handleRepeat = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRepeat(event.currentTarget.value);
  }, []);

  const tooShort = password.length > 0 && password.length < MIN_LENGTH;
  const mismatch = repeat.length > 0 && repeat !== password;

  return (
    <Stack gap={5} className={'w-full max-w-sm'}>
      <Field>
        <Field.Label required>New password</Field.Label>
        <PasswordInput autoComplete={'new-password'} labels={LABELS} value={password} onChange={handlePassword} />
        <Field.Description>At least {MIN_LENGTH} characters</Field.Description>
        <Field.Counter exceeded={tooShort}>{password.length}</Field.Counter>
        <Field.Error>{tooShort ? `${MIN_LENGTH - password.length} more characters` : null}</Field.Error>
      </Field>

      <Field>
        <Field.Label required>Repeat it</Field.Label>
        <PasswordInput autoComplete={'new-password'} labels={LABELS} value={repeat} onChange={handleRepeat} />
        <Field.Error>{mismatch ? 'The two do not match' : null}</Field.Error>
      </Field>
    </Stack>
  );
}
