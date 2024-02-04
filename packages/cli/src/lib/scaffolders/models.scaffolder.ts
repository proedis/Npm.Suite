import { existsSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { AbstractedScaffolder } from './lib';
import { spinnerFeedbackFunction } from '../../ui';

import { ModelsRepository } from './lib/models/ModelsRepository';

import type { OpenApiDocument } from './types/openapi';
import { type SavedFile, TemplateCompiler } from '../template.compiler';
import { globSync } from 'glob';


/* --------
 * Internal Types
 * -------- */
interface ModelsScaffolderAnswers {
  /** The endpoint at which the host will respond with OpenAPI Specification */
  endpoint: string;

  /** The host to use to download OpenAPI Specification */
  host: string;
}


/* --------
 * Main Scaffolder Definition
 * -------- */
export class ModelsScaffolder extends AbstractedScaffolder {

  public async scaffold(): Promise<SavedFile[]> {
    /** Get scaffold configuration */
    const answers = await this.getAnswers();

    /** Download the open api document from server */
    const openApiDocument = await this.getOpenApiDocument(answers);

    /** Get the root folder to use to write/update models */
    const root = this.project.srcDirectory;
    const modelsPath = resolve(root, 'models', 'scaffold');

    /** Clear the entire models folder */
    if (existsSync(modelsPath)) {
      rmSync(modelsPath, { recursive: true, force: true });
    }

    /** Create the Model Repository with downloaded data */
    const modelsRepository = new ModelsRepository(openApiDocument.components, this.compiler, modelsPath);
    modelsRepository.write();

    return this.generateBarrel(modelsPath);
  }


  private async getOpenApiDocument(answers: ModelsScaffolderAnswers): Promise<OpenApiDocument> {
    /** Download the OpenApi Document from the Server */
    const openApiDocument = await spinnerFeedbackFunction<OpenApiDocument>(
      'Downloading OpenApi Specification',
      async (resolveOpenApi, reject) => (
        import('node-fetch')
          .then((fetch) => fetch.default(
            `${answers.host}/${answers.endpoint.replace(/^\//, '')}`,
            {
              headers: {
                Origin: 'http://localhost'
              }
            }
          ))
          .then(async (response) => (
            resolveOpenApi(await response.json() as OpenApiDocument)
          ))
          .catch((error) => {
            reject(error?.message || 'Error while downloading OpenApi Specification');
          })
      )
    );

    /** Assert is a valid object */
    if (typeof openApiDocument !== 'object' || openApiDocument == null || Array.isArray(openApiDocument)) {
      throw new Error('Definition error: expected an object');
    }

    /** Assert the version of the OpenApi Document is valid */
    if (openApiDocument.openapi !== '3.0.1') {
      throw new Error(`Expecting OpenApi document Version 3.0.1, found ${openApiDocument.openapi}`);
    }

    /** Return the document */
    return openApiDocument;
  }


  private generateBarrel(folder: string): string[] {
    /** Get all typescript files in the folder */
    const files = globSync('**/*.ts', {
      cwd: folder
    }).sort((a, b) => a.localeCompare(b)).map(f => `./${f}`);

    const content: string[] = [
      TemplateCompiler.getDisclaimer(),
      ''
    ];

    files.map((file) => file.replace(/\.ts/i, '')).forEach((file) => {
      content.push(
        `export * from '${file}';`,
        ''
      );
    });

    const barrelFile = resolve(folder, 'index.ts');

    writeFileSync(barrelFile, content.join('\n'), 'utf-8');

    return [ ...files, barrelFile ].map(file => resolve(folder, file));
  }


  private async getAnswers(): Promise<ModelsScaffolderAnswers> {
    return this.project.getPromptWithCachedDefaults<ModelsScaffolderAnswers>(
      'scaffold-models',
      [
        {
          type   : 'input',
          name   : 'host',
          message: 'The host to use to download OpenAPI Specification'
        },
        {
          type   : 'input',
          name   : 'endpoint',
          message: 'The endpoint at which the host will respond with OpenAPI Specification'
        }
      ]
    );
  }

}
