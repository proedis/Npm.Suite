import * as React from 'react';

import { Trash2 } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Badge } from '@proedis/ui/display/badge';
import { Field } from '@proedis/ui/forms/field';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Cluster, Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  return (
    <Stack gap={5} className={'w-full max-w-sm'}>
      <Cluster gap={2}>
        <Button fill={'plain'} tone={'destructive'} leading={<Trash2 />}>Delete the order</Button>
        <Badge fill={'soft'} tone={'destructive'}>Overdue</Badge>
      </Cluster>

      {/* The plain destructive button, the error and the border of the field are one red */}
      <Field required label={'Plate'} error={'Write the whole plate, seven characters'}>
        <TextInput defaultValue={'FT-23'} />
      </Field>
    </Stack>
  );
}
