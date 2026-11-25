import * as React from 'react';

import { AtSign, MapPin } from 'lucide-react';

import { Field } from '@proedis/ui/forms/field';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack columns={{ base: 1, sm: 2 }} gap={5} className={'w-full max-w-2xl'}>
      <Field label={'Address'}>
        <TextInput leading={<MapPin />} placeholder={'Street and number'} />
      </Field>
      <Field label={'Email'}>
        <TextInput type={'email'} trailing={<AtSign />} placeholder={'name@company.it'} />
      </Field>
      <Field label={'Signal code'} description={'The prefix is not part of the value'}>
        <TextInput prefix={'SG-'} width={'code'} defaultValue={'2038'} />
      </Field>
      <Field label={'Distance'}>
        <TextInput suffix={'km'} inputMode={'decimal'} defaultValue={'12.4'} />
      </Field>
    </Stack>
  );
}
