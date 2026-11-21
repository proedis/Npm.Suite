import * as React from 'react';

import { Item } from '@proedis/ui/display/item';
import { SearchInput } from '@proedis/ui/forms/search-input';
import { Stack } from '@proedis/ui/layout';


const STREETS = [
  'Via Roma', 'Via Vittorio Emanuele II', 'Corso Torino', 'Strada Cambiano', 'Via Andezeno',
  'Piazza Cavour', 'Via Palazzo di Città', 'Viale Diaz', 'Via Buttigliera', 'Strada Pecetto'
];


export default function Example(): React.ReactNode {
  const [ query, setQuery ] = React.useState('via');

  const matches = STREETS.filter((street) => street.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <Stack gap={3} className={'w-full max-w-sm'}>
      <SearchInput aria-label={'Search the streets'} labels={{ clear: 'Clear the search' }} value={query} onValueChange={setQuery} />
      <Stack as={'ul'} aria-live={'polite'} className={'rounded-md border border-border'} divided>
        {matches.map((street) => (
          <Item as={'li'} key={street} inset className={'text-sm'}>{street}</Item>
        ))}
        {!matches.length && <li className={'px-4 py-3 text-sm text-muted-foreground'}>No street matches</li>}
      </Stack>
    </Stack>
  );
}
