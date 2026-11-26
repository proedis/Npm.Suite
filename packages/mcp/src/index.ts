#! /usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';

import { DocsData } from './data';
import { checkVersions } from './project';
import { DocsSearch } from './search';
import { registerTools } from './tools';


/* --------
 * Constants Definition
 * -------- */

const NAME = '@proedis/mcp';

/** The version of this package, from its own manifest: `build/cjs` once published, the manifest one folder up */
const VERSION = ((): string => {
  try {
    return (JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8')) as { version: string }).version;
  }
  catch {
    return '0.0.0';
  }
})();

const HELP = `${NAME}: the documentation of @proedis/ui and @proedis/form for an MCP client, over stdio.

Usage, as a client launches it, from the root of the project:
  npx -y @proedis/mcp

Options:
  --help       this text
  --version    the version of the server and of the documentation it carries
`;


/* --------
 * Helpers
 * -------- */

/** What the client tells the model about the server, once, when it connects */
function instructions(data: DocsData, notice: string | undefined): string {
  const { packages } = data.index;

  return [
    `The documentation of @proedis/ui ${packages['@proedis/ui']} and @proedis/form ${packages['@proedis/form']}, `
    + 'the interface layer of the Proedis frontends.',
    'Find a page with search_docs or list_items, read its outline with get_item_doc and then the one section you need; the '
    + 'props of a component come from get_item_props, its theme variables and slots from get_item_theming.',
    'Every component is imported from its own subpath (@proedis/ui/forms/text-input): the root @proedis/ui holds only the '
    + 'layout primitives, the primitives and the static display components.',
    ...(notice ? [ notice ] : [])
  ].join('\n');
}


/* --------
 * Entry
 * -------- */

function main(argv: readonly string[]): void {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(HELP);
    return;
  }

  const data = new DocsData();

  if (argv.includes('--version') || argv.includes('-v')) {
    const docs = Object.entries(data.index.packages).map(([ name, version ]) => `${name} ${version}`).join(', ');
    process.stdout.write(`${NAME} ${VERSION} (documents ${docs})\n`);
    return;
  }

  const unknown = argv.filter((arg) => arg.startsWith('-'));

  if (unknown.length) {
    process.stderr.write(`Unknown option ${unknown.join(', ')}\n\n${HELP}`);
    process.exitCode = 1;
    return;
  }

  /* stdout belongs to the protocol: every diagnostic goes to stderr */
  const versions = checkVersions(data.index.packages);
  const search = new DocsSearch(data);

  serveStdio(() => {
    const server = new McpServer(
      { name: NAME, version: VERSION },
      { capabilities: { tools: {} }, instructions: instructions(data, versions.notice) }
    );

    registerTools(server, { data, search, versions });
    return server;
  }, { onerror: (error) => process.stderr.write(`${NAME}: ${error.message}\n`) });
}

try {
  main(process.argv.slice(2));
}
catch (error) {
  process.stderr.write(`${NAME}: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
