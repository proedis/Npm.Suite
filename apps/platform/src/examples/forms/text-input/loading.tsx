import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { TextInput } from '@proedis/ui/forms/text-input';


/** Stands in for a server that checks the plate as it is typed */
const TAKEN = [ 'AB123CD', 'FT234KL' ];


export default function Example(): React.ReactNode {
  const [ plate, setPlate ] = React.useState('');
  const [ checking, setChecking ] = React.useState(false);
  const [ taken, setTaken ] = React.useState(false);

  React.useEffect(() => {
    const clean = plate.replace(/\s/g, '').toUpperCase();

    if (clean.length < 7) {
      return undefined;
    }

    const start = window.setTimeout(() => setChecking(true), 0);
    const answer = window.setTimeout(() => {
      setChecking(false);
      setTaken(TAKEN.includes(clean));
    }, 900);

    return () => {
      window.clearTimeout(start);
      window.clearTimeout(answer);
    };
  }, [ plate ]);

  const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setPlate(event.currentTarget.value);
    setTaken(false);
  }, []);

  return (
    <Field
      className={'w-full max-w-xs'}
      required
      label={'Plate'}
      description={'Try AB 123 CD'}
      error={taken ? 'Already in the fleet' : null}
    >
      <TextInput width={'code'} value={plate} onChange={handleChange} loading={checking} loadingLabel={'Checking the plate'} />
    </Field>
  );
}
