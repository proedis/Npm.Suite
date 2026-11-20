import * as React from 'react';

import { cn } from '@proedis/ui/core';
import { Stack } from '@proedis/ui/layout';
import { ScrollArea } from '@proedis/ui/primitives';

import { CopyButton } from './CopyButton';

import type { Snippet } from './snippet';


/* --------
 * Types Definition
 * -------- */

interface CodeBlockProps {
  /** The code, and its highlighted lines */
  snippet: Pick<Snippet, 'code' | 'html'> & { lang?: string };

  /** Over the code: a file name, or the language when omitted */
  title?: React.ReactNode;

  /** Under a preview: no top corners and no top border, the preview draws them */
  attached?: boolean;

  /** A long example scrolls past this height */
  maxHeight?: number;

  className?: string;
}


/* --------
 * Component Definition
 * -------- */

/** Highlighted code in a frame, with the name of what it is and a copy button */
export function CodeBlock(props: CodeBlockProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { attached = false, className, maxHeight, snippet, title } = props;


  // ----
  // Component Render
  // ----
  return (
    <div
      data-slot={'code-block'}
      className={cn(
        'overflow-hidden border border-border bg-muted/40',
        attached ? 'rounded-b-xl border-t-0' : 'rounded-xl',
        className
      )}
    >
      <Stack
        direction={'horizontal'}
        align={'center'}
        justify={'between'}
        gap={3}
        className={'h-10 border-b border-border ps-4 pe-1.5'}
      >
        <span className={'truncate font-mono text-xs text-muted-foreground'}>{title ?? snippet.lang}</span>
        <CopyButton text={snippet.code} />
      </Stack>

      <ScrollArea orientation={maxHeight ? 'both' : 'horizontal'} maxHeight={maxHeight}>
        <pre className={'w-max min-w-full px-4 py-3.5 font-mono text-sm/6'}>
          {/* Highlighted at build time from the file or the template literal itself: no input reaches it */}
          <code className={'shiki-code'} dangerouslySetInnerHTML={{ __html: snippet.html }} />
        </pre>
      </ScrollArea>
    </div>
  );

}

CodeBlock.displayName = 'CodeBlock';
