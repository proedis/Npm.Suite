import { dedent } from './dedent';


/* --------
 * Types Definition
 * -------- */

/** A piece of code a page shows, with its highlighted HTML */
export interface Snippet {
  readonly code: string;
  readonly html: string;
  readonly lang: string;
}


/* --------
 * Helpers
 * -------- */

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * The runtime half of a tag. `plugins/snippets.ts` replaces every call without an interpolation with
 * its highlighted result while the site is built, so this only runs for a template that interpolates
 * a value: it shows the text, unhighlighted.
 */
function tag(lang: string): (strings: TemplateStringsArray, ...values: unknown[]) => Snippet {
  return (strings, ...values) => {
    const code = dedent(strings.reduce((text, part, index) => text + part + (index < values.length ? String(values[index]) : ''), ''));

    return {
      code,
      html: code.split('\n').map((line) => `<span class="line">${escape(line)}</span>`).join('\n'),
      lang
    };
  };
}


/* --------
 * Tags
 * -------- */

export const tsx = tag('tsx');

export const ts = tag('ts');

export const css = tag('css');

export const bash = tag('bash');

export const json = tag('json');
