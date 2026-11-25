import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Field } from '@proedis/ui/forms/field';
import { checkPassword, PasswordInput, passwordRules } from '@proedis/ui/forms/password-input';
import { Stack } from '@proedis/ui/layout';

import type { PasswordStrength } from '@proedis/ui/forms/password-input';


const LABELS = { show: 'Show the password', hide: 'Hide the password', met: 'Done', unmet: 'Missing' };

/** One list for the checklist and for the check on save: they cannot disagree */
const RULES = [
  passwordRules.minLength(12, 'At least 12 characters'),
  passwordRules.uppercase('An uppercase letter'),
  passwordRules.digit('A digit'),
  passwordRules.symbol('A symbol, like ! or #')
];

const STRENGTH: PasswordStrength = {
  label : 'Password strength',
  levels: [ 'Weak', 'Fair', 'Good', 'Strong' ]
};


export default function Example(): React.ReactNode {
  const [ password, setPassword ] = React.useState('');
  const [ error, setError ] = React.useState<string | null>(null);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.currentTarget.value);
    setError(null);
  }, []);

  const handleSave = React.useCallback(() => {
    setError(checkPassword(password, RULES).ok ? null : 'The password does not meet every rule yet');
  }, [ password ]);

  return (
    <Stack gap={4} align={'start'} className={'w-full max-w-sm'}>
      <Field required label={'New password'} error={error} className={'w-full'}>
        <PasswordInput
          autoComplete={'new-password'}
          rules={RULES}
          strength={STRENGTH}
          labels={LABELS}
          value={password}
          onChange={handleChange}
        />
      </Field>
      <Button onClick={handleSave}>Save the password</Button>
    </Stack>
  );
}
