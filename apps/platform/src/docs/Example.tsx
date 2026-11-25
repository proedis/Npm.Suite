import * as React from 'react';

import { cn } from '@proedis/ui/core';
import { Stack } from '@proedis/ui/layout';

import { CodeBlock } from './CodeBlock';
import { ResizableFrame } from './ResizableFrame';

import type { ExampleModule } from './exampleModule';


/* --------
 * Types Definition
 * -------- */

interface ExampleProps {
  /** The module of an example file: `import fills from '@/examples/…/fills.tsx?example'` */
  of: ExampleModule;

  /** Where the preview places the example. Defaults to `center` */
  align?: 'center' | 'start' | 'stretch';

  /** A long example scrolls past this height. Defaults to 480 */
  maxCodeHeight?: number;

  /** Classes for the preview pane: a height, a different padding */
  previewClassName?: string;

  /**
   * Renders the example in a frame whose width the reader drags, with a preset per breakpoint: for an
   * example whose point is how it answers to the width. Its responsive classes answer to the frame,
   * not to the window. Not for an overlay, which the frame would confine.
   */
  resizable?: boolean;
}


/* --------
 * Component Definition
 * -------- */

/**
 * An example running above its own source. The two come from one file, so what is read is what is
 * drawn, and every example is compiled with the site.
 */
export function Example(props: ExampleProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { align = 'center', maxCodeHeight = 480, of, previewClassName, resizable = false } = props;
  const { Component } = of;


  // ----
  // Component Render
  // ----
  return (
    <div data-slot={'example'} data-resizable={resizable || undefined}>
      {resizable ? (
        <ResizableFrame id={of.id} file={of.file} align={align} previewClassName={previewClassName} />
      ) : (
        <Stack
          gap={0}
          data-slot={'example-preview'}
          align={align === 'stretch' ? 'stretch' : 'center'}
          justify={align === 'start' ? 'start' : 'center'}
          direction={align === 'start' ? 'horizontal' : 'vertical'}
          className={cn('min-h-36 overflow-x-auto rounded-t-xl border border-border bg-background p-6 sm:p-10', previewClassName)}
        >
          <Component />
        </Stack>
      )}

      <CodeBlock attached snippet={of} title={of.file} maxHeight={maxCodeHeight} />
    </div>
  );

}

Example.displayName = 'Example';
