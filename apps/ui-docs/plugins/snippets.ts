import MagicString from 'magic-string';
import ts from 'typescript';

import type { Plugin } from 'vite';
import { dedent } from '../src/docs/dedent.ts';

import { highlight, LANGUAGES } from './highlight.ts';

import type { Language } from './highlight.ts';


/* --------
 * Constants Definition
 * -------- */

/** The module whose tags are replaced: `import { tsx } from '@/docs/snippet'` */
const SNIPPET_MODULE = /(?:^|\/)docs\/snippet$/;


/* --------
 * Helpers
 * -------- */

/** The local names the file gives to the tags of the snippet module, mapped to their language */
function snippetTags(source: ts.SourceFile): Map<string, Language> {
  const tags = new Map<string, Language>();

  for (const statement of source.statements) {
    if (
      !ts.isImportDeclaration(statement)
      || !ts.isStringLiteral(statement.moduleSpecifier)
      || !SNIPPET_MODULE.test(statement.moduleSpecifier.text)
    ) {
      continue;
    }

    const bindings = statement.importClause?.namedBindings;

    if (bindings && ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        const imported = (element.propertyName ?? element.name).text;

        if ((LANGUAGES as readonly string[]).includes(imported)) {
          tags.set(element.name.text, imported as Language);
        }
      }
    }
  }

  return tags;
}


/* --------
 * Plugin
 * -------- */

/**
 * The snippets a page writes inline, highlighted while the site is built:
 *
 * ```tsx
 * <CodeBlock snippet={tsx`
 *   import { Button } from '@proedis/ui/actions/button';
 * `} />
 * ```
 *
 * Each tagged template of the snippet module becomes the object its tag returns at runtime, with the
 * highlighted HTML filled in. No highlighter reaches the browser. A template with an interpolation is
 * left alone: its text is only known at runtime, where the tag escapes it unhighlighted.
 */
export function snippets(): Plugin {
  return {
    name   : 'ui-docs:snippets',
    enforce: 'pre',

    async transform(code, id) {
      const file = id.split('?')[0];

      if (!/\.tsx?$/.test(file) || file.includes('/node_modules/') || !code.includes('docs/snippet')) {
        return null;
      }

      const source = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const tags = snippetTags(source);

      if (!tags.size) {
        return null;
      }

      const found: { start: number; end: number; lang: Language; text: string }[] = [];

      const visit = (node: ts.Node): void => {
        if (
          ts.isTaggedTemplateExpression(node)
          && ts.isIdentifier(node.tag)
          && tags.has(node.tag.text)
          && ts.isNoSubstitutionTemplateLiteral(node.template)
        ) {
          found.push({
            start: node.getStart(source),
            end  : node.getEnd(),
            lang : tags.get(node.tag.text) as Language,
            text : dedent(node.template.text)
          });
        }

        ts.forEachChild(node, visit);
      };

      visit(source);

      if (!found.length) {
        return null;
      }

      const output = new MagicString(code);

      for (const snippet of found) {
        const html = await highlight(snippet.text, snippet.lang);

        output.overwrite(
          snippet.start,
          snippet.end,
          `({ code: ${JSON.stringify(snippet.text)}, html: ${JSON.stringify(html)}, lang: ${JSON.stringify(snippet.lang)} })`
        );
      }

      return { code: output.toString(), map: output.generateMap({ hires: true, source: file }) };
    }
  };
}
