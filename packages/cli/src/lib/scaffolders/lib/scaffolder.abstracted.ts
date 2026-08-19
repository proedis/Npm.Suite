import console from 'node:console';

import chalk from 'chalk';

import type { Project } from '../../project';
import type { TemplateCompiler } from '../../template.compiler';
import { WritePlan } from '../../write-plan';
import type { WritePlanResult } from '../../write-plan';

import { askForConfirmation, spinnerFeedbackFunction } from '../../../ui';


/* --------
 * Internal Types
 * -------- */

/** What the command line already knows, and must therefore not ask about */
export interface ScaffolderOptions {
  /** Answer every optional prompt affirmatively, for unattended runs */
  autoConfirm?: boolean;

  /** The endpoint the definition is downloaded from */
  endpoint?: string;

  /** The host the definition is downloaded from */
  host?: string;
}

/** The two answers every scaffolder needs to reach its source */
export interface SourceAnswers {
  /** The endpoint relative to the host */
  endpoint: string;

  /** The host to download from */
  host: string;
}


/* --------
 * Scaffolder Abstraction
 * -------- */
export abstract class AbstractedScaffolder {

  /**
   * Everything this run intends to do to the filesystem.
   *
   * Nothing reaches the disk until it is committed, so a failure while rendering — the shape
   * every realistic failure of both scaffolders has — leaves the project exactly as it was.
   */
  protected readonly plan: WritePlan = new WritePlan();


  constructor(
    protected readonly project: Project,
    protected readonly compiler: TemplateCompiler,
    protected readonly options: ScaffolderOptions = {}
  ) {
  }


  // ----
  // Abstracted Members
  // ----

  /** The key the host and endpoint are remembered under inside '.proedis.yml' */
  protected abstract get cacheKey(): string;

  /** How the downloaded document is named in the feedback the user reads */
  protected abstract get sourceName(): string;

  /** Summarise what arrived from the server, before a single file gets written */
  protected abstract describeSource(source: any): string;

  /** Fill the write plan. Committing it is not this method's business */
  protected abstract build(): Promise<void>;


  // ----
  // Entry Point
  // ----

  /**
   * Render everything, then write everything.
   *
   * The two halves are deliberately separate: generation used to write as it rendered, so an
   * unresolvable reference or an unmapped type left the output directories emptied and half
   * repopulated.
   */
  public async scaffold(): Promise<WritePlanResult> {
    await this.build();

    console.info();

    return this.plan.commit();
  }


  // ----
  // Shared Phases
  // ----

  /**
   * Ask for host and endpoint, download the definition and hand it back parsed.
   *
   * The answers are remembered **after** the download succeeds, never before: the point of the
   * cache is to offer a configuration that is known to work, and writing on the way in meant a
   * failed host came back as the default on the next run.
   *
   * @param validate Called with the parsed body, to reject a document of the wrong shape
   * @return The downloaded document
   */
  protected async getSource<T>(validate: (source: unknown) => T): Promise<T> {
    /** Resolve host and endpoint, asking only for what the command line did not provide */
    const answers = await this.project.getPromptWithCachedDefaults<SourceAnswers>(
      this.cacheKey,
      [
        {
          name    : 'host',
          type    : 'input',
          message : `Set the host to download the ${this.sourceName} from`,
          validate: (input) => !!input || 'A host is required'
        },
        {
          name    : 'endpoint',
          type    : 'input',
          message : `Set the endpoint serving the ${this.sourceName}`,
          validate: (input) => !!input || 'An endpoint is required'
        }
      ],
      {
        endpoint: this.options.endpoint,
        host    : this.options.host
      }
    );

    const url = `${answers.host.replace(/\/$/, '')}/${answers.endpoint.replace(/^\//, '')}`;

    /**
     * Download the document, letting the spinner carry both outcomes.
     *
     * The platform's own 'fetch' does this: 'node-fetch' was a dependency from the days this
     * package targeted a Node without one, and the engines floor is 22.
     */
    const downloaded = await spinnerFeedbackFunction<unknown>(
      `Downloading ${this.sourceName} from ${url}`,
      async (resolveSource, reject) => {
        try {
          const response = await fetch(url, { headers: { Origin: 'http://localhost' } });

          /** A server that answered with an error never carries the document we asked for */
          if (!response.ok) {
            reject(`${url} answered ${response.status} ${response.statusText}`);
            return;
          }

          resolveSource(await response.json(), `Downloaded ${this.sourceName}`);
        }
        catch (error) {
          reject((error as Error)?.message || `Error while downloading the ${this.sourceName}`);
        }
      }
    );

    /** Reject a document of the wrong shape before anything gets erased on disk */
    const source = validate(downloaded);

    /** Only a configuration that produced a valid document is worth remembering */
    this.project.persistPromptAnswers(this.cacheKey, answers);

    /** Tell the user what arrived, so the file list is not the first sign of it */
    console.info();
    console.info(chalk.cyan(this.describeSource(source)));

    return source;
  }


  /**
   * Declare the directories the generated files live in as rebuilt from scratch.
   *
   * Wiping is deliberate: these files are a clone of a truth that lives in the API, so anything
   * the server no longer returns has to disappear with it. Saying so out loud is what keeps that
   * from looking like data loss — and registering it on the plan rather than doing it here is
   * what keeps it from happening before the whole output is known to be renderable.
   *
   * @param paths The directories to empty and recreate
   */
  protected wipeDirectories(paths: string[]): void {
    this.plan.wipe(paths);
  }


  /**
   * Ask an optional question, unless the run was told to assume yes.
   *
   * @param question The question to ask
   */
  protected async confirm(question: string): Promise<boolean> {
    if (this.options.autoConfirm) {
      return true;
    }

    return askForConfirmation(question);
  }

}
