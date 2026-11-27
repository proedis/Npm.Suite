# proedis-ui, the Claude Code plugin

Proedis UI for a coding agent, in one install: the MCP server `@proedis/mcp` (the documentation of `@proedis/ui` and
`@proedis/form`, with props and theme variables as data) and three skills.

```bash
/plugin marketplace add proedis/Npm.Suite
/plugin install proedis-ui@proedis
```

| Skill | When it applies |
| --- | --- |
| `proedis-ui-layout` | Writing or changing the markup of a screen: setup, imports, the layout primitives, spacing, responsive maps, Surface and Item |
| `proedis-ui-forms` | A form: BoundForm with a Zod schema, Form and Field with your own state, dialogs, server errors |
| `proedis-ui-theming` | A product's look: where a value goes, the tokens, dark mode, restyling one variant through its slots |

Other agents read the same skills through `npx skills add https://github.com/proedis/Npm.Suite --skill <name>`, and the
same server through their own MCP configuration: https://platform.container.proedis.com/ui/ai has both.
