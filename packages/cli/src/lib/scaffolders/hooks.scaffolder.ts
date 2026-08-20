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


  protected async build(): Promise<void> {
    const openApiDocument = await this.getSource<OpenApiDocument>(HooksScaffolder.assertOpenApiDocument);

    const hooksPath = resolve(this.project.srcDirectory, 'hooks', 'scaffold');

    /** The whole folder mirrors the API, so it is rebuilt rather than merged */
    this.wipeDirectories([ hooksPath ]);

    const endpoints = HooksScaffolder.describeEndpoints(openApiDocument);

    /** Group by tag: one file per area keeps the imports of a hook next to its siblings */
    const byTag = endpoints.reduce<Record<string, EndpointDescriptor[]>>((acc, endpoint) => ({
      ...acc,
      [endpoint.tag]: [ ...(acc[endpoint.tag] ?? []), endpoint ]
    }), {});

    const files = Object.entries(byTag)
      .map(([ tag, tagEndpoints ]) => HooksScaffolder.renderTagFile(hooksPath, tag, tagEndpoints));

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

        if (typeof name !== 'string' || !name) {
          return [];
        }

        const response = HooksScaffolder.readResponseType(operation);

        return [ {
          itemType         : response.itemType,
          method           : method.toUpperCase(),
          name,
          params           : HooksScaffolder.readRouteParams(path),
          requestType      : HooksScaffolder.readRequestType(operation),
          returnsCollection: response.returnsCollection,
          segments         : HooksScaffolder.readSegments(path),
          tag              : (operation.tags?.[0] as string) || 'common'
        } ];
      }));
  }


  /** The DTO of the success response, unwrapped when the endpoint answers with a collection */
  private static readResponseType(operation: any): { itemType: string | null; returnsCollection: boolean } {
    const responses = operation.responses ?? {};

    const success = Object.keys(responses).find((code) => code.startsWith('2'));
    const schema = success ? responses[success]?.content?.['application/json']?.schema : null;

    if (!schema) {
      return { itemType: null, returnsCollection: false };
    }

    if (schema.type === 'array') {
      return { itemType: HooksScaffolder.readRefName(schema.items), returnsCollection: true };
    }

    return { itemType: HooksScaffolder.readRefName(schema), returnsCollection: false };
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
}
