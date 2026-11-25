import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import ts from 'typescript';

import type { Plugin, ViteDevServer } from 'vite';
import type { ThemeDoc, ThemeVariable, ThemeVariableGroup } from '../src/docs/themeDoc';


/* --------
 * Constants Definition
 * -------- */

const require = createRequire(import.meta.url);

const PREFIX = 'virtual:ui-theme/';

const RESOLVED = `\0${PREFIX}`;

/** The two stylesheets of the package, where every variable of the theme is declared */
const SHEETS = [ 'ui.css', 'theme.css' ];

/** The steps of the radius scale: every one is `--radius-scale` times Tailwind's value */
const RADIUS_CLASS = /(?:^|[\s:])rounded(?:-[a-z]{1,2})?-(?:xs|sm|md|lg|xl|2xl|3xl|4xl)(?=$|[\s'"`])/;

/** A control height, written as a class or through the map every control composes from */
const CONTROL_HEIGHT = /(?:^|[\s:])(?:min-)?h-control-(?:sm|md|lg)(?=$|[\s'"`])|\bCONTROL_HEIGHT\b/;

/** The utilities that take a colour of the theme */
const COLOUR_UTILITIES = [
  'bg', 'text', 'border', 'border-x', 'border-y', 'border-t', 'border-r', 'border-b', 'border-l', 'border-s', 'border-e',
  'ring', 'ring-offset', 'outline', 'fill', 'stroke', 'divide', 'from', 'via', 'to', 'decoration', 'caret', 'accent',
  'shadow', 'inset-ring', 'inset-shadow', 'placeholder'
];

/** The named spacing steps */
const SPACE_STEPS = [ 'xs', 'sm', 'md', 'lg', 'xl', '2xl' ];

/** The steps of a control */
const CONTROL_STEPS = [ 'sm', 'md', 'lg' ];

/** The order the groups are listed in */
const GROUP_ORDER: readonly ThemeVariableGroup[] = [ 'Default', 'Spacing', 'Size', 'Typography', 'Shape', 'Finish', 'Colour', 'Layer' ];

/** A font utility and the variable behind it: the families, and the weights a component writes */
const FONT_CLASS = /(?:^|[\s:])font-(heading|sans|mono|normal|medium|semibold|bold)(?=$|[\s'"`])/g;

/**
 * Modules a component reaches for its plumbing, whose own strings say nothing about what the
 * component paints: the class builders, and the layout primitives, which every component renders with
 * props of its own. A layout page reads its primitive directly, so nothing of it is lost there.
 */
const PLUMBING = /^(?:core\/(?:cn|responsive|base|polymorphic|link|control|index)\.ts|layout\/)/;


/* --------
 * Types Definition
 * -------- */

interface SheetVariable {
  readonly light?: string;
  readonly dark?: string;
}

interface Sheets {
  /** Every variable declared on `:root` or `.dark`, with its two values */
  readonly variables: ReadonlyMap<string, SheetVariable>;

  /** A colour utility name (`primary-soft`) and the variable it reads, with the fallback when it has one */
  readonly colours: ReadonlyMap<string, { variable: string; fallback?: string }>;

  /** A custom utility (`z-dialog`) and the variables it reads */
  readonly utilities: ReadonlyMap<string, readonly string[]>;

  /** A default class (`gap-stack`) and its variable, with the fallback */
  readonly defaults: ReadonlyMap<string, { variable: string; fallback: string }>;

  /**
   * A variable a utility reads with a default of its own and nobody sets (`--button-glow` in
   * `button-finish`): a knob of the theme, off until a product declares it
   */
  readonly knobs: ReadonlyMap<string, string>;
}


/* --------
 * Helpers
 * -------- */

/** The declarations of every block opening with `selector`, flattened */
function blocks(css: string, selector: RegExp): string[] {
  const bodies: string[] = [];
  let match: RegExpExecArray | null;
  const opener = new RegExp(selector.source, 'gm');

  while ((match = opener.exec(css)) !== null) {
    let depth = 0;
    let index = css.indexOf('{', match.index);
    const start = index + 1;

    for (; index < css.length; index += 1) {
      if (css[index] === '{') {
        depth += 1;
      }
      else if (css[index] === '}') {
        depth -= 1;

        if (depth === 0) {
          break;
        }
      }
    }

    bodies.push(css.slice(start, index));
  }

  return bodies;
}

/** `--name: value;` pairs of a block, comments dropped */
function declarations(body: string): [ string, string ][] {
  const plain = body.replace(/\/\*[\s\S]*?\*\//g, '');
  return [ ...plain.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g) ].map((match) => [ match[1], match[2].trim().replace(/\s+/g, ' ') ]);
}

/** The first `var(--x, fallback)` of a value: the variable and what is left after its comma */
function readVar(value: string): { variable: string; fallback?: string } | undefined {
  const match = /^var\((--[\w-]+)(?:,\s*(.+))?\)$/.exec(value);
  return match ? { variable: match[1], fallback: match[2] } : undefined;
}

/** A value of the theme as a reader writes it: a step of the scale by name, a colour of the palette by name */
export function readableValue(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return value
    .replace(/calc\(var\(--spacing\) \* ([\d.]+)\)/g, (_, steps: string) => `${Number(steps) * 0.25}rem`)
    .replace(/var\(--space-([\w]+)\)/g, '$1')
    .replace(/var\(--color-([\w-]+)\)/g, '$1')
    .replace(/color-mix\(in oklab, var\((--[\w-]+)\) (\d+)%, transparent\)/g, '$1 at $2%')
    .replace(/color-mix\(in oklab, ([\w-]+) (\d+)%, transparent\)/g, '$1 at $2%')
    .replace(/var\((--[\w-]+)\)/g, '$1')
    .replace(/var\((--[\w-]+),\s*([^()]+)\)/g, '$1, else $2');
}

/**
 * The strings of a source file, read from its syntax tree: literals and template parts, the only places
 * a class can be, plus the two maps of the package that hold classes under a name (`CONTROL_HEIGHT`,
 * `DEFAULT_GAP_CLASS.item`). JSX text is skipped, since a sentence about `bg-primary` paints nothing, and
 * so is the value of a `data-*` attribute, which is a name.
 */
function stringsOf(file: string): string[] {
  const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const out: string[] = [];

  const visit = (node: ts.Node): void => {
    /* The value of a `data-*` attribute is a name (`data-slot={'text-input'}`), never a class */
    if (ts.isJsxAttribute(node) && node.name.getText(source).startsWith('data-')) {
      return;
    }

    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      out.push(node.text);
    }
    else if (ts.isTemplateExpression(node)) {
      out.push(node.head.text, ...node.templateSpans.map((span) => span.literal.text));
    }
    else if (ts.isIdentifier(node) && node.text === 'CONTROL_HEIGHT') {
      out.push('CONTROL_HEIGHT');
    }
    else if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'DEFAULT_GAP_CLASS') {
      out.push(`gap-${node.name.text}`);
    }

    ts.forEachChild(node, visit);
  };

  visit(source);
  return out;
}


/** The relative imports of a source file, resolved to files of the package */
function importsOf(file: string): string[] {
  const text = fs.readFileSync(file, 'utf8');
  const found: string[] = [];

  for (const match of text.matchAll(/(?:from|import)\s+'(\.{1,2}\/[^']+)'/g)) {
    const base = path.resolve(path.dirname(file), match[1]);
    const candidate = [ `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx') ].find((name) => fs.existsSync(name));

    if (candidate) {
      found.push(candidate);
    }
  }

  return found;
}

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


/* --------
 * Reader
 * -------- */

/**
 * The variables of the theme a component reads, worked out from its source: the classes its modules
 * write, translated through the two stylesheets into the variables behind them. Nothing is listed by
 * hand, so a page cannot promise a variable the component does not read, nor miss one it does.
 */
class ThemeReader {

  // ----
  // Private Properties
  // ----
  private _sheets: Sheets | undefined;

  private readonly _sourceRoot: string;


  // ----
  // Constructor
  // ----
  constructor(sourceRoot: string) {
    this._sourceRoot = sourceRoot;
  }


  // ----
  // Public Methods
  // ----

  /** Whether a changed file can change an answer */
  public owns(file: string): boolean {
    return file.startsWith(this._sourceRoot);
  }

  public invalidate(): void {
    this._sheets = undefined;
  }

  /** The entry module of a page: `layout/stack` is `layout/Stack.tsx`, `forms/select` is its folder */
  public entryOf(route: string): string {
    const [ section, name ] = route.split('/');
    const pascal = name.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('');
    const candidates = [
      path.join(this._sourceRoot, section, `${pascal}.tsx`),
      path.join(this._sourceRoot, section, name, 'index.ts')
    ];
    const entry = candidates.find((candidate) => fs.existsSync(candidate));

    if (!entry) {
      throw new Error(`platform:theme: no module of @proedis/ui for the page ${route}`);
    }

    return entry;
  }

  /** Every page the reader can answer for, from the package's own layout */
  public routes(): string[] {
    const routes: string[] = [];

    for (const section of [ 'layout', 'primitives' ]) {
      for (const file of fs.readdirSync(path.join(this._sourceRoot, section))) {
        if (/^[A-Z]\w*\.tsx$/.test(file)) {
          routes.push(`${section}/${file.replace('.tsx', '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`);
        }
      }
    }

    for (const section of [ 'actions', 'display', 'feedback', 'forms', 'overlays', 'data' ]) {
      for (const name of fs.readdirSync(path.join(this._sourceRoot, section))) {
        if (fs.existsSync(path.join(this._sourceRoot, section, name, 'index.ts'))) {
          routes.push(`${section}/${name}`);
        }
      }
    }

    return routes;
  }

  /** The variables of one page, or of the whole package for `all` */
  public read(route: string): ThemeDoc {
    if (route === 'all') {
      return { route, variables: this.allVariables() };
    }

    return { route, variables: this.variablesOf(route) };
  }


  // ----
  // Private Methods
  // ----

  private sheets(): Sheets {
    if (this._sheets) {
      return this._sheets;
    }

    const variables = new Map<string, SheetVariable>();
    const colours = new Map<string, { variable: string; fallback?: string }>();
    const utilities = new Map<string, string[]>();
    const defaults = new Map<string, { variable: string; fallback: string }>();
    const knobs = new Map<string, string>();
    const setByUtilities = new Set<string>();

    for (const sheet of SHEETS) {
      const css = fs.readFileSync(path.join(this._sourceRoot, sheet), 'utf8');

      for (const body of blocks(css, /^:root\s*\{/)) {
        /* Top level only: a `:root` inside a media query (the coarse pointer) is a second value, not the default */
        for (const [ name, value ] of declarations(body)) {
          if (!variables.get(name)?.light) {
            variables.set(name, { ...variables.get(name), light: value });
          }
        }
      }

      for (const body of blocks(css, /^\.dark\s*\{/)) {
        for (const [ name, value ] of declarations(body)) {
          variables.set(name, { ...variables.get(name), dark: value });
        }
      }

      for (const body of blocks(css, /^@theme(?:\s+inline)?\s*\{/)) {
        for (const [ name, value ] of declarations(body)) {
          const read = readVar(value);
          const colour = /^--color-([\w-]+)$/.exec(name);
          const defaultClass = /^--(gap|height|radius)-([a-z-]+)$/.exec(name);

          if (colour && read) {
            colours.set(colour[1], read);
          }
          else if (defaultClass && read?.fallback && !SPACE_STEPS.includes(defaultClass[2])) {
            const utility = { gap: 'gap', height: 'h', radius: 'rounded' }[defaultClass[1] as 'gap' | 'height' | 'radius'];
            defaults.set(`${utility}-${defaultClass[2]}`, { variable: read.variable, fallback: read.fallback });
          }
          else if (!variables.has(name) && /^--(?:spacing-control|container|text|font)-/.test(name) && !name.includes('--line-height')) {
            variables.set(name, { light: value });
          }
        }
      }

      for (const match of css.matchAll(/@utility\s+([\w-]+)\s*\{/g)) {
        const body = blocks(css.slice(match.index), /^@utility\s+[\w-]+\s*\{/)[0] ?? '';
        const read = [ ...new Set([ ...body.matchAll(/var\((--[\w-]+)/g) ].map((m) => m[1].replace(/^--color-/, '--'))) ];
        utilities.set(match[1], read);

        for (const set of body.matchAll(/(--[\w-]+)\s*:/g)) {
          setByUtilities.add(set[1]);
        }

        for (const knob of body.matchAll(/var\((--[\w-]+),\s*([^()]+?)\)/g)) {
          if (!knob[1].startsWith('--tw-')) {
            knobs.set(knob[1], knob[2].trim());
          }
        }
      }
    }

    /* The fonts and the weights are Tailwind's own variables: their defaults come from its theme */
    const tailwindTheme = fs.readFileSync(require.resolve('tailwindcss/theme.css'), 'utf8');

    for (const body of blocks(tailwindTheme, /^@theme(?:\s+default)?(?:\s+inline)?(?:\s+reference)?\s*\{/)) {
      for (const [ name, value ] of declarations(body)) {
        if (/^--font-(?:sans|mono|weight-(?:normal|medium|semibold|bold))$/.test(name) && !variables.has(name)) {
          variables.set(name, { light: value });
        }
      }
    }

    for (const name of setByUtilities) {
      knobs.delete(name);
    }

    this._sheets = { variables, colours, utilities, defaults, knobs };
    return this._sheets;
  }

  /** The source files of a page: its entry and everything it imports in the package, but the plumbing */
  private modulesOf(route: string): { own: string[]; all: string[] } {
    const entry = this.entryOf(route);
    const ownRoot = entry.endsWith('index.ts') ? path.dirname(entry) : entry;
    const seen = new Set<string>();
    const queue = [ entry ];

    while (queue.length) {
      const file = queue.pop() as string;

      if (seen.has(file)) {
        continue;
      }

      seen.add(file);

      for (const next of importsOf(file)) {
        const relative = path.relative(this._sourceRoot, next).split(path.sep).join('/');
        const isOwn = next === entry || next.startsWith(`${ownRoot}${path.sep}`);

        if (isOwn || !PLUMBING.test(relative)) {
          queue.push(next);
        }
      }
    }

    const all = [ ...seen ];
    return { all, own: all.filter((file) => file === entry || file.startsWith(`${ownRoot}${path.sep}`)) };
  }

  private variablesOf(route: string): ThemeVariable[] {
    const sheets = this.sheets();
    const { all, own } = this.modulesOf(route);
    const strings = all.flatMap(stringsOf);
    const ownText = own.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
    const found = new Map<string, { group: ThemeVariableGroup; via: Set<string> }>();

    const add = (variable: string, group: ThemeVariableGroup, via: string): void => {
      const entry = found.get(variable) ?? { group, via: new Set<string>() };
      entry.via.add(via);
      found.set(variable, entry);
    };

    /* Colours, longest names first so `primary-soft-foreground` is not read as `primary` */
    const colourNames = [ ...sheets.colours.keys() ].sort((a, b) => b.length - a.length);
    const colourClass = new RegExp(
      `(?:^|[\\s:!])(${COLOUR_UTILITIES.map(escape).join('|')})-(${colourNames.map(escape).join('|')})(?:\\/[\\d.]+)?(?=$|[\\s'"\`\\]])`,
      'g'
    );

    for (const text of strings) {
      for (const match of text.matchAll(colourClass)) {
        const colour = sheets.colours.get(match[2]);

        if (colour) {
          add(colour.variable, 'Colour', `${match[1]}-${match[2]}`);
        }
      }

      for (const match of text.matchAll(FONT_CLASS)) {
        const family = [ 'heading', 'sans', 'mono' ].includes(match[1]);
        add(family ? `--font-${match[1]}` : `--font-weight-${match[1]}`, 'Typography', `font-${match[1]}`);
      }

      if (RADIUS_CLASS.test(text)) {
        add('--radius-scale', 'Shape', 'rounded-*');
      }

      if (CONTROL_HEIGHT.test(text)) {
        for (const step of CONTROL_STEPS) {
          add(`--spacing-control-${step}`, 'Size', `h-control-${step}`);
        }
      }

      for (const token of text.split(/\s+/)) {
        const bare = token.replace(/^(?:[^\s:]+:)*!?/, '');
        const utility = sheets.utilities.get(bare);

        for (const variable of utility ?? []) {
          if (sheets.variables.has(variable)) {
            add(variable, /^--z-/.test(variable) ? 'Layer' : 'Colour', bare);
          }
          else if (sheets.knobs.has(variable)) {
            add(variable, 'Finish', bare);
          }
        }

        const defaultClass = sheets.defaults.get(bare);

        if (defaultClass) {
          add(defaultClass.variable, 'Default', bare);
        }

        if (bare === 'text-2xs') {
          add('--text-2xs', 'Typography', bare);
        }

        if (/^(?:max-|min-)?w-8xl$/.test(bare)) {
          add('--container-8xl', 'Size', bare);
        }
      }

      /* A variable written by hand: `bg-(--row-bg)`, a style, `var(--z-dialog)` */
      for (const match of text.matchAll(/(?:\(|var\()(--[\w-]+)/g)) {
        const variable = match[1].replace(/^--color-/, '--');

        if (sheets.variables.has(variable) && !variable.startsWith('--spacing') && !variable.startsWith('--space-')) {
          add(variable, /^--z-/.test(variable) ? 'Layer' : 'Colour', 'var()');
        }
      }
    }

    /* A default that falls back on another default brings it along: `--button-radius` on `--control-radius` */
    for (const [ variable ] of [ ...found ]) {
      const fallback = [ ...sheets.defaults.values() ].find((entry) => entry.variable === variable)?.fallback ?? '';

      for (const inner of fallback.matchAll(/var\((--[\w-]+)/g)) {
        if ([ ...sheets.defaults.values() ].some((entry) => entry.variable === inner[1])) {
          add(inner[1], 'Default', variable);
        }
      }
    }

    /* A spacing prop of the component itself takes the named steps */
    if (/\bSpacing\b/.test(ownText)) {
      for (const step of SPACE_STEPS) {
        add(`--space-${step}`, 'Spacing', `${step}`);
      }
    }

    return [ ...found ].map(([ variable, { group, via } ]) => this.describe(variable, group, [ ...via ]))
      .sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || a.variable.localeCompare(b.variable, 'en', { numeric: true }));
  }

  private describe(variable: string, group: ThemeVariableGroup, via: string[]): ThemeVariable {
    const sheets = this.sheets();
    const declared = sheets.variables.get(variable);
    const defaultOf = [ ...sheets.defaults.values() ].find((entry) => entry.variable === variable);
    const colourOf = [ ...sheets.colours.values() ].find((entry) => entry.variable === variable && entry.fallback);

    return {
      variable,
      group,
      via    : via.slice(0, 4),
      default: readableValue(declared?.light ?? defaultOf?.fallback ?? colourOf?.fallback ?? sheets.knobs.get(variable)),
      dark   : readableValue(declared?.dark)
    };
  }

  /** Every variable any page reads, with the pages that read it */
  private allVariables(): ThemeVariable[] {
    const byVariable = new Map<string, ThemeVariable & { pages: string[] }>();

    for (const route of this.routes()) {
      for (const variable of this.variablesOf(route)) {
        const known = byVariable.get(variable.variable);
        byVariable.set(variable.variable, { ...variable, pages: [ ...(known?.pages ?? []), route ] });
      }
    }

    return [ ...byVariable.values() ]
      .sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group) || a.variable.localeCompare(b.variable, 'en', { numeric: true }));
  }

}

/* --------
 * Plugin Definition
 * -------- */

/**
 * `virtual:ui-theme/<section>/<name>`: the variables of the theme a component reads, for the
 * Customization section of its page; `virtual:ui-theme/all`: every variable with the pages that read
 * it, for the Foundations page. Worked out from the source and the stylesheets of the package at build
 * time, like the props tables, and dropped when either changes.
 */
export function uiTheme(sourceRoot: string): Plugin {
  const reader = new ThemeReader(sourceRoot);

  return {
    name: 'platform:theme',

    resolveId(id) {
      return id.startsWith(PREFIX) ? `\0${id}` : null;
    },

    load(id) {
      if (!id.startsWith(RESOLVED)) {
        return null;
      }

      return `export default ${JSON.stringify(reader.read(id.slice(RESOLVED.length)))};`;
    },

    configureServer(server: ViteDevServer) {
      server.watcher.on('change', (file) => {
        if (!reader.owns(file)) {
          return;
        }

        reader.invalidate();

        const stale = [ ...server.moduleGraph.idToModuleMap.values() ].filter((module) => module.id?.startsWith(RESOLVED));

        for (const module of stale) {
          server.moduleGraph.invalidateModule(module);
        }

        if (stale.length) {
          server.ws.send({ type: 'full-reload' });
        }
      });
    }
  };
}
