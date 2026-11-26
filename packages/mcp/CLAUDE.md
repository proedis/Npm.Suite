# CLAUDE.md: `@proedis/mcp`

## Why this package exists

The documentation of `@proedis/ui` and `@proedis/form` for a coding agent, over MCP: the same pages as the site,
with the props, the theme variables and the slots as data. Modelled on `@mantine/mcp-server` (five read only tools,
lexical search, stdio), with one difference chosen on purpose (Marco, 2026-11-26): **the data ships inside the
package and is checked against the version the project installs**, where Mantine fetches its data from the site and
never matches a version. An answer must not change under an agent's feet, nor depend on the site being up.

## What does NOT go in here

- **Documentation written by hand.** Every byte of `build/data` comes from the site through
  `apps/platform/scripts/llms.mjs --mcp`. A fact missing from an answer is missing from a page: fix the page, or the
  text branch of the docs component that dropped it (`.claude/rules/platform.md`).
- **A remote source.** No fetch, no cache on disk, no environment variable pointing at a URL. `PROEDIS_MCP_DATA_DIR`
  exists for a test against another data folder and nothing else.
- **Rules of a consumer project.** The server describes the package; conventions of an application belong to the
  skills of the plugin, not to the instructions of the server.

## Structure

```
src/
  index.ts     # the bin: --help, --version, then serveStdio with one McpServer per connection
  data.ts      # DocsData: index.json at start, docs/<id>.json on demand, the schema version checked
  search.ts    # DocsSearch: BM25 over pages and their ## sections, built once at start
  tools.ts     # the five tools, the name resolution, the versionNotice on every answer
  project.ts   # checkVersions: the installed @proedis/ui and @proedis/form, walked up from the cwd
  types.ts     # the shapes of the files llms.mjs writes
```

## Invariants

- **The build is two steps and the order matters.** `rollup` empties `build/` (and with it `build/data`), then
  `llms.mjs --mcp build/data` renders the site and writes the data. Running rollup alone leaves a package that fails at
  start with "The documentation data is missing", and `release:verify` refuses it before that: `data/index.json`
  is declared in `proedisMetadata.generated`. Keep both.
- **`schemaVersion` couples this package to `llms.mjs`.** `types.ts` describes what the script writes; a change to the
  shape of `index.json` or `docs/<id>.json` bumps `SCHEMA_VERSION` in both, in the same commit.
- **The lerna cascade is what keeps the data current.** `@proedis/ui` and `@proedis/form` are devDependencies only so
  that a release of either pulls this package into the bump set and rebuilds its data (verified in `lerna ls --graph`,
  which includes devDependencies). They are never imported: removing them stops the cascade in silence.
- **stdout belongs to the protocol.** Every diagnostic goes to stderr; a `console.log` breaks the connection.
- **The version check reads files, not the resolver.** It walks up from the working directory to
  `node_modules/<name>/package.json`, because a package's `exports` map may refuse `require.resolve` on its manifest.
  A major or minor difference adds a `versionNotice`; a patch does not.
- **A name that matches nothing is an error with the closest names**, never the nearest page silently.
- **The reference sections are weighted down in search** (`api`, `customization`, `slots-and-data-attributes`): their
  tables name every prop and slot, so they match almost any query on the component and would crowd out the section
  that explains it. Measured on twelve realistic queries before and after: the right page in the first three for ten.

## Verification

What was run when it was written: `tsc`, `eslint`, the package build, `release:verify` on the 16 artifacts; a
JSON-RPC session over stdio against `build/cjs/index.js` (initialize on the 2025 handshake, `tools/list`, each tool,
an unknown name, an unknown section); the tarball from `npm pack` installed outside the workspace with the SDK from the
registry, `--version`, and the same session with a fake `@proedis/ui` 1.9.0 installed, which gave the notice.
