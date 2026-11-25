import { createHighlighter } from 'shiki';

import type { Highlighter } from 'shiki';


/* --------
 * Constants Definition
 * -------- */

/** The languages a page or an example can be written in */
export const LANGUAGES = [ 'tsx', 'ts', 'css', 'bash', 'json' ] as const;

export type Language = typeof LANGUAGES[number];

/**
 * Two themes in one output: every token carries both colours as custom properties
 * (`--shiki-light`, `--shiki-dark`) and the stylesheet picks one from the `dark` class, so switching
 * theme needs no second pass and no runtime highlighter.
 */
const THEMES = { light: 'github-light', dark: 'github-dark-default' } as const;


/* --------
 * Highlighter
 * -------- */

let highlighter: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  highlighter ??= createHighlighter({ themes: Object.values(THEMES), langs: [ ...LANGUAGES ] });
  return highlighter;
}


/**
 * The highlighted lines of a piece of code, without the `<pre>` Shiki wraps them in: the page draws
 * its own frame, and the colours of the frame belong to the theme of the site, not to Shiki's.
 */
export async function highlight(code: string, lang: Language): Promise<string> {
  const html = (await getHighlighter()).codeToHtml(code, { lang, themes: THEMES, defaultColor: false });
  const inner = /<code>([\s\S]*)<\/code>/.exec(html);

  if (!inner) {
    throw new Error(`Shiki returned no <code> for a ${lang} snippet`);
  }

  return inner[1];
}
