import * as React from 'react';

import { X } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Badge } from '@proedis/ui/display/badge';
import { Cluster } from '@proedis/ui/layout';


const INITIAL = [ 'District: North', 'Material: Glass', 'Vehicle: FT-234-KL', 'Week 47' ];


export default function Example(): React.ReactNode {
  const [ filters, setFilters ] = React.useState(INITIAL);

  const handleRemove = React.useCallback((filter: string) => {
    setFilters((current) => current.filter((item) => item !== filter));
  }, []);

  const handleClear = React.useCallback(() => setFilters([]), []);
  const handleReset = React.useCallback(() => setFilters(INITIAL), []);

  /* The active filters of a list: they wrap onto a second line instead of pushing the page wider */
  return (
    <Cluster gap={2} className={'max-w-lg'}>
      <span className={'text-sm text-muted-foreground'}>{filters.length ? 'Filtered by' : 'No filters'}</span>
      {filters.map((filter) => (
        <Button
          key={filter}
          size={'sm'}
          fill={'soft'}
          tone={'secondary'}
          trailing={<X />}
          aria-label={`Remove the filter ${filter}`}
          onClick={() => handleRemove(filter)}
        >
          {filter}
        </Button>
      ))}
      {filters.length > 0
        ? <Button size={'sm'} fill={'plain'} tone={'muted'} onClick={handleClear}>Clear all</Button>
        : <Button size={'sm'} fill={'plain'} onClick={handleReset}>Restore</Button>}
      <Badge size={'sm'} fill={'soft'} tone={'muted'}>{filters.length} active</Badge>
    </Cluster>
  );
}
