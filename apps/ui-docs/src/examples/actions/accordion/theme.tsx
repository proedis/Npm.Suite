import * as React from 'react';

import { Accordion } from '@proedis/ui/actions/accordion';


/*
 * In an application these are plain CSS in :root, after the import of the package. Declared here on
 * the root of one accordion, so they move only this one.
 */
const THEME = {
  '--accordion-radius'              : 'var(--radius-2xl)',
  '--accordion-gap'                 : 'var(--space-md)',
  '--accordion-item-background'     : 'transparent',
  '--accordion-item-open-background': 'var(--color-primary-soft)',
  '--accordion-open-border'         : 'var(--primary)'
} as React.CSSProperties;


export default function Example(): React.ReactNode {
  return (
    <Accordion variant={'separated'} defaultValue={[ 'paper' ]} style={THEME} className={'w-full max-w-lg'}>
      <Accordion.Item value={'paper'} title={'Paper'} meta={'Monday'}>
        <p className={'text-sm text-muted-foreground'}>Blue container, 1100 litres, emptied weekly.</p>
      </Accordion.Item>

      <Accordion.Item value={'glass'} title={'Glass'} meta={'Thursday'}>
        <p className={'text-sm text-muted-foreground'}>Green bell, emptied every two weeks.</p>
      </Accordion.Item>

      <Accordion.Item value={'organic'} title={'Organic'} meta={'Monday and Thursday'}>
        <p className={'text-sm text-muted-foreground'}>Brown bin, 240 litres.</p>
      </Accordion.Item>
    </Accordion>
  );
}
