import * as React from 'react';

import { FiltersBar } from '@proedis/ui/data/filters-bar';

import type { FilterOption } from '@proedis/ui/data/filters-bar';
import { searchCustomers } from '../fixtures';
import { filtersBarLabels } from '../labels';


/** How many results one search shows */
const LIMIT = 20;


export default function Example(): React.ReactNode {
  const [ value, setValue ] = React.useState<string[]>([]);
  const [ selectedItems, setSelectedItems ] = React.useState<FilterOption[]>([]);

  /* The search of the server: the text, the results of the text, and whether more exist */
  const [ text, setText ] = React.useState('');
  const [ results, setResults ] = React.useState<{ text: string; items: FilterOption[]; hasMore: boolean } | null>(null);

  React.useEffect(() => {
    let current = true;

    if (text.trim().length < 2) {
      return undefined;
    }

    searchCustomers(text, { limit: LIMIT }).then((page) => {
      if (current) {
        setResults({
          text,
          items  : page.rows.slice(0, LIMIT).map((customer) => ({
            value      : customer.id,
            label      : customer.name,
            code       : customer.code,
            description: customer.town
          })),
          hasMore: page.rows.length > LIMIT
        });
      }
    });

    return () => {
      current = false;
    };
  }, [ text ]);

  const handleValueChange = React.useCallback((next: string[], items: FilterOption[]) => {
    setValue(next);
    setSelectedItems(items);
  }, []);

  return (
    <FiltersBar
      filters={[
        {
          id           : 'customer',
          label        : 'Customer',
          kind         : 'remote',
          value,
          selectedItems,
          onValueChange: handleValueChange,
          items        : results?.text === text ? results.items : [],
          hasMore      : results?.text === text && results.hasMore,
          searching    : text.trim().length >= 2 && results?.text !== text,
          onSearchChange: setText
        }
      ]}
      onClear={() => handleValueChange([], [])}
      labels={filtersBarLabels}
      className={'w-full'}
    />
  );
}
