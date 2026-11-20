import * as React from 'react';

import { Stack } from '@proedis/ui/layout';

import { InlineCode } from './InlineCode';


/* --------
 * Types Definition
 * -------- */

interface MarkdownProps {
  /** The JSDoc of a prop: paragraphs, inline code, bold, and fenced blocks */
  text: string;
}


/* --------
 * Helpers
 * -------- */

/** Inline code and bold, in the order they appear */
function inline(text: string): React.ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('`')) {
      return <InlineCode key={index}>{part.slice(1, -1)}</InlineCode>;
    }

    if (part.startsWith('**')) {
      return <strong key={index} className={'font-semibold text-foreground'}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}


/* --------
 * Component Definition
 * -------- */

/**
 * The few shapes a JSDoc comment of the package uses, and nothing more: a full markdown parser for
 * three constructs would be the heaviest thing on the page.
 */
export function Markdown(props: MarkdownProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { text } = props;


  // ----
  // Memoized Data
  // ----
  const blocks = React.useMemo(() => text.split(/\n\s*\n|(?=```)|(?<=```)\n/).map((block) => block.trim()).filter(Boolean), [ text ]);


  // ----
  // Component Render
  // ----
  return (
    <Stack gap={2}>
      {blocks.map((block, index) => {
        if (block.startsWith('```')) {
          const code = block.replace(/^```\w*\n?/, '').replace(/```$/, '');

          return (
            <pre key={index} className={'overflow-x-auto rounded-md bg-muted px-3 py-2 font-mono text-xs text-foreground'}>
              {code.trim()}
            </pre>
          );
        }

        return <p key={index}>{inline(block.replace(/\s*\n\s*/g, ' '))}</p>;
      })}
    </Stack>
  );

}

Markdown.displayName = 'Markdown';
