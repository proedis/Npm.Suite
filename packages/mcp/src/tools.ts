import * as z from 'zod';

import type { McpServer } from '@modelcontextprotocol/server';

import { compact } from './search';

import type { DocsData } from './data';
import type { VersionCheck } from './project';
import type { DocsSearch } from './search';
import type { IndexItem } from './types';


/* --------
 * Types Definition
 * -------- */

interface ToolResult {
  [key: string]: unknown;
  content: { type: 'text'; text: string }[];
  isError?: boolean;
}

interface ToolContext {
  readonly data: DocsData;
  readonly search: DocsSearch;
  readonly versions: VersionCheck;
}


/* --------
 * Constants Definition
 * -------- */

const KIND = z.enum([ 'component', 'guide', 'hook' ]).describe('component, guide (Getting started, Foundations) or hook');

const NAME = z.string().trim().min(1).describe(
  'The page: a component name (TextInput), its subpath (@proedis/ui/forms/text-input, forms/text-input) or its id (ui-forms-text-input)'
);


/* --------
 * Helpers
 * -------- */

function reply(payload: unknown, versions: VersionCheck): ToolResult {
  const body = versions.notice && typeof payload === 'object' && payload !== null
    ? { versionNotice: versions.notice, ...payload }
    : payload;

  return { content: [ { type: 'text', text: JSON.stringify(body, null, 2) } ] };
}

function failure(message: string): ToolResult {
  return { content: [ { type: 'text', text: message } ], isError: true };
}

/**
 * The page a name points at: its id, its name, its subpath in full or below the package, then a name
 * that starts with the one asked for. The first of those that matches decides: one page is the answer,
 * several are an error that lists them (twelve primitives share `@proedis/ui/layout`, three pages are
 * an "Overview"), and none is an error with the closest names. Never a guess.
 */
function resolveItem(items: readonly IndexItem[], name: string): IndexItem | string {
  const wanted = compact(name);
  const bySubpath = (item: IndexItem): boolean => (
    item.subpath !== null && (compact(item.subpath) === wanted || compact(item.subpath.replace(/^@proedis\/(ui|form)\/?/, '')) === wanted)
  );

  const tiers: ((item: IndexItem) => boolean)[] = [
    (item) => item.id === name,
    (item) => compact(item.name) === wanted,
    bySubpath,
    /* A part documented on another page: IconButton on Button's, Menu.Item on Menu's */
    (item) => item.propsOf.some((part) => compact(part) === wanted),
    (item) => compact(item.name).startsWith(wanted)
  ];

  for (const tier of tiers) {
    const found = items.filter(tier);

    if (found.length === 1) {
      return found[0];
    }

    if (found.length > 1) {
      const list = found.map((item) => `${item.name} (${item.group}, id ${item.id})`).join('; ');
      return `"${name}" names ${found.length} pages: ${list}. Ask again with the name of one, or its id.`;
    }
  }

  const close = items
    .filter((item) => compact(item.name).includes(wanted) || wanted.includes(compact(item.name)))
    .map((item) => item.name)
    .slice(0, 8);

  return `No page named "${name}".${close.length ? ` Closest: ${close.join(', ')}.` : ''} list_items gives every name.`;
}

/** The part of a page a name points at, when the name is one of its parts rather than the page */
function partNamed(item: IndexItem, name: string): string | undefined {
  const wanted = compact(name);
  return compact(item.name) === wanted ? undefined : item.propsOf.find((part) => compact(part) === wanted);
}

/** What the catalogue says of a page, without its headings */
function brief(item: IndexItem): Record<string, unknown> {
  return {
    id         : item.id,
    name       : item.name,
    kind       : item.kind,
    group      : item.group,
    package    : item.package,
    subpath    : item.subpath,
    peers      : item.peers,
    description: item.description,
    docsUrl    : item.docsUrl
  };
}


/* --------
 * Tools
 * -------- */

export function registerTools(server: McpServer, context: ToolContext): void {
  const { data, search, versions } = context;
  const { items } = data.index;

  server.registerTool('search_docs', {
    title      : 'Search the Proedis UI documentation',
    description: 'Search every page of @proedis/ui and @proedis/form: components, foundations (theming, tones, responsive values, '
      + 'slots), the form binding, hooks. Ranked matches, each on a page or on one of its sections; read a section with get_item_doc.',
    inputSchema: z.object({
      query: z.string().trim().min(1).describe('Free text: "field with a unit after the value", "dark mode", "Select searchable"'),
      kind : KIND.optional(),
      limit: z.number().int().optional().describe('At most this many results, 12 by default, 50 at most')
    }),
    annotations: { readOnlyHint: true }
  }, async ({ kind, limit, query }) => reply({ results: search.search({ query, kind, limit }) }, versions));

  server.registerTool('list_items', {
    title      : 'List the Proedis UI documentation',
    description: 'The catalogue of pages, in reading order, filtered by kind, by group (Layout, Primitives, Display, Actions, '
      + 'Feedback, Forms, Form binding, Overlays, Data, Hooks, Foundations) or by a word in the name or the description.',
    inputSchema: z.object({
      kind : KIND.optional(),
      group: z.string().optional().describe('A group of the navigation: Forms, Overlays, Data…'),
      query: z.string().optional().describe('A word the name, the subpath or the description holds')
    }),
    annotations: { readOnlyHint: true }
  }, async ({ group, kind, query }) => {
    const text = query?.toLowerCase();
    const listed = items.filter((item) => (
      (!kind || item.kind === kind)
      && (!group || item.group.toLowerCase() === group.toLowerCase())
      && (!text || `${item.name} ${item.subpath ?? ''} ${item.description}`.toLowerCase().includes(text))
    ));

    /* Compact on purpose: the whole catalogue in one answer a client does not truncate. A page's outline has the rest */
    const rows = listed.map((item) => ({
      id         : item.id,
      name       : item.name,
      group      : item.group,
      subpath    : item.subpath,
      description: item.description
    }));

    return reply({ packages: data.index.packages, count: listed.length, items: rows }, versions);
  });

  server.registerTool('get_item_doc', {
    title      : 'Read a page of the Proedis UI documentation',
    description: 'A page as Markdown. By default its outline (the intro and the list of sections); one section with "section" '
      + '(its heading or slug); the whole page with "full". Every example is the source of the file the documentation runs.',
    inputSchema: z.object({
      name   : NAME,
      section: z.string().optional().describe('A heading or a slug from the outline: "Sizes", "api", "customization"'),
      full   : z.boolean().optional().describe('The whole page: long for a component, prefer a section')
    }),
    annotations: { readOnlyHint: true }
  }, async ({ full, name, section }) => {
    const item = resolveItem(items, name);

    if (typeof item === 'string') {
      return failure(item);
    }

    const doc = data.doc(item.id);

    if (full) {
      const markdown = [ doc.intro, ...doc.sections.map((part) => `## ${part.heading}\n\n${part.body}`) ].join('\n\n');
      return reply({ item: brief(item), mode: 'full', markdown }, versions);
    }

    if (section) {
      const wanted = compact(section);
      const part = doc.sections.find((candidate) => compact(candidate.slug) === wanted || compact(candidate.heading) === wanted);

      if (!part) {
        return failure(`No section "${section}" on ${item.name}. Sections: ${doc.sections.map((candidate) => candidate.heading).join(', ')}.`);
      }

      return reply({ item: brief(item), mode: 'section', heading: part.heading, markdown: part.body }, versions);
    }

    return reply({
      item    : brief(item),
      mode    : 'outline',
      intro   : doc.intro,
      sections: doc.sections.map((part) => ({ heading: part.heading, slug: part.slug })),
      propsOf : item.propsOf
    }, versions);
  });

  server.registerTool('get_item_props', {
    title      : 'The props of a Proedis UI component',
    description: 'The props a component declares, read by the TypeScript compiler from the source of the package: type, literal '
      + 'values, default, requiredness, description, and the data-* attribute the component reports it as. One table per part '
      + '(TextInput, TextInput.Action); "part" picks one.',
    inputSchema: z.object({
      name: NAME,
      part: z.string().optional().describe('A part of a compound: "TextInput.Action", "Dialog.Footer"')
    }),
    annotations: { readOnlyHint: true }
  }, async ({ name, part }) => {
    const item = resolveItem(items, name);

    if (typeof item === 'string') {
      return failure(item);
    }

    const { props } = data.doc(item.id);
    const wantedPart = part ?? partNamed(item, name);
    const tables = wantedPart ? props.filter((table) => compact(table.heading) === compact(wantedPart)) : props;

    if (!props.length) {
      return failure(`${item.name} documents no table of props: read its page with get_item_doc.`);
    }

    if (!tables.length) {
      return failure(`No part "${wantedPart}" on ${item.name}. Parts: ${props.map((table) => table.heading).join(', ')}.`);
    }

    return reply({
      item : brief(item),
      parts: tables.map((table) => ({
        part  : table.heading,
        props : table.props.filter((prop) => !prop.shared),
        shared: table.props.filter((prop) => prop.shared).map((prop) => prop.name)
      }))
    }, versions);
  });

  server.registerTool('get_item_theming', {
    title      : 'How to restyle a Proedis UI component',
    description: 'The variables of the theme a component reads (with their light and dark defaults) and its slots: the data-slot '
      + 'of every part and the data-* attributes each one reports. Variables are overridden in a plain :root after the import of '
      + 'the stylesheet; a slot is targeted with an unlayered rule.',
    inputSchema: z.object({ name: NAME }),
    annotations: { readOnlyHint: true }
  }, async ({ name }) => {
    const item = resolveItem(items, name);

    if (typeof item === 'string') {
      return failure(item);
    }

    const { slots, theme } = data.doc(item.id);

    return reply({
      item     : brief(item),
      howTo    : 'Declare a variable in :root { } after the import of @proedis/ui (and in .dark { } for dark mode), never in '
        + '@theme. Target a part with [data-slot=\'<slot>\'][data-<attribute>=\'<value>\'] { } in a stylesheet outside every layer.',
      variables: theme,
      slots
    }, versions);
  });
}
