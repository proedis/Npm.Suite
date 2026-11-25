import fs from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import type { Plugin, ViteDevServer } from 'vite';
import type { PropDoc } from '../src/docs/propDoc';


/* --------
 * Constants Definition
 * -------- */

const DEFAULT_PREFIX = 'virtual:ui-props/';


/** "Defaults to `md`", or a bare number or boolean: "Defaults to 3" */
const DEFAULTS_TO = /Defaults? to (?:`([^`]+)`|(-?\d+(?:\.\d+)?|true|false)\b)/;


/* --------
 * Helpers
 * -------- */

/** Whether a set of compiler flags holds one: the compiler API speaks in bit masks */
function hasFlag(flags: number, flag: number): boolean {
  // eslint-disable-next-line no-bitwise -- the flags of the TypeScript API are bit masks, and there is no other way to read one
  return (flags & flag) !== 0;
}


/**
 * A type as a reader passes it. A variant declared through `cva` has no type node, so the compiler
 * spells it, `"sm" | "md" | null | undefined`: the nullish members go, the quotes become the house
 * single quotes, and a boolean variant reads `boolean`.
 */
function readable(type: string): string {
  const members = [ ...new Set(type.split(' | ').map((member) => member.trim().replace(/^"(.*)"$/, "'$1'"))) ]
    .filter((member) => member !== 'null' && member !== 'undefined');

  return members.length === 2 && members.includes('true') && members.includes('false') ? 'boolean' : members.join(' | ');
}

/** The default a JSDoc states in prose */
function defaultInProse(description: string): string | undefined {
  const match = DEFAULTS_TO.exec(description);
  return match ? match[1] ?? match[2] : undefined;
}

/** The value an expression stands for, through `as const` and a constant declared elsewhere */
function objectLiteral(checker: ts.TypeChecker, node: ts.Expression | undefined): ts.ObjectLiteralExpression | undefined {
  let current = node;

  type Wrapper = ts.AsExpression | ts.SatisfiesExpression | ts.ParenthesizedExpression;

  const isWrapper = (expression: ts.Expression): expression is Wrapper => (
    ts.isAsExpression(expression) || ts.isSatisfiesExpression(expression) || ts.isParenthesizedExpression(expression)
  );

  while (current && isWrapper(current)) {
    current = current.expression;
  }

  if (current && ts.isIdentifier(current)) {
    const declaration = checker.getSymbolAtLocation(current)?.valueDeclaration;
    return declaration && ts.isVariableDeclaration(declaration) ? objectLiteral(checker, declaration.initializer) : undefined;
  }

  return current && ts.isObjectLiteralExpression(current) ? current : undefined;
}

/**
 * The default of a `cva` variant, read from the `defaultVariants` of the call that declares it: the
 * one place it is written, whether inline or through the component's `DEFAULT_VARIANTS` constant.
 */
function cvaDefault(checker: ts.TypeChecker, declaration: ts.Declaration, name: string): string | undefined {
  /* variant key → `variants` object → `variants` property → config object */
  const variants = declaration.parent;
  const variantsProperty = variants?.parent;
  const config = variantsProperty?.parent;

  if (!ts.isPropertyAssignment(declaration) || !config || !ts.isObjectLiteralExpression(config)) {
    return undefined;
  }

  const defaults = config.properties.find((property) => (
    ts.isPropertyAssignment(property) && ts.isIdentifier(property.name) && property.name.text === 'defaultVariants'
  ));

  const object = defaults && ts.isPropertyAssignment(defaults) ? objectLiteral(checker, defaults.initializer) : undefined;
  const entry = object?.properties.find((property) => (
    property.name && ts.isIdentifier(property.name) && property.name.text === name
  ));

  if (!entry || !ts.isPropertyAssignment(entry)) {
    return undefined;
  }

  /* A default written through a constant (`size: DEFAULT_TITLE_SIZE`) is that constant's value */
  let value: ts.Expression = entry.initializer;

  if (ts.isIdentifier(value)) {
    const constant = checker.getSymbolAtLocation(value)?.valueDeclaration;

    if (constant && ts.isVariableDeclaration(constant) && constant.initializer) {
      value = constant.initializer;
    }
  }

  while (ts.isAsExpression(value) || ts.isSatisfiesExpression(value) || ts.isParenthesizedExpression(value)) {
    value = value.expression;
  }

  return ts.isStringLiteral(value) || ts.isNumericLiteral(value) ? value.text : value.getText();
}


/* --------
 * Program
 * -------- */

/**
 * The compiler over the source of the package, with the package's own configuration: the types
 * are read where they are written, so a table shows `ToneFill` and the JSDoc above the prop.
 */
class PropsReader {

  // ----
  // Private properties
  // ----
  private _program: ts.Program | undefined;

  private readonly _root: string;

  private readonly _config: ts.ParsedCommandLine;


  // ----
  // Constructor
  // ----
  constructor(root: string) {
    this._root = root;

    const parsed = ts.getParsedCommandLineOfConfigFile(path.join(root, '..', 'tsconfig.json'), {}, {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
      }
    });

    if (!parsed) {
      throw new Error(`Cannot read the configuration of ${root}`);
    }

    this._config = parsed;
  }


  // ----
  // Public methods
  // ----

  /** Drops the program, so the next read sees the source as it is now */
  public invalidate(): void {
    this._program = undefined;
  }

  /** The source file of the package a path belongs to, if it belongs to it */
  public owns(file: string): boolean {
    return file.startsWith(this._root + path.sep);
  }

  /** The props of the exported interface or type alias with that name */
  public read(typeName: string): PropDoc[] {
    this._program ??= ts.createProgram({ rootNames: this._config.fileNames, options: this._config.options });

    const checker = this._program.getTypeChecker();
    const declaration = this._find(typeName);
    const symbol = checker.getSymbolAtLocation(declaration.name);

    if (!symbol) {
      throw new Error(`No symbol for ${typeName}`);
    }

    const type = checker.getDeclaredTypeOfSymbol(symbol);
    const ownFile = declaration.getSourceFile().fileName;

    return checker.getPropertiesOfType(type)
      .map((property) => ({
        property,
        declarations: (property.declarations ?? []).filter((node) => this.owns(node.getSourceFile().fileName))
      }))
      .filter(({ declarations }) => declarations.length > 0)
      .sort((a, b) => {
        const fileA = a.declarations[0].getSourceFile().fileName;
        const fileB = b.declarations[0].getSourceFile().fileName;

        if ((fileA === ownFile) !== (fileB === ownFile)) {
          return fileA === ownFile ? -1 : 1;
        }

        return fileA === fileB ? a.declarations[0].pos - b.declarations[0].pos : fileA.localeCompare(fileB);
      })
      .map(({ property, declarations }) => this._describe(checker, property, declarations, typeName))
      .map((doc) => {
        const attribute = `data-${doc.name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
        /*
         * The attribute assigned from an expression that names the prop, on one line, as JSX
         * (`data-size={size}`) or as a key (`'data-loading': loading`); a Tailwind variant such as
         * `data-placeholder:text-placeholder` is neither
         */
        const written = !doc.shared
          && new RegExp(`(?:\\s${attribute}=\\{|'${attribute}'\\s*:)[^\\n]*${doc.name}`, 'i').test(this._componentSource(ownFile));
        return written ? { ...doc, dataAttribute: attribute } : doc;
      });
  }

  /**
   * The source of the component a props type belongs to: its whole folder for a component with a
   * subpath of its own, the file alone for a layout primitive or a primitive, which share a folder.
   */
  private _componentSource(file: string): string {
    const folder = path.dirname(file);
    const shared = [ 'core', 'layout', 'primitives' ].includes(path.basename(folder));
    const files = shared
      ? [ file ]
      : fs.readdirSync(folder).filter((name) => /\.tsx?$/.test(name)).map((name) => path.join(folder, name));

    return files.map((name) => fs.readFileSync(name, 'utf8')).join('\n');
  }


  // ----
  // Private methods
  // ----
  private _find(typeName: string): ts.InterfaceDeclaration | ts.TypeAliasDeclaration {
    const matches: (ts.InterfaceDeclaration | ts.TypeAliasDeclaration)[] = [];

    for (const source of this._program?.getSourceFiles() ?? []) {
      if (!this.owns(source.fileName)) {
        continue;
      }

      for (const statement of source.statements) {
        if (
          (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement))
          && statement.name.text === typeName
          && statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
        ) {
          matches.push(statement);
        }
      }
    }

    if (matches.length !== 1) {
      throw new Error(`${matches.length ? 'More than one' : 'No'} exported type named ${typeName} in @proedis/ui`);
    }

    return matches[0];
  }

  private _describe(
    checker: ts.TypeChecker,
    property: ts.Symbol,
    declarations: ts.Declaration[],
    typeName: string
  ): PropDoc {
    /*
     * The type as written, once per distinct spelling: a prop of a union is declared in each member.
     * A type node is kept as the author wrote it, `| null` included; only a spelling the compiler
     * produced for a node-less declaration (a `cva` variant) goes through `readable`.
     */
    const written = [ ...new Set(declarations.map((declaration) => (
      ts.isPropertySignature(declaration) && declaration.type
        ? declaration.type.getText()
        : readable(checker.typeToString(checker.getTypeOfSymbol(property)))
    ))) ];

    /* `true` and `false` from two members read as `boolean`, and a `boolean` member absorbs either */
    const booleanish = written.includes('boolean') || (written.includes('true') && written.includes('false'));
    const spelled = booleanish
      ? [ 'boolean', ...written.filter((text) => ![ 'boolean', 'true', 'false' ].includes(text)) ].join(' | ')
      : written.join(' | ');

    /** The literals behind it, when every member of the union is one */
    const resolved = checker.getNonNullableType(checker.getTypeOfSymbol(property));
    const members = resolved.isUnion() ? resolved.types : [ resolved ];
    const literals = members.every((member) => member.isLiteral() || hasFlag(member.flags, ts.TypeFlags.BooleanLiteral));
    const values = literals ? members.map((member) => checker.typeToString(member).replace(/^"(.*)"$/, "'$1'")) : undefined;
    const isBoolean = values?.length === 2 && values.includes('true') && values.includes('false');

    /** The documentation of the member that has one: in a union only one member may carry it */
    const memberSymbols = declarations.map((node) => (node as ts.NamedDeclaration & { symbol?: ts.Symbol }).symbol);
    const documented = [ property, ...memberSymbols ]
      .find((symbol) => (symbol?.getDocumentationComment(checker).length ?? 0) > 0);

    /** The interface or type alias the prop is written in, through the unions and intersections between */
    let ownerNode: ts.Node | undefined = declarations[0].parent;

    while (ownerNode && !ts.isInterfaceDeclaration(ownerNode) && !ts.isTypeAliasDeclaration(ownerNode)) {
      ownerNode = ownerNode.parent;
    }

    const isOwner = ownerNode && (ts.isInterfaceDeclaration(ownerNode) || ts.isTypeAliasDeclaration(ownerNode));
    const owner = isOwner ? (ownerNode as ts.InterfaceDeclaration | ts.TypeAliasDeclaration).name.text : undefined;

    /*
     * A member of a union written to say "required with" carries no JSDoc of its own: the alias says
     * it once for the pair, as `ButtonLoadingProps` does, and that is what the row shows.
     */
    const ownerSymbol = ownerNode && ts.isTypeAliasDeclaration(ownerNode)
      ? checker.getSymbolAtLocation(ownerNode.name)
      : undefined;
    const source = documented ?? (ownerSymbol?.getDocumentationComment(checker).length ? ownerSymbol : undefined);

    const description = source ? ts.displayPartsToString(source.getDocumentationComment(checker)) : '';
    const defaultTag = (documented ?? property).getJsDocTags(checker).find((tag) => tag.name === 'default');
    const defaultValue = defaultTag
      ? ts.displayPartsToString(defaultTag.text)
      : defaultInProse(description) ?? cvaDefault(checker, declarations[0], property.getName());

    const shared = owner === 'BaseProps';

    return {
      name    : property.getName(),
      type    : spelled,
      values  : values && !isBoolean && values.length > 1 && spelled !== values.join(' | ') ? values : undefined,
      default : defaultValue,
      required: !hasFlag(property.flags, ts.SymbolFlags.Optional),
      description,
      from    : owner && owner !== typeName && owner !== `Strict${typeName}` ? owner : undefined,
      shared
    };
  }

}


/* --------
 * Plugin
 * -------- */

/**
 * `import props from 'virtual:ui-props/StrictButtonProps'` gives the props of that type as the
 * compiler reads them from the source of `@proedis/ui`: name, type, literal values, default,
 * requiredness, JSDoc. Only the props the package declares: what a type inherits from a native element
 * or from Base UI is the page's to name in one line, not three hundred rows.
 *
 * Nothing is written to disk. In development an edit to the package's source drops the program and
 * reloads the pages that read a table.
 */
export function uiProps(sourceRoot: string, prefix: string = DEFAULT_PREFIX): Plugin {
  const reader = new PropsReader(sourceRoot);
  const resolved = `\0${prefix}`;

  return {
    name: `ui-docs:props:${prefix}`,

    resolveId(id) {
      return id.startsWith(prefix) ? `\0${id}` : null;
    },

    load(id) {
      if (!id.startsWith(resolved)) {
        return null;
      }

      return `export default ${JSON.stringify(reader.read(id.slice(resolved.length)))};`;
    },

    configureServer(server: ViteDevServer) {
      server.watcher.on('change', (file) => {
        if (!reader.owns(file)) {
          return;
        }

        reader.invalidate();

        const stale = [ ...server.moduleGraph.idToModuleMap.values() ].filter((module) => module.id?.startsWith(resolved));

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
