---
paths:
  - "plugins/**"
  - ".claude-plugin/**"
---

# The Claude Code plugin, `plugins/proedis-ui`

The marketplace `proedis` (`.claude-plugin/marketplace.json` at the root) lists one plugin, `proedis-ui`: the MCP
server `@proedis/mcp` launched through `npx` (`.mcp.json`) and three skills for the applications that consume the
suite (`skills/`). It is not a workspace and nothing publishes it to npm: Claude Code reads it from the repository, and
`npx skills add https://github.com/proedis/Npm.Suite --skill <name>` reads the same `SKILL.md` files for other agents.
The page that tells a consumer how to install all of it is `/ui/ai` in `apps/platform` (2026-11-26).

These skills speak to a consumer of the packages, not to a contributor of this repository: the rules for writing a
component are in `packages/ui/CLAUDE.md` and the `ui-component` skill, never here. What a consumer skill says comes from
the documentation pages, not from anyone's conventions.

- **Quote the `description` of a skill.** A description holding `: ` unquoted is a YAML mapping inside a mapping:
  Claude Code then loads the skill with no description (so it is never chosen) and the `skills` command line finds no
  skill at all. All three shipped that way for one commit. Parse the frontmatter after any change, and run
  `npx skills add ./plugins/proedis-ui --list`, which must find all three.
- **Only `name` and `description` in the frontmatter.** The other fields of Claude Code are refused outright by the
  other runtimes that load Agent Skills.
- **Every example compiles.** Copy the `tsx` blocks that start with an import into a throwaway folder under
  `apps/platform/src`, where the aliases point at the source, and run `npx tsc -p tsconfig.json` and `eslint` there
  before committing; then delete the folder. A fragment that is not a module is copied from a page, as it is there.
- **A fact a skill states is a fact of a page.** When a page changes what it says, the skill follows; each skill ends
  by pointing at the MCP tools and `llms.txt`, so the facts stay where they are generated.
- `claude plugin validate plugins/proedis-ui` and `claude plugin validate .` check both manifests.
