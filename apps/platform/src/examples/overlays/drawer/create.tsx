import * as React from 'react';

import { Plus, TriangleAlert } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Checkbox } from '@proedis/ui/forms/checkbox';
import { Field } from '@proedis/ui/forms/field';
import { Form } from '@proedis/ui/forms/form';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Drawer } from '@proedis/ui/overlays/drawer';

import type { DialogDiscard } from '@proedis/ui/overlays/dialog';
import type { DrawerSection } from '@proedis/ui/overlays/drawer';


const SECTIONS: readonly DrawerSection[] = [
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'assignment', label: 'Assignment' },
  { id: 'maintenance', label: 'Maintenance' }
];

const DISCARD: DialogDiscard = {
  title      : 'Discard the new vehicle?',
  description: 'What you typed is lost.',
  action     : 'Discard',
  cancel     : 'Keep editing',
  icon       : <TriangleAlert />
};


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);
  const [ dirty, setDirty ] = React.useState(false);
  const [ another, setAnother ] = React.useState(false);

  const handleOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);
    setDirty(false);
  }, []);

  const handleSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
    setDirty(false);

    if (!another) {
      setOpen(false);
    }
  }, [ another ]);

  return (
    <React.Fragment>
      <Button leading={<Plus />} onClick={() => setOpen(true)}>New vehicle</Button>

      {/* A creation has no detail to go back to: no onBack, and Cancel closes */}
      <Drawer
        open={open}
        onOpenChange={handleOpenChange}
        mode={'form'}
        size={'lg'}
        icon={<Plus />}
        iconTone={'primary'}
        title={'New vehicle'}
        sections={SECTIONS}
        dirty={dirty}
        discard={DISCARD}
        footerStart={<Checkbox checked={another} onCheckedChange={setAnother}>Create another</Checkbox>}
        footer={(
          <React.Fragment>
            <Drawer.Cancel>Cancel</Drawer.Cancel>
            <Drawer.Submit loadingLabel={'Saving'}>Create vehicle</Drawer.Submit>
          </React.Fragment>
        )}
        labels={{ close: 'Close', sections: 'Sections of the vehicle' }}
      >
        <Form onSubmit={handleSubmit} onChange={() => setDirty(true)}>
          <Drawer.Section id={'vehicle'} title={'Vehicle'}>
            <Field label={'Plate'}><TextInput name={'plate'} /></Field>
            <Field label={'Model'}><TextInput name={'model'} /></Field>
            <Field label={'Capacity'}><TextInput name={'capacity'} suffix={'m³'} /></Field>
          </Drawer.Section>
          <Drawer.Section id={'assignment'} title={'Assignment'}>
            <Field label={'Depot'}><TextInput name={'depot'} /></Field>
            <Field label={'Driver'}><TextInput name={'driver'} /></Field>
          </Drawer.Section>
          <Drawer.Section id={'maintenance'} title={'Maintenance'}>
            <Field label={'Last service'}><TextInput name={'service'} type={'date'} /></Field>
            <Field label={'Odometer'}><TextInput name={'odometer'} suffix={'km'} /></Field>
          </Drawer.Section>
        </Form>
      </Drawer>
    </React.Fragment>
  );
}
