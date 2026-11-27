/*
 * The documentation of Proedis UI for language models, written next to the site after it is built:
 *
 *   build/llms.txt         the index, one link per page (llmstxt.org)
 *   build/llms-full.txt    every page in one file
 *   build/llms/<id>.md     one page
 *   <mcp>/index.json       the catalogue the MCP server searches
 *   <mcp>/docs/<id>.json   one page as sections, with its props, variables and slots as data
 *
 * Every page is rendered by the site's own router in the text target (src/docs/target.ts), through
 * Vite, so the virtual modules of the props, the theme and the examples answer exactly as on screen.
 * The text cannot say anything the page does not.
 *
 * Usage: node scripts/llms.mjs [--out build] [--mcp <dir>] [--only /ui/forms/text-input]
 * --out writes the text for the site (llms.txt and the rest), --mcp the data of the MCP server; either
 * one alone, or both from one render.
 * PLATFORM_SITE_URL replaces the address of the site in every link (https://platform.container.proedis.com).
 */

import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

import TurndownService from 'turndown';
import { createServer } from 'vite';


/* --------
 * Constants Definition
 * -------- */

const APP = path.resolve(import.meta.dirname, '..');
const REPO = path.resolve(APP, '../..');

const { values: ARGS } = parseArgs({
  options: {
    out : { type: 'string' },
    mcp : { type: 'string' },
    only: { type: 'string' }
  }
});

if (!ARGS.out && !ARGS.mcp) {
  throw new Error('Nothing to write: pass --out for the text of the site, --mcp for the data of the MCP server, or both');
}

const OUT = ARGS.out ? path.resolve(process.cwd(), ARGS.out) : undefined;
const MCP = ARGS.mcp ? path.resolve(process.cwd(), ARGS.mcp) : undefined;

/** The modules of the site an example imports besides the package: a fixture, a helper, a set of labels */
const SITE_IMPORT = /from '@\/(examples\/[^']+)'/g;
/** Where the site is served: every link of the text is absolute, so a file read anywhere still points home */
const SITE = (process.env.PLATFORM_SITE_URL ?? 'https://platform.container.proedis.com').replace(/\/$/, '');

/** The groups of the navigation that are not a section of the package */
const GUIDE_GROUPS = new Set([ 'Getting started', 'Foundations' ]);

const SCHEMA_VERSION = 1;


/* --------
 * Helpers
 * -------- */

/** `/ui/forms/text-input` → `ui-forms-text-input`, the id of a page everywhere outside the site */
function idOf(route) {
  return route.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'index';
}

function mdUrl(id) {
  return `${SITE}/llms/${id}.md`;
}

function readVersion(pkg) {
  return JSON.parse(fs.readFileSync(path.join(REPO, 'packages', pkg, 'package.json'), 'utf8')).version;
}

/** The kind of a page, as the MCP server filters it */
function kindOf(page) {
  if (GUIDE_GROUPS.has(page.group)) {
    return 'guide';
  }

  return page.group === 'Hooks' ? 'hook' : 'component';
}

/** The package a page documents, from the subpath it imports */
function packageOf(page) {
  return page.subpath?.startsWith('@proedis/form') ? '@proedis/form' : '@proedis/ui';
}

/** The words of a heading as an anchor */
function slugify(text) {
  return text.toLowerCase().replace(/[`*_]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/**
 * The page cut at its `##` headings, outside fenced code: what comes before the first one is the
 * intro, and each section keeps its `###` inside it.
 */
function splitSections(markdown) {
  const sections = [];
  const intro = [];
  let current = null;
  let fenced = false;

  for (const line of markdown.split('\n')) {
    if (/^```/.test(line)) {
      fenced = !fenced;
    }

    const heading = !fenced && /^## (.+)$/.exec(line);

    if (heading) {
      current = { heading: heading[1].trim(), slug: slugify(heading[1]), body: [] };
      sections.push(current);
      continue;
    }

    (current ? current.body : intro).push(line);
  }

  return {
    intro   : intro.join('\n').trim(),
    sections: sections.map((section) => ({ ...section, body: section.body.join('\n').trim() }))
  };
}


/** A fenced block of an example, opened by the comment that names its file: `// @/examples/forms/select/basic.tsx` */
const EXAMPLE_BLOCK = /```\w*\n\/\/ @\/(examples\/[^\n]+)\n([\s\S]*?)```/g;

/** A module of the site, without its extension, or `undefined` when no file has that path */
function siteFile(module) {
  return [ '', '.tsx', '.ts' ].map((ext) => path.join(APP, 'src', `${module}${ext}`)).find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}

/** The modules of the site a piece of code imports, as `examples/…` paths, relative imports resolved from its file */
function importsOf(code, file) {
  const absolute = [ ...code.matchAll(SITE_IMPORT) ].map((match) => match[1]);
  const relative = file
    ? [ ...code.matchAll(/from '(\.\.?\/[^']+)'/g) ].map((match) => path.posix.join(path.posix.dirname(file), match[1]))
    : [];

  return [ ...absolute, ...relative ].map((module) => module.replace(/\.(tsx?|ts)$/, ''));
}

/**
 * The files of the site the examples of a page import, appended to it, and the files those import in
 * turn: an example that imports `../labels` or `@/examples/layout/Block` is only readable with it beside it.
 */
function withSiteImports(markdown) {
  const found = new Map();
  const queue = [ ...markdown.matchAll(EXAMPLE_BLOCK) ].flatMap((match) => importsOf(match[2], match[1]));
  queue.push(...importsOf(markdown.replace(EXAMPLE_BLOCK, ''), undefined));

  while (queue.length) {
    const module = queue.shift();

    if (found.has(module)) {
      continue;
    }

    const file = siteFile(module);

    if (!file) {
      throw new Error(`An example imports @/${module}, which is not a file of the site`);
    }

    const code = fs.readFileSync(file, 'utf8').trim();
    const relativeFile = path.relative(path.join(APP, 'src'), file).split(path.sep).join('/');
    found.set(module, { code, lang: path.extname(file).slice(1), file: relativeFile });
    queue.push(...importsOf(code, relativeFile));
  }

  if (!found.size) {
    return markdown;
  }

  const files = [ ...found.values() ].map(({ code, file, lang }) => `\`\`\`${lang}\n// @/${file}\n${code}\n\`\`\``);

  return [ markdown, '', '## Files the examples import', '', 'Modules of the documentation site, not of the package: shown so every example above can be read whole.', '', ...files.flatMap((file) => [ file, '' ]) ].join('\n').trim();
}


function dedupe(list, key) {
  const seen = new Set();
  return list.filter((entry) => !seen.has(key(entry)) && seen.add(key(entry)));
}


/* --------
 * Markdown
 * -------- */

/** A cell of a table on one line, its pipes escaped */
function cellText(service, cell) {
  return service.turndown(cell.innerHTML).replace(/\n+/g, ' ').replace(/`(?=`)/g, '`, ').replace(/\|/g, '\\|')
    .trim();
}

function createTurndown() {
  const service = new TurndownService({
    headingStyle    : 'atx',
    codeBlockStyle  : 'fenced',
    bulletListMarker: '-',
    emDelimiter     : '_',
    hr              : '---'
  });

  /* What a screen draws and a text has nothing to say with: icons, styles, hidden marks */
  service.remove([ 'style', 'script', 'svg', 'button' ]);
  service.addRule('hidden', {
    filter     : (node) => node.getAttribute?.('aria-hidden') === 'true',
    replacement: () => ''
  });

  /* A table as GitHub writes one: the first row is the head */
  service.addRule('table', {
    filter     : 'table',
    replacement: (_content, node) => {
      const rows = Array.from(node.getElementsByTagName('tr')).map((row) => Array.from(row.childNodes)
        .filter((cell) => cell.nodeName === 'TD' || cell.nodeName === 'TH')
        .map((cell) => cellText(service, cell)));

      if (!rows.length) {
        return '';
      }

      const width = Math.max(...rows.map((row) => row.length));
      const line = (cells) => `| ${Array.from({ length: width }, (_, index) => cells[index] || ' ').join(' | ')} |`;

      return `\n\n${[ line(rows[0]), line(rows[0].map(() => '---')), ...rows.slice(1).map(line) ].join('\n')}\n\n`;
    }
  });

  /* A link inside the site points at the text of that page; an anchor on the page keeps its words */
  service.addRule('link', {
    filter     : (node) => node.nodeName === 'A' && Boolean(node.getAttribute('href')),
    replacement: (content, node) => {
      const href = node.getAttribute('href');

      if (href.startsWith('#')) {
        return content;
      }

      if (href.startsWith('/ui')) {
        const [ route, hash ] = href.split('#');
        return `[${content}](${mdUrl(idOf(route))}${hash ? `#${hash}` : ''})`;
      }

      return `[${content}](${href.startsWith('/') ? `${SITE}${href}` : href})`;
    }
  });

  return service;
}

/** The markdown of a page: its article, converted, with the blank lines collapsed */
function toMarkdown(service, html) {
  const start = html.indexOf('<article');
  const end = html.lastIndexOf('</article>');

  if (start < 0 || end < 0) {
    throw new Error('The page rendered no article: is its route under a section with DocsLayout?');
  }

  return service.turndown(html.slice(start, end + '</article>'.length)).replace(/\n{3,}/g, '\n\n').trim();
}


/* --------
 * Writers
 * -------- */

function writeText(rendered, versions) {
  fs.rmSync(path.join(OUT, 'llms'), { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 'llms'), { recursive: true });

  /* One file per page */
  for (const { id, markdown } of rendered) {
    fs.writeFileSync(path.join(OUT, 'llms', `${id}.md`), `${markdown}\n`);
  }

  /* The index */
  const groups = [ ...new Set(rendered.map(({ page }) => page.group)) ];
  const index = [
    '# Proedis UI',
    '',
    '> The interface layer a Proedis frontend starts from: layout primitives, the components that read a token contract, the components with behaviour on Base UI, and the form binding of `@proedis/form`.',
    '',
    `This documents \`@proedis/ui\` ${versions['@proedis/ui']} and \`@proedis/form\` ${versions['@proedis/form']}. Each link is the page as Markdown; every page in one file: ${SITE}/llms-full.txt. The MCP server \`@proedis/mcp\` serves the same pages to a coding agent, with props and theme variables as data.`,
    ...groups.flatMap((group) => [
      '',
      `## ${group}`,
      '',
      ...rendered
        .filter(({ page }) => page.group === group)
        .map(({ id, page }) => `- [${page.title}](${mdUrl(id)}): ${page.description}`)
    ])
  ].join('\n');

  fs.writeFileSync(path.join(OUT, 'llms.txt'), `${index}\n`);

  /* Everything in one file */
  const full = [
    '# Proedis UI, the complete documentation',
    '',
    `\`@proedis/ui\` ${versions['@proedis/ui']} and \`@proedis/form\` ${versions['@proedis/form']}. Every page of the documentation, in reading order, each one closed by a line of 80 hyphens. Every example is the source of the file the site runs, with its imports as an application writes them.`,
    '',
    ...rendered.flatMap(({ page, markdown }) => [
      `<!-- ${page.group} / ${page.title}${page.subpath ? ` / ${page.subpath}` : ''} -->`,
      '',
      markdown,
      '',
      '-'.repeat(80),
      ''
    ])
  ].join('\n');

  fs.writeFileSync(path.join(OUT, 'llms-full.txt'), full);
}

function writeMcp(rendered, versions) {
  fs.rmSync(MCP, { recursive: true, force: true });
  fs.mkdirSync(path.join(MCP, 'docs'), { recursive: true });

  const items = rendered.map(({ id, page, markdown, data }) => {
    const { intro, sections } = splitSections(markdown);

    const item = {
      id,
      name       : page.title,
      kind       : kindOf(page),
      group      : page.group,
      package    : packageOf(page),
      subpath    : page.subpath ?? null,
      peers      : page.peers ?? [],
      description: page.description,
      route      : page.route,
      docsUrl    : `${SITE}${page.route}`,
      markdownUrl: mdUrl(id),
      headings   : sections.map(({ heading, slug }) => ({ heading, slug })),
      propsOf    : data.props.map(({ heading }) => heading).filter(Boolean),
      themeCount : data.theme.length,
      slotsCount : data.slots.length
    };

    fs.writeFileSync(path.join(MCP, 'docs', `${id}.json`), JSON.stringify({
      item,
      intro,
      sections,
      props: data.props,
      theme: dedupe(data.theme, (variable) => variable.variable),
      slots: data.slots.map((row) => ({ slot: row.slot, part: typeof row.part === 'string' ? row.part : null, attributes: row.attributes ?? [] }))
    }));

    return item;
  });

  fs.writeFileSync(path.join(MCP, 'index.json'), JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    generatedAt  : new Date().toISOString(),
    packages     : versions,
    siteUrl      : SITE || null,
    items
  }, null, 2));
}


/* --------
 * Build
 * -------- */

async function main() {
  const server = await createServer({
    root      : APP,
    logLevel  : 'error',
    appType   : 'custom',
    server    : { middlewareMode: true, hmr: false, ws: false }
  });

  try {
    const { TEXT_PAGES, renderPage } = await server.ssrLoadModule('/src/llms/render.tsx');
    const pages = ARGS.only ? TEXT_PAGES.filter((page) => page.route === ARGS.only) : TEXT_PAGES;

    if (!pages.length) {
      throw new Error(`No written page at ${ARGS.only}`);
    }

    const service = createTurndown();
    const versions = { '@proedis/ui': readVersion('ui'), '@proedis/form': readVersion('form') };
    const rendered = [];

    for (const page of pages) {
      const { html, data } = await renderPage(page.route);
      const markdown = withSiteImports(toMarkdown(service, html));

      rendered.push({ page, id: idOf(page.route), markdown, data });
    }

    if (OUT) {
      writeText(rendered, versions);
    }

    if (MCP) {
      writeMcp(rendered, versions);
    }

    process.stdout.write(`llms: ${rendered.length} pages${OUT ? `, text in ${OUT}` : ''}${MCP ? `, MCP data in ${MCP}` : ''}\n`);
  }
  finally {
    await server.close();
  }
}


await main();
