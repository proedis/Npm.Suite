import * as React from 'react';

import { useLocation } from '@tanstack/react-router';

import { cn } from '@proedis/ui/core';
import { Stack } from '@proedis/ui/layout';


/* --------
 * Types Definition
 * -------- */

interface TocEntry {
  readonly id: string;
  readonly title: string;
  readonly level: number;
}


/* --------
 * Constants Definition
 * -------- */

/** A title counts as being read once it rises above this share of the window */
const READING_LINE = 0.3;


/* --------
 * Helpers
 * -------- */

function readEntries(): TocEntry[] {
  return Array.from(document.querySelectorAll<HTMLElement>('main [data-toc][id]')).map((element) => ({
    id   : element.id,
    title: element.dataset.toc ?? element.id,
    level: Number(element.dataset.tocLevel ?? 2)
  }));
}

function sameEntries(a: readonly TocEntry[], b: readonly TocEntry[]): boolean {
  return a.length === b.length && a.every((entry, index) => entry.id === b[index].id);
}


/* --------
 * Component Definition
 * -------- */

/**
 * The sections of the page, with the one being read marked. Read from the page itself (every
 * `Section` writes `data-toc`), so a page declares its outline once, by writing it.
 */
export function Toc(): React.ReactNode {

  // ----
  // Internal Hooks
  // ----
  const { pathname } = useLocation();


  // ----
  // Internal State
  // ----
  const [ entries, setEntries ] = React.useState<TocEntry[]>([]);
  const [ activeId, setActiveId ] = React.useState<string | null>(null);


  // ----
  // Lifecycle Events
  // ----

  /** The outline, read again whenever the page changes: a route arrives after the layout */
  React.useEffect(() => {
    const main = document.querySelector('main');

    if (!main) {
      return undefined;
    }

    const scan = (): void => {
      const next = readEntries();
      setEntries((previous) => (sameEntries(previous, next) ? previous : next));
    };

    scan();

    const observer = new MutationObserver(scan);
    observer.observe(main, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [ pathname ]);

  /** The last title above the reading line is the section being read */
  React.useEffect(() => {
    if (!entries.length) {
      return undefined;
    }

    let frame = 0;

    const measure = (): void => {
      frame = 0;

      let current = entries[0].id;
      const line = window.innerHeight * READING_LINE;

      for (const entry of entries) {
        const element = document.getElementById(entry.id);

        if (element && element.getBoundingClientRect().top <= line) {
          current = entry.id;
        }
      }

      /* At the bottom of the page the last sections can never rise to the line: the last one is read */
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = entries[entries.length - 1].id;
      }

      setActiveId(current);
    };

    const handleScroll = (): void => {
      if (!frame) {
        frame = window.requestAnimationFrame(measure);
      }
    };

    measure();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [ entries ]);


  // ----
  // Component Render
  // ----
  if (!entries.length) {
    return null;
  }

  return (
    <Stack as={'nav'} aria-label={'On this page'} gap={3}>
      <h2 className={'text-sm font-semibold text-foreground'}>On this page</h2>
      <Stack as={'ul'} gap={0.5}>
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              aria-current={entry.id === activeId ? 'location' : undefined}
              className={cn(
                'block py-1 text-sm transition-colors outline-none focus-visible:underline',
                entry.level === 3 && 'ps-3',
                entry.id === activeId ? 'font-medium text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {entry.title}
            </a>
          </li>
        ))}
      </Stack>
    </Stack>
  );

}

Toc.displayName = 'Toc';
