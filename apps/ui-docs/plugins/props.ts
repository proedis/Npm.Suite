import path from 'node:path';

import ts from 'typescript';

import type { Plugin, ViteDevServer } from 'vite';
import type { PropDoc } from '../src/docs/propDoc';


/* --------
 * Constants Definition
 * -------- */

const PREFIX = 'virtual:ui-props/';

const RESOLVED = `\0${PREFIX}`;

const DEFAULTS_TO = /Defaults? to `([^`]+)`/;


/* --------
 * Helpers
 * -------- */

/** Whether a set of compiler flags holds one: the compiler API speaks in bit masks */
function hasFlag(flags: number, flag: number): boolean {
  // eslint-disable-next-line no-bitwise -- the flags of the TypeScript API are bit masks, and there is no other way to read one
  return (flags & flag) !== 0;
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
      .map(({ property, declarations }) => this._describe(checker, property, declarations, typeName));
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
    /** The type as written, once per distinct spelling: a prop of a union is declared in each member */
    const written = [ ...new Set(declarations.map((declaration) => (
      ts.isPropertySignature(declaration) && declaration.type
        ? declaration.type.getText()
        : checker.typeToString(checker.getTypeOfSymbol(property))
    ))) ];

    const spelled = written.length === 2 && written.includes('true') && written.includes('false') ? 'boolean' : written.join(' | ');

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
    const defaultValue = defaultTag ? ts.displayPartsToString(defaultTag.text) : DEFAULTS_TO.exec(description)?.[1];

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
export function uiProps(sourceRoot: string): Plugin {
  const reader = new PropsReader(sourceRoot);

  return {
    name: 'ui-docs:props',

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
