import * as React from 'react';

import { cn } from '@proedis/ui/core';
import { Stack } from '@proedis/ui/layout';


/** The colour tokens, by family. The classes are literal, so Tailwind finds them by scanning */
const FAMILIES: readonly { title: string; swatches: readonly { token: string; className: string }[] }[] = [
  {
    title   : 'Canvas, from ui.css',
    swatches: [
      { token: '--background', className: 'bg-background' },
      { token: '--foreground', className: 'bg-foreground' },
      { token: '--muted', className: 'bg-muted' },
      { token: '--muted-foreground', className: 'bg-muted-foreground' },
      { token: '--border', className: 'bg-border' }
    ]
  },
  {
    title   : 'Surfaces',
    swatches: [
      { token: '--card', className: 'bg-card' },
      { token: '--popover', className: 'bg-popover' },
      { token: '--secondary', className: 'bg-secondary' },
      { token: '--accent', className: 'bg-accent' },
      { token: '--tooltip', className: 'bg-tooltip' }
    ]
  },
  {
    title   : 'Tones',
    swatches: [
      { token: '--primary', className: 'bg-primary' },
      { token: '--success', className: 'bg-success' },
      { token: '--warning', className: 'bg-warning' },
      { token: '--destructive', className: 'bg-destructive' },
      { token: '--info', className: 'bg-info' }
    ]
  },
  {
    title   : 'Controls',
    swatches: [
      { token: '--input', className: 'bg-input' },
      { token: '--input-hover', className: 'bg-input-hover' },
      { token: '--placeholder', className: 'bg-placeholder' },
      { token: '--switch-off', className: 'bg-switch-off' },
      { token: '--ring', className: 'bg-ring' }
    ]
  }
];


export default function Example(): React.ReactNode {
  return (
    <Stack gap={6} className={'w-full'}>
      {FAMILIES.map((family) => (
        <Stack key={family.title} gap={2.5}>
          <p className={'text-sm font-semibold text-foreground'}>{family.title}</p>
          <Stack columns={{ base: 2, sm: 3, md: 5 }} gap={3}>
            {family.swatches.map((swatch) => (
              <Stack key={swatch.token} gap={1.5}>
                <span className={cn('h-10 rounded-lg border border-border', swatch.className)} />
                <code className={'truncate font-mono text-xs text-muted-foreground'}>{swatch.token}</code>
              </Stack>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
}
