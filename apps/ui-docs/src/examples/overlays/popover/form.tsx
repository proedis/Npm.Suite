import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Popover } from '@proedis/ui/overlays/popover';


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);
  const [ capacity, setCapacity ] = React.useState('12');

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCapacity(String(new FormData(event.currentTarget).get('capacity')));
    setOpen(false);
  }, []);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      title={'Capacity of FT-234-KL'}
      width={'md'}
      trigger={<Button fill={'soft'} tone={'secondary'}>Capacity: {capacity} m³</Button>}
      footer={<Popover.Submit size={'sm'}>Save</Popover.Submit>}
      labels={{ close: 'Close' }}
    >
      {/* A footer keeps the focus inside, and Popover.Submit submits the form of the popover */}
      <Form onSubmit={handleSubmit}>
        <Field>
          <Field.Label>Capacity</Field.Label>
          <TextInput key={capacity} name={'capacity'} defaultValue={capacity} inputMode={'numeric'} suffix={'m³'} />
        </Field>
      </Form>
    </Popover>
  );
}
