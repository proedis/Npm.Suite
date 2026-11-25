import * as React from 'react';

import { Plus } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';
import { Dialog } from '@proedis/ui/overlays/dialog';


export default function Example(): React.ReactNode {
  const [ order, setOrder ] = React.useState(false);
  const [ customer, setCustomer ] = React.useState(false);
  const [ customerName, setCustomerName ] = React.useState<string | null>(null);

  const handleCustomer = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCustomerName(String(new FormData(event.currentTarget).get('customer')));
    setCustomer(false);
  }, []);

  return (
    <React.Fragment>
      <Button fill={'soft'} onClick={() => setOrder(true)}>New order</Button>

      <Dialog
        open={order}
        onOpenChange={setOrder}
        title={'New order'}
        footer={(
          <React.Fragment>
            <Dialog.Cancel>Cancel</Dialog.Cancel>
            <Button onClick={() => setOrder(false)}>Create order</Button>
          </React.Fragment>
        )}
        labels={{ close: 'Close' }}
      >
        <Stack gap={3} align={'start'}>
          <p>Customer: <strong>{customerName ?? 'none yet'}</strong></p>
          <Button size={'sm'} fill={'soft'} leading={<Plus />} onClick={() => setCustomer(true)}>New customer</Button>
        </Stack>

        {/* Rendered inside the first one: that is what places it lower, over a lighter veil */}
        <Dialog
          open={customer}
          onOpenChange={setCustomer}
          size={'sm'}
          title={'New customer'}
          footer={(
            <React.Fragment>
              <Dialog.Cancel>Cancel</Dialog.Cancel>
              <Dialog.Submit loadingLabel={'Saving'}>Create customer</Dialog.Submit>
            </React.Fragment>
          )}
          labels={{ close: 'Close' }}
        >
          <Form onSubmit={handleCustomer}>
            <Field label={'Name'}>
              <TextInput name={'customer'} defaultValue={'Pizzeria Da Gino'} />
            </Field>
          </Form>
        </Dialog>
      </Dialog>
    </React.Fragment>
  );
}
