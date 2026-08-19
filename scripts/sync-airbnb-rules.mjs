/**
 * Regenerate the vendored Airbnb rule sets used by eslint-config-proedis.
 *
 * Airbnb's shared config is frozen: it never shipped a flat config, its manifest still declares a
 * peer dependency on ESLint 7 or 8 — which makes npm refuse the install outright rather than warn —
 * and the formatting half of it targets core rules that ESLint 10 has removed. What it *does* still
 * carry is a curated, battle tested set of rule decisions, and that is the part worth keeping.
 *
 * So the decisions are copied in, once, and owned from here on. Each rule is classified as it is
 * read:
 *
 *   - a name the @stylistic plugin provides is re-emitted under the '@stylistic/' namespace, since
 *     every one of those is deprecated in ESLint core and gone in the next major
 *   - a name ESLint core no longer knows, and no plugin provides, is dropped: configuring an unknown
 *     rule is a hard error in flat config, not a warning
 *   - everything else is emitted untouched
 *
 * Run it with 'yarn rules:sync' after bumping eslint-config-airbnb-base, then read the report and the
 * diff before committing.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

import { builtinRules } from 'eslint/use-at-your-own-risk';
import stylistic from '@stylistic/eslint-plugin';
import importPlugin from 'eslint-plugin-import';


const require = createRequire(import.meta.url);


/* --------
 * Constants
 * -------- */
const AIRBNB_PACKAGE = 'eslint-config-airbnb-base';

/** The rule sets Airbnb splits its base config into, all of them consumed */
const RULE_SETS = [
  'best-practices',
  'errors',
  'node',
  'style',
  'variables',
  'es6',
  'imports',
  'strict'
];

const OUTPUT_DIRECTORY = resolve('packages/eslint-config-proedis/lib/airbnb');

const STYLISTIC_RULES = new Set(Object.keys(stylistic.rules));
const IMPORT_RULES = new Set(Object.keys(importPlugin.rules).map((name) => `import/${name}`));


/* --------
 * Helpers
 * -------- */

/** Whether a rule name can still be configured, either by core or by a plugin we ship */
const isKnownRule = (name) => builtinRules.has(name) || IMPORT_RULES.has(name);

/** Maximum line width before a value is broken across several lines, kept under the lint limit */
const MAX_WIDTH = 118;

/** Whether an object key can be written without quotes */
const isBareKey = (key) => /^[A-Za-z_$][\w$]*$/.test(key);

const quote = (value) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const renderKey = (key) => (isBareKey(key) ? key : quote(key));


/**
 * Render a rule configuration as a JavaScript literal in the repository style: single quoted
 * strings, spaces inside array brackets, and a break onto several lines only when the value would
 * otherwise run past the line limit.
 *
 * @param value The value to render
 * @param indent Column the value starts at, used to decide whether it still fits
 * @return {string} The rendered literal
 */
function renderValue(value, indent) {
  if (typeof value === 'string') {
    return quote(value);
  }

  if (value === null || typeof value !== 'object') {
    return String(value);
  }

  const isArray = Array.isArray(value);
  const entries = isArray ? value : Object.entries(value);

  if (!entries.length) {
    return isArray ? '[]' : '{}';
  }

  const parts = isArray
    ? entries.map((entry) => renderValue(entry, indent + 2))
    : entries.map(([ key, entry ]) => `${renderKey(key)}: ${renderValue(entry, indent + 2)}`);

  /** Try to keep it on one line first */
  const inline = isArray ? `[ ${parts.join(', ')} ]` : `{ ${parts.join(', ')} }`;

  if (indent + inline.length <= MAX_WIDTH && !inline.includes('\n')) {
    return inline;
  }

  /** Otherwise break it, one entry per line */
  const pad = ' '.repeat(indent + 2);
  const closingPad = ' '.repeat(indent);
  const body = parts.map((part) => `${pad}${part}`).join(',\n');

  return isArray ? `[\n${body}\n${closingPad}]` : `{\n${body}\n${closingPad}}`;
}


/**
 * Render a whole rules object, with the colons aligned by hand the way the repository does it
 * everywhere else.
 *
 * @param rules The rules object to render
 * @return {string} The rendered literal
 */
function renderRules(rules) {
  const names = Object.keys(rules);
  const width = names.reduce((longest, name) => Math.max(longest, quote(name).length), 0);

  const lines = names.map((name) => {
    const key = quote(name).padEnd(width);
    return `  ${key}: ${renderValue(rules[name], width + 4)}`;
  });

  return `{\n${lines.join(',\n')}\n};\n`;
}


/* --------
 * Generation
 * -------- */
const airbnbVersion = require(`${AIRBNB_PACKAGE}/package.json`).version;

const report = { remapped: [], dropped: [], kept: 0, unserializable: [] };

mkdirSync(OUTPUT_DIRECTORY, { recursive: true });

for (const ruleSet of RULE_SETS) {
  const { rules = {} } = require(`${AIRBNB_PACKAGE}/rules/${ruleSet}`);

  const emitted = {};

  for (const [ name, configuration ] of Object.entries(rules)) {
    /** A configuration that does not survive a JSON round trip cannot be vendored as a literal */
    try {
      if (JSON.stringify(configuration) === undefined) {
        throw new Error('serializes to undefined');
      }
    }
    catch {
      report.unserializable.push(`${ruleSet}: ${name}`);
      continue;
    }

    /** Formatting rules move to the @stylistic namespace */
    if (STYLISTIC_RULES.has(name)) {
      emitted[`@stylistic/${name}`] = configuration;
      report.remapped.push(name);
      continue;
    }

    /** A rule nothing provides any more would make ESLint fail on startup */
    if (!isKnownRule(name)) {
      report.dropped.push(`${ruleSet}: ${name}`);
      continue;
    }

    emitted[name] = configuration;
    report.kept += 1;
  }

  const header = [
    '/**',
    ` * Airbnb '${ruleSet}' rules, vendored from ${AIRBNB_PACKAGE}@${airbnbVersion}.`,
    ' *',
    ' * GENERATED FILE — do not edit by hand. Run \'yarn rules:sync\' to rebuild it, and put any',
    ' * deliberate deviation in the preset that consumes this set, so it stays visible as ours.',
    ' */'
  ].join('\n');

  writeFileSync(
    resolve(OUTPUT_DIRECTORY, `${ruleSet}.js`),
    `${header}\nexport default ${renderRules(emitted)}`,
    'utf-8'
  );
}


/* --------
 * Barrel
 * -------- */

/** Turn a kebab cased rule set name into the identifier the generated barrel imports it as */
function toIdentifier(ruleSet) {
  return ruleSet.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

const barrel = [
  '/**',
  ` * Every Airbnb rule set, vendored from ${AIRBNB_PACKAGE}@${airbnbVersion} and flattened into a single`,
  ' * rules object, ready to be dropped into a flat config entry.',
  ' *',
  ' * GENERATED FILE — do not edit by hand. Run \'yarn rules:sync\' to rebuild it.',
  ' */',
  ...RULE_SETS.map((ruleSet) => `import ${toIdentifier(ruleSet)} from './${ruleSet}.js';`),
  '',
  '',
  'export default {',
  RULE_SETS.map((ruleSet) => `  ...${toIdentifier(ruleSet)}`).join(',\n'),
  '};',
  ''
].join('\n');

writeFileSync(resolve(OUTPUT_DIRECTORY, 'index.js'), barrel, 'utf-8');


/* --------
 * Report
 * -------- */
process.stdout.write(`Vendored ${AIRBNB_PACKAGE}@${airbnbVersion}\n`);
process.stdout.write(`  kept as is           ${report.kept}\n`);
process.stdout.write(`  remapped to stylistic ${report.remapped.length}\n`);
process.stdout.write(`  dropped, unknown now  ${report.dropped.length}\n`);

if (report.dropped.length) {
  report.dropped.forEach((entry) => process.stdout.write(`      - ${entry}\n`));
}

if (report.unserializable.length) {
  process.stdout.write(`  NOT serializable      ${report.unserializable.length}\n`);
  report.unserializable.forEach((entry) => process.stdout.write(`      - ${entry}\n`));
}
