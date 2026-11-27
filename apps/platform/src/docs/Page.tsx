import * as React from 'react';

import { Link2 } from 'lucide-react';

import { cn } from '@proedis/ui/core';
import { Cluster, Stack } from '@proedis/ui/layout';
import { Badge } from '@proedis/ui/display/badge';

import { findGroup } from '@/nav';

import { CodeBlock } from './CodeBlock';
import { DocsTargetContext, useDocsTarget } from './target';

import type { Snippet } from './snippet';
import type { DocsTarget } from './target';
import type { NavItem } from '@/nav';


/* --------
 * Helpers
 * -------- */

/** The anchor of a title: lowercase words joined by hyphens */
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}


/* --------
 * Page Header
 * -------- */

interface PageHeaderProps {
  /** The page in the navigation: its group, title, description, subpath and peers */
  page: NavItem;

  /** A longer lead than the one-line description of the navigation */
  lead?: React.ReactNode;

  /** The import an application writes, highlighted */
  imports?: Snippet;
}

/** The top of a page: where it sits, what it is, how to import it, what it needs installed */
export function PageHeader(props: PageHeaderProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { imports, lead, page } = props;
  const group = findGroup(page);
  const { mode } = useDocsTarget();


  // ----
  // Component Render
  // ----
  return (
    <Stack as={'header'} gap={6} className={'mb-14'}>
      <Stack gap={3}>
        {group && <p className={'text-sm font-semibold text-primary'}>{group.title}</p>}
        <h1 className={'text-4xl font-bold tracking-tight text-foreground sm:text-5xl'}>{page.title}</h1>
        <p className={'max-w-3xl text-lg/8 text-pretty text-muted-foreground'}>{lead ?? page.description}</p>
      </Stack>

      {imports && <CodeBlock snippet={imports} title={page.subpath} />}

      {mode === 'text' && page.peers && page.peers.length > 0 && (
        <p>
          Needs the optional peer{page.peers.length > 1 ? 's' : ''}{' '}
          {page.peers.map((peer, index) => (
            <React.Fragment key={peer}>{index > 0 && ', '}<code>{peer}</code></React.Fragment>
          ))}
          .
        </p>
      )}

      {mode === 'web' && page.peers && page.peers.length > 0 && (
        <Cluster gap={2} className={'text-sm text-muted-foreground'}>
          <span>Needs the optional peer{page.peers.length > 1 ? 's' : ''}</span>
          {page.peers.map((peer) => (
            <Badge key={peer} fill={'soft'} tone={'secondary'} className={'font-mono'}>{peer}</Badge>
          ))}
        </Cluster>
      )}
    </Stack>
  );

}

PageHeader.displayName = 'PageHeader';


/* --------
 * Text
 * -------- */

/** Running text: the paragraphs of a section, at the width a line is still read in one glance */
export function Prose(props: { children: React.ReactNode; className?: string }): React.ReactNode {
  const { children, className } = props;

  return (
    <Stack
      gap={4}
      className={cn('max-w-3xl text-base/7 text-pretty text-muted-foreground [&_strong]:font-semibold [&_strong]:text-foreground', className)}
    >
      {children}
    </Stack>
  );
}

Prose.displayName = 'Prose';


/** The body of a page: the sections, one under the other */
export function PageBody(props: { children: React.ReactNode }): React.ReactNode {
  return <Stack gap={16}>{props.children}</Stack>;
}

PageBody.displayName = 'PageBody';


/* --------
 * Sections
 * -------- */

interface SectionProps {
  title: string;

  /** The anchor, when the slug of the title would collide with another one */
  id?: string;

  /** The paragraph under the title */
  lead?: React.ReactNode;

  children?: React.ReactNode;
}

/**
 * In text, the content of a section knows its title: a table of props under it is filed with that
 * heading. On screen nothing reads it, and nothing is added.
 */
function HeadingScope(props: { target: DocsTarget; title: string; children?: React.ReactNode }): React.ReactNode {
  const { children, target, title } = props;

  if (target.mode !== 'text') {
    return children;
  }

  return <DocsTargetContext value={{ ...target, heading: title }}>{children}</DocsTargetContext>;
}

/** The title of a section, with the link to it that appears on hover */
function Anchor(props: { id: string; level: 2 | 3; children: React.ReactNode }): React.ReactNode {
  const { children, id, level } = props;
  const Tag = level === 2 ? 'h2' : 'h3';
  const { mode } = useDocsTarget();

  /** In text a heading is its words: the anchor and its mark belong to the page on screen */
  if (mode === 'text') {
    return <Tag>{children}</Tag>;
  }

  return (
    <Tag
      className={cn(
        'group/anchor relative scroll-mt-24 font-semibold tracking-tight text-foreground',
        level === 2 ? 'text-2xl' : 'text-lg'
      )}
    >
      <a href={`#${id}`} className={'outline-none focus-visible:underline'}>
        {children}
        <Link2
          aria-hidden
          className={'ms-2 inline size-4 align-baseline text-muted-foreground opacity-0 transition-opacity group-hover/anchor:opacity-100'}
        />
      </a>
    </Tag>
  );
}

/** A section of a page, listed in the table of contents */
export function Section(props: SectionProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { children, id, lead, title } = props;
  const anchor = id ?? slugify(title);


  // ----
  // Internal Hooks
  // ----
  const target = useDocsTarget();


  // ----
  // Component Render
  // ----
  return (
    <Stack as={'section'} id={anchor} data-toc={title} data-toc-level={2} gap={6} className={'scroll-mt-24'}>
      <Stack gap={3}>
        <Anchor id={anchor} level={2}>{title}</Anchor>
        {lead && <Prose><p>{lead}</p></Prose>}
      </Stack>
      <HeadingScope target={target} title={title}>{children}</HeadingScope>
    </Stack>
  );

}

Section.displayName = 'Section';


/** A part of a section, listed under it in the table of contents */
export function SubSection(props: SectionProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { children, id, lead, title } = props;
  const anchor = id ?? slugify(title);


  // ----
  // Internal Hooks
  // ----
  const target = useDocsTarget();


  // ----
  // Component Render
  // ----
  return (
    <Stack id={anchor} data-toc={title} data-toc-level={3} gap={4} className={'scroll-mt-24'}>
      <Stack gap={2}>
        <Anchor id={anchor} level={3}>{title}</Anchor>
        {lead && <Prose><p>{lead}</p></Prose>}
      </Stack>
      <HeadingScope target={target} title={title}>{children}</HeadingScope>
    </Stack>
  );

}

SubSection.displayName = 'SubSection';
