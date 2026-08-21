import { resolve } from 'node:path';

import { AbstractedScaffolder } from './lib';

import type { OpenApiDocument } from './types/openapi';
import type { PlannedFile } from '../write-plan';


/* --------
 * Internal Types
 * -------- */
/** One endpoint, reduced to what generating a hook for it needs */
/** A parameter a function takes after its route parameters: the options, and the page request */
interface TrailingParam {
  isOptional?: boolean;
  name: string;
  type: string;
}


interface EndpointDescriptor {
  /** The DTO the endpoint answers with, already unwrapped from an array */
  itemType: string | null;

  /** The HTTP method, uppercase */
  method: string;

  /** The name the API gave the operation, taken from 'x-element-name' */
  name: string;

  /** The route parameters, in the order the path declares them */
  params: string[];

  /** The DTO the endpoint accepts as body */
  requestType: string | null;

  /** Whether the response is a page of itemType, rather than the item or a plain collection */
  returnsPage: boolean;

  /** Whether the response is a collection of itemType */
  returnsCollection: boolean;

  /** The path segments the query key is built from, version prefix excluded */
  segments: string[];

  /** The resource the operation belongs to, which decides the file it lands in */
  resource: string;
}

const QUERY_METHOD = 'GET';

const MUTATION_METHODS = [ 'POST', 'PUT', 'PATCH', 'DELETE' ];


/* --------
 * Main Scaffolder Definition
 * -------- */
export class HooksScaffolder extends AbstractedScaffolder {

  // ----
  // Source Description
  // ----
  protected get cacheKey(): string {
    return 'scaffold-hooks';
  }


  protected get sourceName(): string {
    return 'OpenAPI Specification';
  }


  protected describeSource(source: OpenApiDocument): string {
    const endpoints = HooksScaffolder.describeEndpoints(source);

    const named = endpoints.length;
    const typed = endpoints.filter((endpoint) => endpoint.itemType).length;

    return `Found ${named} named operation${named === 1 ? '' : 's'}, ${typed} of them answering with a known type.`;
  }


  /**
   * What the generated hooks import their models from.
   *
   * Inside one package it is a relative path. Across a monorepo it is the name of the package
   * holding them, which no path can reach: `models` in this command's section of '.proedis.yml'
   * says which, and without it the relative path is assumed.
   */
  private get modelsSpecifier(): string {
    const configured = this.project.getSettings(this.cacheKey).models;

    return typeof configured === 'string' && configured ? configured : '../../models/scaffold';
  }


  protected async build(): Promise<void> {
    const openApiDocument = await this.getSource<OpenApiDocument>(HooksScaffolder.assertOpenApiDocument);

    const hooksPath = resolve(this.outputDirectory, 'hooks', 'scaffold');

    /** The whole folder mirrors the API, so it is rebuilt rather than merged */
    this.wipeDirectories([ hooksPath ]);

    const endpoints = HooksScaffolder.disambiguate(HooksScaffolder.describeEndpoints(openApiDocument));

    /**
     * Group by resource, not by tag.
     *
     * The tag would be the natural choice and on this document it is empty for almost every
     * operation, which piles them all into one file of fifteen thousand lines. The first static
     * segment of the route is always there, and it is also how someone looks a hook up.
     */
    const byResource = endpoints.reduce<Record<string, EndpointDescriptor[]>>((acc, endpoint) => ({
      ...acc,
      [endpoint.resource]: [ ...(acc[endpoint.resource] ?? []), endpoint ]
    }), {});

    const files = Object.entries(byResource)
      .map(([ resource, group ]) => HooksScaffolder.renderResourceFile(hooksPath, resource, group, this.modelsSpecifier));

    this.plan.add(...files, HooksScaffolder.renderBarrel(hooksPath, files));
  }


  // ----
  // Source Reading
  // ----

  private static assertOpenApiDocument(source: unknown): OpenApiDocument {
    if (typeof source !== 'object' || source == null || Array.isArray(source)) {
      throw new Error('Definition error: expected an object');
    }

    const document = source as OpenApiDocument;

    if (typeof document.paths !== 'object' || document.paths == null) {
      throw new Error('Definition error: the document declares no \'paths\'');
    }

    return document;
  }


  /**
   * Reduce the document to the operations a hook can be generated for.
   *
   * An operation without 'x-element-name' is skipped: the name is what the hook is called, and
   * deriving one from the route produces names nobody chose — 'useCreateItemsCreate' and the like.
   */
  private static describeEndpoints(document: OpenApiDocument): EndpointDescriptor[] {
    const paths: Record<string, Record<string, any>> = document.paths as any;

    return Object.entries(paths).flatMap(([ path, pathItem ]) => Object
      .entries(pathItem)
      .filter(([ method ]) => method.toUpperCase() === QUERY_METHOD || MUTATION_METHODS.includes(method.toUpperCase()))
      .flatMap(([ method, operation ]) => {
        const name = operation['x-element-name'];

        /**
         * A name that is not an identifier cannot become a function.
         *
         * Documents carry names the client cannot use: a lambda handler is named after the class
         * the compiler generated for it, and a framework that never set a name leaves its own
         * default in place — a fully qualified method signature, spaces and parentheses included.
         * Skipping those leaves the operation without a hook, which is visible; emitting them
         * produces a file that does not parse.
         */
        if (typeof name !== 'string' || !HooksScaffolder.isValidIdentifier(name)) {
          return [];
        }

        const response = HooksScaffolder.readResponseType(operation, document.components?.schemas as any ?? {});

        return [ {
          itemType         : response.itemType,
          method           : method.toUpperCase(),
          name,
          params           : HooksScaffolder.readRouteParams(path),
          requestType      : HooksScaffolder.readRequestType(operation),
          returnsCollection: response.returnsCollection,
          returnsPage      : response.returnsPage,
          resource         : HooksScaffolder.readResource(path),
          segments         : HooksScaffolder.readSegments(path)
        } ];
      }));
  }


  /**
   * The DTO of the success response, unwrapped from whatever wraps it.
   *
   * A page is recognised through the schema it references — an object carrying `data` and
   * `metadata` — and reduced to the type of its items: the envelope is a generic on the client
   * side, so generating a class per page shape would produce a hundred and fifty duplicates of
   * the same two fields.
   */
  private static readResponseType(
    operation: any,
    schemas: Record<string, any>
  ): { itemType: string | null; returnsCollection: boolean; returnsPage: boolean } {
    const responses = operation.responses ?? {};

    const success = Object.keys(responses).find((code) => code.startsWith('2'));
    const schema = success ? responses[success]?.content?.['application/json']?.schema : null;

    if (!schema) {
      return { itemType: null, returnsCollection: false, returnsPage: false };
    }

    if (schema.type === 'array') {
      return { itemType: HooksScaffolder.readRefName(schema.items), returnsCollection: true, returnsPage: false };
    }

    const name = HooksScaffolder.readRefName(schema);
    const referenced = name ? schemas[name] : null;
    const pageItems = referenced?.properties?.data?.items;

    if (pageItems && referenced?.properties?.metadata) {
      return { itemType: HooksScaffolder.readRefName(pageItems), returnsCollection: false, returnsPage: true };
    }

    return { itemType: name, returnsCollection: false, returnsPage: false };
  }


  private static readRequestType(operation: any): string | null {
    const schema = operation.requestBody?.content?.['application/json']?.schema;

    return schema ? HooksScaffolder.readRefName(schema) : null;
  }


  /** A schema reaches its DTO either directly or through the single-entry allOf Swashbuckle emits */
  private static readRefName(schema: any): string | null {
    if (!schema) {
      return null;
    }

    const ref = schema.$ref ?? (Array.isArray(schema.allOf) && schema.allOf.length === 1 ? schema.allOf[0]?.$ref : null);

    return typeof ref === 'string' ? ref.split('/').pop() ?? null : null;
  }


  /** The same normalisation the namespaces use, so a key here matches a Path there */
  private static readSegments(path: string): string[] {
    return path.replace(/(^\/v\d+\/)|(^\/)/, '').split('/').filter(Boolean);
  }


  /** The first static segment of the route: the resource every operation under it acts on */
  private static readResource(path: string): string {
    return HooksScaffolder.readSegments(path).find((segment) => !segment.startsWith('{')) ?? 'common';
  }


  private static readRouteParams(path: string): string[] {
    return Array.from(path.matchAll(/{([^}]+)}/g)).map((match) => match[1] as string);
  }


  /**
   * Make every hook name unique, keeping the name the API gave the operation wherever it already is.
   *
   * Names collide legitimately: the same handler serves several routes — a paginated list and the
   * same list projected onto another DTO — and the document names the operation, not the route. A
   * duplicate would be a redeclaration in the generated file, so the routes that share a name are
   * told apart by the path segments they do not have in common. Nothing depends on the order the
   * document lists them in.
   *
   * @param endpoints Every endpoint a hook is generated for
   */
  private static disambiguate(endpoints: EndpointDescriptor[]): EndpointDescriptor[] {
    const byName = endpoints.reduce<Record<string, EndpointDescriptor[]>>((acc, endpoint) => ({
      ...acc,
      [endpoint.name]: [ ...(acc[endpoint.name] ?? []), endpoint ]
    }), {});

    return Object.values(byName).flatMap((group) => {
      if (group.length === 1) {
        return group;
      }

      /** The segments every route of the group shares carry no information about which is which */
      const common = group
        .map((endpoint) => endpoint.segments.filter((segment) => !segment.startsWith('{')))
        .reduce((left, right) => left.filter((segment) => right.includes(segment)));

      return group.map((endpoint) => {
        const distinctive = endpoint.segments
          .filter((segment) => !segment.startsWith('{') && !common.includes(segment))
          .map((segment) => HooksScaffolder.toPascalCase(segment))
          .join('');

        /**
         * Two routes can share every static segment and differ only by taking a parameter — the
         * collection of an entity and the same collection scoped to one of them. There the
         * parameters are what tells them apart.
         */
        const suffix = distinctive || endpoint.params.map((param) => HooksScaffolder.toPascalCase(param)).join('');

        if (!suffix) {
          return endpoint;
        }

        return { ...endpoint, name: `${endpoint.name}${distinctive ? '' : 'By'}${suffix}` };
      });
    });
  }


  // ----
  // Rendering
  // ----

  /**
   * Render every hook of a tag into one file.
   *
   * A GET becomes a query, everything else a mutation, and the query key is the path split on
   * slashes with the route parameters in place — the same shape `useClientQuery` expects, so
   * nothing has to reconstruct the url at runtime.
   */
  private static renderResourceFile(
    root: string,
    resource: string,
    endpoints: EndpointDescriptor[],
    modelsSpecifier: string
  ): PlannedFile {
    const models = Array.from(new Set(
      endpoints.flatMap((endpoint) => [ endpoint.itemType, endpoint.requestType ]).filter(Boolean) as string[]
    )).sort();

    const usesQuery = endpoints.some((endpoint) => endpoint.method === QUERY_METHOD && !endpoint.returnsPage);
    const usesMutation = endpoints.some((endpoint) => endpoint.method !== QUERY_METHOD);
    const usesPage = endpoints.some((endpoint) => endpoint.returnsPage);

    const clientImports = [
      usesMutation && 'useClientMutation',
      usesQuery && 'useClientQuery',
      usesPage && 'usePaginatedClientQuery'
    ].filter(Boolean).join(', ');

    /** The page request type is only needed where a hook takes one */
    const typeImports = usesPage ? [ 'import type { PaginatedRequest } from \'@proedis/react-client\';', '' ] : [];

    const content = [
      HooksScaffolder.renderFileHeader(),
      `import { ${clientImports} } from '@proedis/react-client';`,
      '',
      ...typeImports,
      ...(models.length ? [ `import { ${models.join(', ')} } from '${modelsSpecifier}';`, '' ] : []),
      '',
      ...HooksScaffolder.renderResourceKey(resource, endpoints),
      ...endpoints
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .flatMap((endpoint) => [
          ...(endpoint.params.length ? [ ...HooksScaffolder.renderPropsType(endpoint), '' ] : []),
          ...HooksScaffolder.renderQueryKey(endpoint),
          '',
          /** A mutation has no query to describe, and a page is described by its own hook */
          ...(endpoint.method === QUERY_METHOD && !endpoint.returnsPage
            ? [ ...HooksScaffolder.renderQueryArgs(endpoint), '' ]
            : []),
          ...HooksScaffolder.renderHook(endpoint),
          ''
        ])
    ].join('\n');

    return {
      content,
      noOverride: false,
      path      : resolve(root, `${HooksScaffolder.toKebabCase(resource)}.ts`)
    };
  }


  /**
   * Render the key shared by every operation of the resource: its prefix.
   *
   * `useQueryInvalidation` filters by key prefix, so this is what invalidating the whole resource
   * asks for. It is a function of its own rather than a parameterless call of an operation key,
   * because invalidating everything should be spelled out, not the result of a forgotten argument.
   */
  private static renderResourceKey(resource: string, endpoints: EndpointDescriptor[]): string[] {
    const functionName = `${HooksScaffolder.toCamelCase(resource)}QueryKey`;

    /** An operation named after its own resource already owns the name: leave it alone */
    const isTaken = endpoints.some((endpoint) => `${HooksScaffolder.toFunctionName(endpoint.name)}QueryKey` === functionName);

    if (isTaken || !HooksScaffolder.isValidIdentifier(HooksScaffolder.toCamelCase(resource))) {
      return [];
    }

    return [
      `export function ${functionName}(): string[] {`,
      `  return [ '${resource}' ];`,
      '}',
      ''
    ];
  }


  /**
   * Render the query key of an endpoint as a function of its route parameters.
   *
   * Parameters are required: a key missing one of them is not the key of anything, and making them
   * optional only makes that mistake callable. Invalidating a whole resource is a different request
   * and has its own function — see `renderResourceKey`.
   */
  private static renderQueryKey(endpoint: EndpointDescriptor): string[] {
    const { name, params, segments } = endpoint;

    const functionName = `${HooksScaffolder.toFunctionName(name)}QueryKey`;

    const parts = segments.map((segment) => (segment.startsWith('{')
      ? HooksScaffolder.toCamelCase(segment.slice(1, -1))
      : `'${segment}'`));

    /** Without parameters there is nothing to overload: the key is the same every time */
    if (!params.length) {
      return [
        `export function ${functionName}(): string[] {`,
        `  return [ ${parts.join(', ')} ];`,
        '}'
      ];
    }

    return [
      ...HooksScaffolder.renderOverloadSignatures(endpoint, functionName, [], ': string[]'),
      `export function ${functionName}(${HooksScaffolder.renderImplementationParams(endpoint, [])}): string[] {`,
      ...HooksScaffolder.renderPropsNarrowing(endpoint, []),
      `  return [ ${parts.join(', ')} ];`,
      '}'
    ];
  }


  private static renderQueryArgs(endpoint: EndpointDescriptor): string[] {
    const { name, params, itemType } = endpoint;

    const functionName = `${HooksScaffolder.toFunctionName(name)}QueryArgs`;
    const keyFunction = `${HooksScaffolder.toFunctionName(name)}QueryKey`;
    const config = itemType ? `{ transformer: ${itemType} }` : 'undefined';

    const call = params.length
      ? `${keyFunction}(${params.map((param) => HooksScaffolder.toCamelCase(param)).join(', ')})`
      : `${keyFunction}()`;

    /** Spelled out because an overload without a return type is silently 'any' */
    const returns = `: readonly [ string[], ${itemType ? `{ transformer: typeof ${itemType} }` : 'undefined'} ]`;

    if (!params.length) {
      return [
        `export function ${functionName}()${returns} {`,
        `  return [ ${call}, ${config} ] as const;`,
        '}'
      ];
    }

    return [
      ...HooksScaffolder.renderOverloadSignatures(endpoint, functionName, [], returns),
      `export function ${functionName}(${HooksScaffolder.renderImplementationParams(endpoint, [])})${returns} {`,
      ...HooksScaffolder.renderPropsNarrowing(endpoint, []),
      `  return [ ${call}, ${config} ] as const;`,
      '}'
    ];
  }


  private static renderHook(endpoint: EndpointDescriptor): string[] {
    const { name, params, itemType, returnsCollection, requestType, method } = endpoint;

    const functionName = `use${name}`;

    const responseType = itemType
      ? (returnsCollection ? `${itemType}[]` : itemType)
      : 'unknown';

    const argNames = params.map((param) => HooksScaffolder.toCamelCase(param)).join(', ');

    /** A page is queried through the paginated hook, whose transformer describes the item */
    if (endpoint.returnsPage) {
      const item = itemType ?? 'unknown';
      const trailing: TrailingParam[] = [
        { name: 'pagination', type: 'PaginatedRequest' },
        { isOptional: true, name: 'options', type: `Parameters<typeof usePaginatedClientQuery<${item}>>[3]` }
      ];
      const body = `  return usePaginatedClientQuery<${item}>(${HooksScaffolder.toFunctionName(name)}QueryKey(${argNames}), pagination, ${itemType ? `{ transformer: ${itemType} }` : 'undefined'}, options);`;

      return HooksScaffolder.assembleFunction(
        endpoint,
        functionName,
        trailing,
        `: ReturnType<typeof usePaginatedClientQuery<${item}>>`,
        body
      );
    }

    if (method === QUERY_METHOD) {
      const trailing: TrailingParam[] = [
        { isOptional: true, name: 'options', type: `Parameters<typeof useClientQuery<${responseType}>>[2]` }
      ];
      const body = `  return useClientQuery<${responseType}>(...${HooksScaffolder.toFunctionName(name)}QueryArgs(${argNames}), options);`;

      return HooksScaffolder.assembleFunction(
        endpoint,
        functionName,
        trailing,
        `: ReturnType<typeof useClientQuery<${responseType}>>`,
        body
      );
    }

    const payloadType = requestType ?? 'void';

    /**
     * The payload has to be handed to the request explicitly: the hook builds the config from what
     * this callback returns, and a callback ignoring its argument sends the request with no body.
     */
    const mutationConfig = requestType
      ? `(data) => ({ data${itemType ? `, transformer: ${itemType}` : ''} })`
      : (itemType ? `() => ({ transformer: ${itemType} })` : 'undefined');

    const trailing: TrailingParam[] = [
      { isOptional: true, name: 'options', type: `Parameters<typeof useClientMutation<${payloadType}, ${responseType}>>[3]` }
    ];
    const body = [
      `  return useClientMutation<${payloadType}, ${responseType}>(`,
      `    ${HooksScaffolder.toFunctionName(name)}QueryKey(${argNames}),`,
      `    '${method}',`,
      `    ${mutationConfig},`,
      '    options',
      '  );'
    ].join('\n');

    return HooksScaffolder.assembleFunction(
      endpoint,
      functionName,
      trailing,
      `: ReturnType<typeof useClientMutation<${payloadType}, ${responseType}>>`,
      body
    );
  }


  /**
   * Assemble a function taking its parameters either way, with the body written once.
   *
   * Without route parameters there is nothing to overload and the plain declaration is emitted:
   * two signatures for a function that takes only its options would be noise.
   */
  private static assembleFunction(
    endpoint: EndpointDescriptor,
    functionName: string,
    trailing: TrailingParam[],
    returns: string,
    body: string
  ): string[] {
    if (!endpoint.params.length) {
      return [
        `export function ${functionName}(${HooksScaffolder.renderTrailing(trailing)})${returns} {`,
        body,
        '}'
      ];
    }

    return [
      ...HooksScaffolder.renderOverloadSignatures(endpoint, functionName, trailing, returns),
      `export function ${functionName}(${HooksScaffolder.renderImplementationParams(endpoint, trailing)})${returns} {`,
      ...HooksScaffolder.renderPropsNarrowing(endpoint, trailing),
      body,
      '}'
    ];
  }


  private static renderBarrel(root: string, files: PlannedFile[]): PlannedFile {
    const exports = files
      .map((file) => `export * from './${file.path.split('/').pop()?.replace(/\.ts$/, '')}';`)
      .sort();

    return {
      content   : [ HooksScaffolder.renderFileHeader(), ...exports, '' ].join('\n'),
      noOverride: false,
      path      : resolve(root, 'index.ts')
    };
  }


  private static renderFileHeader(): string {
    return [
      '/* --------',
      ' * AutoGenerated File',
      ' * --',
      ' * This file is autogenerated by Proedis CLI.',
      ' * Does not modify this file as it could be overwritten',
      ' * -------- */',
      ''
    ].join('\n');
  }


  private static toKebabCase(value: string): string {
    return value.trim().replace(/\s+/g, '-').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }


  /**
   * The type naming the route parameters of an operation, shared by all three of its functions.
   *
   * It exists to be used: a component receiving the identifiers a query is built from declares
   * them with this instead of restating `{ id: string }` and drifting from it later.
   */
  private static renderPropsType(endpoint: EndpointDescriptor): string[] {
    const { name, params } = endpoint;

    const members = params
      .map((param) => `  ${HooksScaffolder.toCamelCase(param)}: string;`)
      .join('\n');

    return [
      `export type ${name}Props = {`,
      members,
      '};'
    ];
  }


  /** Declare the trailing parameters the way they appear in a signature */
  private static renderTrailing(trailing: TrailingParam[]): string {
    return trailing.map((param) => `${param.name}${param.isOptional ? '?' : ''}: ${param.type}`).join(', ');
  }


  /** The two ways an operation takes its parameters: one argument each, or the props object */
  private static renderOverloadSignatures(
    endpoint: EndpointDescriptor,
    functionName: string,
    trailing: TrailingParam[],
    returns: string
  ): string[] {
    const { name, params } = endpoint;

    const single = params.map((param) => `${HooksScaffolder.toCamelCase(param)}: string`).join(', ');
    const declared = HooksScaffolder.renderTrailing(trailing);
    const suffix = declared ? `${params.length ? ', ' : ''}${declared}` : '';

    return [
      `export function ${functionName}(${single}${suffix})${returns};`,
      `export function ${functionName}(props: ${name}Props${suffix})${returns};`
    ];
  }


  /**
   * Whether the implementation has to collect its arguments as a rest parameter.
   *
   * With one route parameter the two shapes agree on every position and the arguments can be named.
   * From the second one on they do not: `useX(id, estateId, options)` and `useX(props, options)` put
   * `options` in different places, and no fixed parameter list is compatible with both.
   */
  private static usesRestArguments(endpoint: EndpointDescriptor, trailing: TrailingParam[]): boolean {
    return endpoint.params.length > 1 && trailing.length > 0;
  }


  /** Narrow the two ways into the parameters themselves, which every body starts from */
  private static renderPropsNarrowing(endpoint: EndpointDescriptor, trailing: TrailingParam[]): string[] {
    const { name, params } = endpoint;

    if (!params.length) {
      return [];
    }

    const names = params.map((param) => HooksScaffolder.toCamelCase(param));
    const first = names[0] as string;
    const usesRest = HooksScaffolder.usesRestArguments(endpoint, trailing);

    /** Read from the rest parameter, or from the argument standing in for it */
    const source = (index: number): string => (usesRest ? `args[${index - 1}]` : `${names[index]}Arg`);

    const narrowed = [
      `  const { ${names.join(', ')} } = typeof ${first}OrProps === 'object'`,
      `    ? ${first}OrProps`,
      `    : { ${names.map((paramName, index) => `${paramName}: ${index ? source(index) : `${first}OrProps`}`).join(', ')} } as ${name}Props;`,
      ''
    ];

    if (!usesRest) {
      return narrowed;
    }

    /** The trailing arguments follow the parameters, so where they start depends on the shape used */
    const tuple = trailing.map((param) => `${param.type}${param.isOptional ? ' | undefined' : ''}`).join(', ');

    return [
      ...narrowed,
      `  const [ ${trailing.map((param) => param.name).join(', ')} ] = (typeof ${first}OrProps === 'object'`,
      '    ? args',
      `    : args.slice(${params.length - 1})) as [ ${tuple} ];`,
      ''
    ];
  }


  /** The parameter list of the implementation signature, which accepts both shapes */
  private static renderImplementationParams(endpoint: EndpointDescriptor, trailing: TrailingParam[]): string {
    const { name, params } = endpoint;
    const declared = HooksScaffolder.renderTrailing(trailing);

    if (!params.length) {
      return declared;
    }

    const names = params.map((param) => HooksScaffolder.toCamelCase(param));
    const first = names[0] as string;
    const head = `${first}OrProps: string | ${name}Props`;

    if (HooksScaffolder.usesRestArguments(endpoint, trailing)) {
      return `${head}, ...args: unknown[]`;
    }

    /** Suffixed because the destructuring above binds the plain names in the same scope */
    const rest = names.slice(1).map((paramName) => `${paramName}Arg?: string`);

    return [ head, ...rest, declared ].filter(Boolean).join(', ');
  }


  /** The exported function name of an operation: its name, lowercased on the first letter */
  private static toFunctionName(name: string): string {
    return name.charAt(0).toLowerCase() + name.slice(1);
  }


  private static isValidIdentifier(value: string): boolean {
    return /^[A-Za-z][A-Za-z0-9]*$/.test(value);
  }


  private static toPascalCase(value: string): string {
    return value.split(/[-_]/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  }


  private static toCamelCase(value: string): string {
    return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  }
}
