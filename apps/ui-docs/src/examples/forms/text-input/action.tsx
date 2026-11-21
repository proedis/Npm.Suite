import * as React from 'react';

import { Copy, Dices } from 'lucide-react';

import { Field } from '@proedis/ui/forms/field';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


/** Eight characters a person can read over the phone */
function newCode(): string {
  return Array.from({ length: 8 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
}


export default function Example(): React.ReactNode {
  const [ code, setCode ] = React.useState('K7PQ2MZX');

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCode(event.currentTarget.value);
  }, []);

  const handleGenerate = React.useCallback(() => setCode(newCode()), []);

  const handleCopy = React.useCallback(() => {
    navigator.clipboard.writeText(code).catch(() => undefined);
  }, [ code ]);

  return (
    <Stack gap={5} className={'w-full max-w-sm'}>
      <Field>
        <Field.Label>Access code for the gate</Field.Label>
        <TextInput
          value={code}
          onChange={handleChange}
          className={'font-mono'}
          trailing={<TextInput.Action label={'Generate a new code'} icon={<Dices />} onClick={handleGenerate} />}
        />
      </Field>

      <Field>
        <Field.Label>API key</Field.Label>
        <TextInput
          readOnly
          value={'pk_live_51Hc8x…'}
          trailing={<TextInput.Action label={'Copy'} icon={<Copy />} onClick={handleCopy} />}
        />
        <Field.Description>Read only: the action is not rendered</Field.Description>
      </Field>
    </Stack>
  );
}
