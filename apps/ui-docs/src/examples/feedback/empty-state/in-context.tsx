import * as React from 'react';

import { Plus, Search } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Heading } from '@proedis/ui/display/heading';
import { Item } from '@proedis/ui/display/item';
import { Surface } from '@proedis/ui/display/surface';
import { EmptyState } from '@proedis/ui/feedback/empty-state';
import { SearchInput } from '@proedis/ui/forms/search-input';


export default function Example(): React.ReactNode {
  const [ query, setQuery ] = React.useState('FT-999');

  return (
    <Surface className={'w-full max-w-xl border border-border'}>
      <Surface.Header inset>
        <Item.Heading>
          <Heading.Title>Vehicles</Heading.Title>
          <Heading.Description>North depot</Heading.Description>
        </Item.Heading>
        <Button size={'sm'} leading={<Plus />}>New vehicle</Button>
      </Surface.Header>
      <Surface.Section>
        <SearchInput aria-label={'Search the vehicles'} labels={{ clear: 'Clear' }} value={query} onValueChange={setQuery} />
      </Surface.Section>
      {query
        ? (
          <EmptyState
            kind={'no-results'}
            icon={<Search />}
            title={`No vehicle for “${query}”`}
            description={'Check the plate, or search by model.'}
            actions={[ { role: 'clear', label: 'Clear the search', onClick: () => setQuery('') } ]}
          />
        )
        : (
          <Surface.Section>
            <p className={'text-sm text-muted-foreground'}>FT-234-KL, GH-118-PL and 12 more vehicles.</p>
          </Surface.Section>
        )}
    </Surface>
  );
}
