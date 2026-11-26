<div align="center">

# @proedis/mcp

The documentation of `@proedis/ui` and `@proedis/form`, served to your coding agent over MCP.

[![npm](https://img.shields.io/npm/v/@proedis/mcp)](https://www.npmjs.com/package/@proedis/mcp)
[![license](https://img.shields.io/npm/l/@proedis/mcp)](./LICENSE)

</div>

## ✨ What's in the box

An MCP server over stdio. An agent asks it what a component is, how to compose it, which props it takes and how to
restyle it, and gets the answer from the documentation site, not from memory.

| Tool | What it answers |
| --- | --- |
| `search_docs` | Free text over every page and every section: "a field with a unit", "dark mode", "Select searchable" |
| `list_items` | The catalogue, by kind (`component`, `guide`, `hook`), by group (`Forms`, `Overlays`, …) or by a word |
| `get_item_doc` | A page as Markdown: its outline by default, one section with `section`, the whole page with `full` |
| `get_item_props` | The props a component declares, one table per part (`TextInput`, `TextInput.Action`) |
| `get_item_theming` | The variables of the theme a component reads, with their defaults, and its slots with their `data-*` |

Three things make it worth more than a pasted link:

- **The data ships in the package.** No request leaves the machine, nothing depends on the site being up, and an
  answer does not change under your feet.
- **It knows which version it documents**, and it checks it against the `@proedis/ui` and `@proedis/form` your
  project installs. When they differ by a minor or more, every answer carries a `versionNotice` saying so.
- **Nothing in it is written twice.** The pages are rendered from the documentation site itself, the props are read by
  the TypeScript compiler from the source of the package, the examples are the files the site runs.

## 📦 Installation

Nothing to install in the project: the client launches the server with `npx`. Start it from the root of the project,
which is where it looks for the installed `@proedis/ui`.

**Claude Code**

```bash
claude mcp add proedis -- npx -y @proedis/mcp
```

**Cursor**, in `.cursor/mcp.json` (or `~/.cursor/mcp.json` for every project):

```json
{
  "mcpServers": {
    "proedis": { "command": "npx", "args": [ "-y", "@proedis/mcp" ] }
  }
}
```

**VS Code** (GitHub Copilot), in `.vscode/mcp.json`: the same entry under `servers` instead of `mcpServers`.

**Codex**

```bash
codex mcp add proedis -- npx -y @proedis/mcp
```

Any other client: command `npx`, arguments `-y @proedis/mcp`, transport stdio.

## 🚀 Quick start

Once connected, ask the agent as you would ask a colleague who knows the package:

> Build a form for a vehicle with plate, model and capacity, using the Proedis UI form binding.

> Which variables do I set to make every control taller and rounder?

> What does a Dialog with unsaved changes need?

The server tells the agent how to work at connection time: find a page, read its outline, then the one section it needs.

## 📖 API

### The tools

Every tool is read only, and every answer is JSON in a text block. A name can be the component (`TextInput`), its
subpath (`@proedis/ui/forms/text-input`, or `forms/text-input`) or the id of its page (`ui-forms-text-input`). A name
that matches nothing is an error with the closest names, never a guess.

| Tool | Input | Answer |
| --- | --- | --- |
| `search_docs` | `query`, `kind?`, `limit?` (12, at most 50) | ranked hits, each on a page or on a section, with a snippet |
| `list_items` | `kind?`, `group?`, `query?` | the documented versions and the pages, in reading order |
| `get_item_doc` | `name`, `section?`, `full?` | `outline` (intro, sections, parts with props), one `section`, or the `full` page |
| `get_item_props` | `name`, `part?` | per part: the props, and the shared props by name |
| `get_item_theming` | `name` | how to override, the variables with their light and dark defaults, the slots |

The search is lexical (BM25 over pages and sections, the words of a title weighted, the reference sections of a page
weighted down): it rewards the words the documentation uses. When a query finds nothing useful, `list_items` and an
outline are the way in.

### The version check

At start the server walks up from its working directory to the first `node_modules/@proedis/ui/package.json` and
`node_modules/@proedis/form/package.json`. A difference of a major or a minor from the documented version adds a
`versionNotice` to the instructions and to every answer. A patch is not reported: the documentation of a patch is the
same. A project that installs neither package gets no notice.

`npx -y @proedis/mcp --version` prints the version of the server and of the packages it documents.

## 🔀 Migrating

The first release: nothing to migrate from.

## 🤝 Compatibility

- Node `>=22.13.0`, the floor of the suite's command line tools.
- MCP over stdio, through `@modelcontextprotocol/server` 2, which serves a client opening with the 2025 handshake as
  well as the 2026 one (verified on the 2025 handshake).
- Each release documents the `@proedis/ui` and `@proedis/form` it was built with: a release of either publishes a new
  `@proedis/mcp`.

## 📄 License

MIT © Proedis S.r.l.
