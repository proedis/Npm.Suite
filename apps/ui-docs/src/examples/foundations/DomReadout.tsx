import * as React from 'react';

import { Stack } from '@proedis/ui/layout';


/* --------
 * Types Definition
 * -------- */

interface DomReadoutProps {
  /** The element whose descendants are read */
  of: React.RefObject<HTMLElement | null>;

  /** Which elements are listed. Defaults to every element carrying a `data-slot` */
  selector?: string;
}

interface ReadoutLine {
  readonly depth: number;
  readonly text: string;
}


/* --------
 * Helpers
 * -------- */

/** The opening tag of an element, with only its `data-*` attributes: what a stylesheet can target */
function openingTag(element: Element): string {
  const attributes = element.getAttributeNames()
    .filter((name) => name.startsWith('data-') && !name.startsWith('data-base-ui'))
    .map((name) => {
      const value = element.getAttribute(name);
      return value === '' ? name : `${name}="${value}"`;
    });

  return `<${[ element.tagName.toLowerCase(), ...attributes ].join(' ')}>`;
}

function read(root: HTMLElement, selector: string): ReadoutLine[] {
  const matches = Array.from(root.querySelectorAll(selector));

  return matches.map((element) => {
    let depth = 0;
    let parent = element.parentElement;

    while (parent && parent !== root) {
      if (matches.includes(parent)) {
        depth += 1;
      }

      parent = parent.parentElement;
    }

    return { depth, text: openingTag(element) };
  });
}


/* --------
 * Component Definition
 * -------- */

/**
 * A helper of this site, not of the package: it prints what the elements above it really rendered,
 * read from the DOM after every change, so an example shows its own markup instead of a claim about it.
 */
export function DomReadout(props: DomReadoutProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { of, selector = '[data-slot]' } = props;


  // ----
  // Internal State
  // ----
  const [ lines, setLines ] = React.useState<ReadoutLine[]>([]);


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => {
    const root = of.current;

    if (!root) {
      return undefined;
    }

    const update = (): void => setLines(read(root, selector));

    update();

    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, childList: true, subtree: true });

    return () => observer.disconnect();
  }, [ of, selector ]);


  // ----
  // Component Render
  // ----
  return (
    <Stack
      as={'pre'}
      aria-label={'Rendered markup'}
      className={'w-full overflow-x-auto rounded-lg bg-muted px-3 py-2.5 font-mono text-xs/5 text-muted-foreground'}
    >
      {lines.map((line, index) => (
        <span key={index} className={'whitespace-pre'}>{'  '.repeat(line.depth)}{line.text}</span>
      ))}
    </Stack>
  );

}

DomReadout.displayName = 'DomReadout';
