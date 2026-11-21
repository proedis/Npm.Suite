import * as React from 'react';

import { Button } from '@proedis/ui/actions/button';
import { Checkbox } from '@proedis/ui/forms/checkbox';
import { SearchInput } from '@proedis/ui/forms/search-input';
import { Stack } from '@proedis/ui/layout';
import { Dialog } from '@proedis/ui/overlays/dialog';


const DRIVERS = [
  'Luca Ferrero', 'Giulia Bianco', 'Marco Rosso', 'Elena Gallo', 'Paolo Conti', 'Sara Greco',
  'Andrea Costa', 'Chiara Fontana', 'Davide Moretti', 'Francesca Rizzo', 'Matteo Barbieri', 'Silvia Lombardi'
];


export default function Example(): React.ReactNode {
  const [ open, setOpen ] = React.useState(false);
  const [ query, setQuery ] = React.useState('');
  const [ chosen, setChosen ] = React.useState<readonly string[]>([]);

  const visible = DRIVERS.filter((driver) => driver.toLowerCase().includes(query.trim().toLowerCase()));

  const handleToggle = React.useCallback((driver: string, checked: boolean) => {
    setChosen((current) => (checked ? [ ...current, driver ] : current.filter((name) => name !== driver)));
  }, []);

  return (
    <React.Fragment>
      <Button fill={'soft'} onClick={() => setOpen(true)}>Assign drivers ({chosen.length})</Button>

      {/* The search sits in the toolbar: still while the list scrolls, and the first field the dialog focuses */}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={'Drivers of route R-14'}
        toolbar={(
          <SearchInput aria-label={'Search the drivers'} labels={{ clear: 'Clear the search' }} value={query} onValueChange={setQuery} />
        )}
        footerStart={<span className={'text-muted-foreground'}>{chosen.length} chosen</span>}
        footer={<Button onClick={() => setOpen(false)}>Done</Button>}
        labels={{ close: 'Close' }}
        className={'max-h-120'}
      >
        <Stack gap={2}>
          {visible.map((driver) => (
            <Checkbox key={driver} checked={chosen.includes(driver)} onCheckedChange={(checked) => handleToggle(driver, checked)}>
              {driver}
            </Checkbox>
          ))}
          {visible.length === 0 && <p className={'text-muted-foreground'}>No driver matches “{query}”.</p>}
        </Stack>
      </Dialog>
    </React.Fragment>
  );
}
