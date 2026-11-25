import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Heading } from '@proedis/ui/display/heading';
import { Surface } from '@proedis/ui/display/surface';
import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { PasswordInput } from '@proedis/ui/forms/password-input';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ signingIn, setSigningIn ] = React.useState(false);

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSigningIn(true);
    window.setTimeout(() => setSigningIn(false), 1500);
  }, []);

  return (
    <Surface className={'w-full max-w-sm'}>
      <Surface.Section>
        <Form onSubmit={handleSubmit}>
          <Heading size={'lg'}>
            <Heading.Title>Sign in</Heading.Title>
            <Heading.Description>Cantieri Digitali, north depot</Heading.Description>
          </Heading>
          <Stack gap={4}>
            <Field label={'Email'}>
              <TextInput size={'lg'} type={'email'} autoComplete={'username'} />
            </Field>
            <Field label={'Password'}>
              <PasswordInput size={'lg'} autoComplete={'current-password'} labels={{ show: 'Show the password', hide: 'Hide the password' }} />
            </Field>
          </Stack>
          <Button type={'submit'} size={'lg'} block loading={signingIn} loadingLabel={'Signing in'}>Sign in</Button>
        </Form>
      </Surface.Section>
    </Surface>
  );
}
