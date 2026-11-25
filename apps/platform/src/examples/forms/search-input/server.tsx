import * as React from 'react';

import { SearchInput } from '@proedis/ui/forms/search-input';
import { Stack } from '@proedis/ui/layout';


export default function Example(): React.ReactNode {
  const [ query, setQuery ] = React.useState('');
  const [ searching, setSearching ] = React.useState(false);
  const [ results, setResults ] = React.useState<number | null>(null);

  /* Stands in for a request after the typing stops */
  React.useEffect(() => {
    if (!query.trim()) {
      return undefined;
    }

    const start = window.setTimeout(() => setSearching(true), 250);
    const answer = window.setTimeout(() => {
      setSearching(false);
      setResults(query.length * 7);
    }, 1100);

    return () => {
      window.clearTimeout(start);
      window.clearTimeout(answer);
    };
  }, [ query ]);

  return (
    <Stack gap={2} className={'w-full max-w-xs'}>
      <SearchInput
        size={'sm'}
        aria-label={'Search the orders'}
        labels={{ clear: 'Clear the search' }}
        value={query}
        onValueChange={setQuery}
        loading={searching}
        loadingLabel={'Searching the orders'}
      />
      <p className={'text-sm text-muted-foreground'}>{query && results !== null ? `${results} orders` : 'Type to search'}</p>
    </Stack>
  );
}
