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
      <Field
        required
        label={'New password'}
        description={<React.Fragment>At least {MIN_LENGTH} characters</React.Fragment>}
        counterExceeded={tooShort}
        counter={password.length}
        error={tooShort ? `${MIN_LENGTH - password.length} more characters` : null}
      >
        <PasswordInput autoComplete={'new-password'} labels={LABELS} value={password} onChange={handlePassword} />
      </Field>

      <Field required label={'Repeat it'} error={mismatch ? 'The two do not match' : null}>
        <PasswordInput autoComplete={'new-password'} labels={LABELS} value={repeat} onChange={handleRepeat} />
      </Field>
    </Stack>
  );
}
