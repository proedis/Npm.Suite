import console from 'node:console';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { cwd } from 'node:process';

import chalk from 'chalk';

import type { Project } from '../../project';
import type { TemplateCompiler } from '../../template.compiler';
import { WritePlan } from '../../write-plan';
import type { WritePlanInspection, WritePlanResult } from '../../write-plan';

import { askForConfirmation, spinnerFeedbackFunction } from '../../../ui';


/* --------
 * Internal Types
 * -------- */

/** What the command line already knows, and must therefore not ask about */
export interface ScaffolderOptions {
  /** Answer every optional prompt affirmatively, for unattended runs */
  autoConfirm?: boolean;

  /** Report what a run would change and write nothing */
  check?: boolean;

  /** The endpoint the definition is downloaded from */
  endpoint?: string;

  /** The host the definition is downloaded from */
  host?: string;

  /** Where to save the downloaded definition, so a later run can be fed from it */
  saveSpec?: string;

  /** A definition on disk to generate from, instead of downloading one */
  spec?: string;
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
   * Where the generated code belongs.
   *
   * A single package project has one source directory and that is the answer. A monorepo does
   * not: models and hooks live in different packages, so the destination is configurable per
   * command through the 'output' key of its section in '.proedis.yml', relative to the project
   * root. Without it nothing changes for anyone.
   */
  protected get outputDirectory(): string {
    const configured = this.project.getSettings(this.cacheKey).output;

    return typeof configured === 'string' && configured
      ? resolve(this.project.rootDirectory, configured)
      : this.project.srcDirectory;
  }


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


  /**
   * Render everything and report what committing would change, leaving the disk untouched.
   *
   * This is what makes the generated code verifiable in a pipeline: the definition is read from
   * a file, the output is rendered and compared, and a project whose generated code lags behind
   * its definition fails the check instead of being noticed months later.
   */
  public async check(): Promise<WritePlanInspection> {
    await this.build();

    console.info();

    return this.plan.inspect();
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
    /**
     * A definition on disk short-circuits the whole download: no prompt, no host, no network.
     *
     * This is the path a pipeline takes, where there is no API to ask and the definition is
     * whatever the repository committed.
     */
    if (this.options.spec) {
      const path = resolve(cwd(), this.options.spec);

      if (!existsSync(path)) {
        throw new Error(`No ${this.sourceName} found at ${path}`);
      }

      const source = validate(JSON.parse(readFileSync(path, 'utf-8')));

      console.info();
      console.info(chalk.cyan(this.describeSource(source)));

      return source;
    }

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

    /**
     * Save the definition next to the code generated from it, when asked.
     *
     * The two belong together: committing the definition is what lets anyone regenerate the same
     * output later, and lets a pipeline check the output without reaching the API.
     */
    if (this.options.saveSpec) {
      const path = resolve(cwd(), this.options.saveSpec);

      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, `${JSON.stringify(downloaded, null, 2)}\n`, 'utf-8');

      console.info(chalk.cyan(`Saved the ${this.sourceName} to ${relative(cwd(), path)}`));
    }

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
