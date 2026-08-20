import { resolve } from 'node:path';

import { AbstractedScaffolder } from './lib';

import type { OpenApiDocument } from './types/openapi';
import type { PlannedFile } from '../write-plan';


/* --------
 * Internal Types
 * -------- */
/** One endpoint, reduced to what generating a hook for it needs */
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

  /** The tag grouping the operation, which decides the file it lands in */
  tag: string;
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

    /** Group by tag: one file per area keeps the imports of a hook next to its siblings */
    const byTag = endpoints.reduce<Record<string, EndpointDescriptor[]>>((acc, endpoint) => ({
      ...acc,
      [endpoint.tag]: [ ...(acc[endpoint.tag] ?? []), endpoint ]
    }), {});

    const files = Object.entries(byTag)
      .map(([ tag, tagEndpoints ]) => HooksScaffolder.renderTagFile(hooksPath, tag, tagEndpoints, this.modelsSpecifier));

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
          segments         : HooksScaffolder.readSegments(path),
          tag              : (operation.tags?.[0] as string) || 'common'
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
  private static renderTagFile(
    root: string,
    tag: string,
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
      ...endpoints
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .flatMap((endpoint) => [ ...HooksScaffolder.renderHook(endpoint), '' ])
    ].join('\n');

    return {
      content,
      noOverride: false,
      path      : resolve(root, `${HooksScaffolder.toKebabCase(tag)}.ts`)
    };
  }


  private static renderHook(endpoint: EndpointDescriptor): string[] {
    const { name, params, itemType, returnsCollection, requestType, method } = endpoint;

    /** The response type as the hook declares it: the DTO, or a collection of it */
    const responseType = itemType
      ? (returnsCollection ? `${itemType}[]` : itemType)
      : 'unknown';

    const key = `[ ${endpoint.segments.map((segment) => (segment.startsWith('{')
      ? segment.slice(1, -1).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
      : `'${segment}'`)).join(', ')} ]`;

    const args = params.map((param) => `${HooksScaffolder.toCamelCase(param)}: string`);

    /** The transformer is what turns the payload into the generated class, dates and enums included */
    const requestConfig = itemType ? `{ transformer: ${itemType} }` : 'undefined';

    /**
     * A page is queried through the paginated hook, whose transformer describes the item: the
     * envelope stays a generic and its metadata passes through untouched.
     */
    if (endpoint.returnsPage) {
      return [
        `export function use${name}(`,
        ...[
          ...args,
          'pagination: PaginatedRequest',
          `options?: Parameters<typeof usePaginatedClientQuery<${itemType ?? 'unknown'}>>[3]`
        ].map((arg) => `  ${arg},`),
        ') {',
        `  return usePaginatedClientQuery<${itemType ?? 'unknown'}>(${key}, pagination, ${requestConfig}, options);`,
        '}'
      ];
    }

    if (method === QUERY_METHOD) {
      return [
        `export function use${name}(`,
        ...[ ...args, `options?: Parameters<typeof useClientQuery<${responseType}>>[2]` ].map((arg) => `  ${arg},`),
        ') {',
        `  return useClientQuery<${responseType}>(${key}, ${requestConfig}, options);`,
        '}'
      ];
    }

    /** A mutation carries its payload as the mutate argument, so the body type is the first generic */
    const payloadType = requestType ?? 'void';

    /**
     * The payload has to be handed to the request explicitly: the hook builds the config from what
     * this callback returns, and a callback that ignores its argument sends the request with no
     * body at all — which the server answers as a validation error nobody can trace back to here.
     */
    const mutationConfig = requestType
      ? `(data) => ({ data${itemType ? `, transformer: ${itemType}` : ''} })`
      : (itemType ? `() => (${requestConfig})` : 'undefined');

    return [
      `export function use${name}(`,
      ...[ ...args, `options?: Parameters<typeof useClientMutation<${payloadType}, ${responseType}>>[3]` ]
        .map((arg) => `  ${arg},`),
      ') {',
      `  return useClientMutation<${payloadType}, ${responseType}>(`,
      `    ${key},`,
      `    '${method}',`,
      `    ${mutationConfig},`,
      '    options',
      '  );',
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
