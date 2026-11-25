import * as React from 'react';

import { SearchInput } from '@proedis/ui/forms/search-input';


export default function Example(): React.ReactNode {
  return (
    <SearchInput aria-label={'Search the customers'} labels={{ clear: 'Clear the search' }} placeholder={'Search'} className={'max-w-xs'} />
  );
}
