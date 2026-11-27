/*
 * Every public props type of @proedis/ui comes in two: `Strict<Name>Props`, what the component declares
 * itself, and `<Name>Props`, that joined with what it forwards. This reads the published entry points
 * through the compiler and fails when a `<Name>Props` has no `Strict` beside it.
 *
 * Run by the build of the package, after rollup. Not every `*Props` is a component's: the names below
 * are the ones that are not, each kind with its reason. A new one goes here only with a reason.
 */

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';


/* --------
 * Constants Definition
 * -------- */

const ROOT = path.resolve(import.meta.dirname, '..');

const ts = createRequire(path.join(ROOT, 'package.json'))('typescript');

/** Fragments of a type: a union that ties two props together, spliced into `<Name>Props` */
const FRAGMENT = /(?:Loading|Name|Value|Checklist|Confirm|Dirty|Navigation|Own)Props$/;

/** The building blocks every component composes, and the shared bases of a family */
const BLOCKS = new Set([ 'BaseProps', 'PolymorphicProps', 'CommonSliderProps', 'ModalSelectorCommonProps' ]);


/* --------
 * Check
 * -------- */

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const entries = [ 'index.ts', ...manifest.proedisMetadata.exports.map((subpath) => `${subpath}/index.ts`) ]
  .map((entry) => path.join(ROOT, 'src', entry));

const config = ts.getParsedCommandLineOfConfigFile(path.join(ROOT, 'tsconfig.json'), {}, {
  ...ts.sys,
  onUnRecoverableConfigFileDiagnostic: () => undefined
});

const program = ts.createProgram(entries, config.options);
const checker = program.getTypeChecker();
const missing = new Map();
const counted = new Set();

for (const entry of entries) {
  const exported = checker.getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(entry)));
  const names = new Set(exported.map((symbol) => symbol.name));

  for (const symbol of exported) {
    // eslint-disable-next-line no-bitwise -- the flags of the TypeScript API are bit masks, and there is no other way to read one
    const isType = (symbol.flags & (ts.SymbolFlags.Alias | ts.SymbolFlags.Type)) !== 0;
    const { name } = symbol;

    if (!isType || !/^[A-Z]\w*Props$/.test(name) || name.startsWith('Strict') || BLOCKS.has(name) || FRAGMENT.test(name)) {
      continue;
    }

    counted.add(name);

    if (!names.has(`Strict${name}`)) {
      missing.set(name, path.relative(ROOT, entry));
    }
  }
}

if (missing.size) {
  console.error(`strict props: ${missing.size} public props type(s) without their Strict<Name>Props:`);
  missing.forEach((entry, name) => console.error(`  ${name} (${entry})`));
  console.error('Declare what the component owns in Strict<Name>Props and build <Name>Props on it (packages/ui/CLAUDE.md).');
  process.exit(1);
}

process.stdout.write(`strict props: ${counted.size} public props types, every one with its Strict<Name>Props\n`);
