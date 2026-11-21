import * as React from 'react';

import { Search } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { TextInput } from '@proedis/ui/forms/text-input';
import { Stack } from '@proedis/ui/layout';


const SIZES = [ 'sm', 'md', 'lg' ] as const;


/** The three heights as this browser resolves them, read again when the pointer changes */
const COARSE = '(pointer: coarse)';

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(COARSE);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function readHeights(): string {
  const style = getComputedStyle(document.documentElement);
  return SIZES.map((size) => style.getPropertyValue(`--spacing-control-${size}`).trim()).join(' ');
}

function useControlHeights(): Record<typeof SIZES[number], string> {
  const [ sm = '', md = '', lg = '' ] = React.useSyncExternalStore(subscribe, readHeights, () => '').split(' ');
  return { sm, md, lg };
}


export default function Example(): React.ReactNode {
  const heights = useControlHeights();

  return (
    <Stack gap={3} className={'w-full max-w-xl'}>
      {SIZES.map((size) => (
        <Stack key={size} direction={'horizontal'} align={'center'} gap={2}>
          <code className={'w-28 shrink-0 font-mono text-xs text-muted-foreground'}>{size} · {heights[size]}</code>
          <TextInput size={size} aria-label={'Search'} placeholder={'Search a vehicle'} leading={<Search />} />
          <Button size={size}>Search</Button>
        </Stack>
      ))}
    </Stack>
  );
}
