import * as React from 'react';

import { CheckboxGrid } from '@proedis/ui/forms/checkbox-grid';
import { SearchInput } from '@proedis/ui/forms/search-input';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';
import { COLUMNS, grantReadWithOthers, GROUPS, SAVED } from './permissions';


export default function Example(): React.ReactNode {
  const [ query, setQuery ] = React.useState('');

  /*
   * The matching is the caller's: only it knows the text of the labels. A group that matches by its
   * name passes all its items; an empty query is no search at all.
   */
  const visibleItems = React.useMemo(() => {
    const wanted = query.trim().toLowerCase();

    if (!wanted) {
      return null;
    }

    return new Set(GROUPS.flatMap((group) => (
      String(group.label).toLowerCase().includes(wanted)
        ? group.items
        : group.items.filter((item) => String(item.label).toLowerCase().includes(wanted))
    )).map((item) => item.id));
  }, [ query ]);

  return (
    <Stack gap={4} className={'w-full'}>
      <SearchInput aria-label={'Search the entities'} placeholder={'Search'} value={query} onValueChange={setQuery} labels={{ clear: 'Clear the search' }} className={'max-w-xs'} />
      <CheckboxGrid
        groups={GROUPS}
        columns={COLUMNS}
        defaultValue={SAVED}
        resolve={grantReadWithOthers}
        visibleItems={visibleItems}
        labels={labels}
      />
    </Stack>
  );
}
