import console from 'node:console';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { cwd } from 'node:process';

import chalk from 'chalk';


/* --------
 * Internal Types
 * -------- */

/** A file that has been rendered and is waiting to be written */
export interface PlannedFile {
  /** The rendered content */
  content: string;

  /** Whether an existing file at this path belongs to the user and must survive */
  noOverride: boolean;

  /** The absolute path the file belongs at */
  path: string;
}

/** What happened to a planned file once the plan was committed */
export type WrittenFileAction = 'created' | 'updated' | 'unchanged' | 'preserved';

export interface WrittenFile {
  /** What the commit did with it */
  action: WrittenFileAction;

  /** The absolute path of the file */
  path: string;
}

/** The tally a single run produces */
export interface WriteStats {
  /** Files that did not exist before */
  created: number;

  /** Files that existed, and whose content is now different */
  updated: number;

  /** Files that existed with exactly this content */
  unchanged: number;

  /** Files left untouched because they belong to the user */
  preserved: number;
}

/** What a commit would do, were it run now */
export interface WritePlanInspection extends WritePlanResult {
  /** Whether the files on disk already match what the plan would write */
  isUpToDate: boolean;

  /** Files living inside a mirrored directory that the plan no longer renders */
  stale: string[];
}

export interface WritePlanResult {
  /** The tally, for the run summary */
  stats: WriteStats;

  /** Every file the plan touched or deliberately did not */
  written: WrittenFile[];
}


/* --------
 * Write Plan Definition
 * -------- */

/**
 * Everything a scaffold run intends to do to the filesystem, collected before any of it happens.
 *
 * Generation used to write as it rendered, so a failure halfway through — an unresolvable `$ref`,
 * an OpenAPI type nothing maps, a template throwing on unexpected data — left the output
 * directories already emptied and partially repopulated, with no way back short of git. All of
 * those failures happen while rendering, so rendering everything first and committing once moves
 * the point of no return past them: what is left after `commit` starts is real I/O failure only.
 *
 * Holding the content also means the previous file can be compared before it is replaced, which is
 * where the `unchanged` count comes from — a run that rewrote twelve identical files used to report
 * twelve updates.
 */
export class WritePlan {

  /** Directories to empty, registered before the files that will repopulate them */
  private readonly _directoriesToWipe: string[] = [];

  /** The files to write */
  private readonly _files: PlannedFile[] = [];


  // ----
  // Plan Building
  // ----

  /**
   * Register directories that mirror the API and have to be rebuilt from scratch.
   *
   * @param paths The directories to empty
   */
  public wipe(paths: string[]): this {
    this._directoriesToWipe.push(...paths);
    return this;
  }


  /**
   * Add rendered files to the plan.
   *
   * @param files The files to write when the plan is committed
   */
  public add(...files: PlannedFile[]): this {
    this._files.push(...files);
    return this;
  }


  /** How many files the plan holds */
  public get size(): number {
    return this._files.length;
  }


  // ----
  // Plan Execution
  // ----

  /**
   * Answer what a commit would do, without doing it.
   *
   * The comparison is the same one `commit` performs, which is the point: a check that reasoned
   * differently from the write would eventually disagree with it, and the disagreement would
   * surface as a pipeline failing on a project that is actually up to date.
   *
   * A wiped directory is not read here — nothing is emptied — so a file that only exists on disk
   * because it is stale is reported through `stale`, which a commit would have silently removed.
   */
  public inspect(): WritePlanInspection {
    const stats: WriteStats = { created: 0, updated: 0, unchanged: 0, preserved: 0 };
    const written: WrittenFile[] = [];

    this._files.forEach((file) => {
      const previousContent = existsSync(file.path) ? WritePlan.readFileOrNull(file.path) : null;
      const existedBefore = previousContent !== null;

      if (existedBefore && file.noOverride) {
        stats.preserved += 1;
        written.push({ action: 'preserved', path: file.path });
        return;
      }

      const action: WrittenFileAction = !existedBefore ? 'created'
        : previousContent === file.content ? 'unchanged'
          : 'updated';

      stats[action] += 1;
      written.push({ action, path: file.path });
    });

    /** Anything inside a mirrored directory that the plan does not account for is left over */
    const planned = new Set(this._files.map((file) => file.path));

    const stale = this._directoriesToWipe
      .filter((path) => existsSync(path))
      .flatMap((path) => WritePlan.listFilesRecursively(path))
      .filter((path) => !planned.has(path));

    return { stats, written, stale, isUpToDate: !stats.created && !stats.updated && !stale.length };
  }


  /**
   * Apply the whole plan: read the current state, empty the directories, write every file.
   *
   * The state is read **before** the wipe on purpose: a file inside a directory about to be
   * emptied would otherwise always look new, and the comparison that tells an actual change from
   * a rewrite would be lost exactly where it matters most.
   */
  private static listFilesRecursively(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = resolve(directory, entry.name);

      return entry.isDirectory() ? WritePlan.listFilesRecursively(path) : [ path ];
    });
  }


  public commit(): WritePlanResult {
    /** Snapshot the current state while it is still there */
    const previousState = new Map<string, string | null>(
      this._files.map((file) => [
        file.path,
        existsSync(file.path) ? WritePlan.readFileOrNull(file.path) : null
      ])
    );

    /**
     * Empty every directory that mirrors the API, announcing it as it happens.
     *
     * The announcement lives here rather than where the directories are declared: a run that
     * failed while rendering would otherwise have told the user it was rebuilding directories
     * it never touched.
     */
    const existingDirectories = this._directoriesToWipe.filter((path) => existsSync(path));

    if (existingDirectories.length) {
      console.info('These directories mirror the API and are rebuilt from scratch:');
      existingDirectories.forEach((path) => console.info(chalk.yellow(`  - ${relative(cwd(), path)}`)));
      console.info();
    }

    this._directoriesToWipe.forEach((path) => {
      if (existsSync(path)) {
        rmSync(path, { recursive: true, force: true });
      }

      mkdirSync(path, { recursive: true });
    });

    const stats: WriteStats = { created: 0, updated: 0, unchanged: 0, preserved: 0 };
    const written: WrittenFile[] = [];

    this._files.forEach((file) => {
      const previousContent = previousState.get(file.path) ?? null;
      const existedBefore = previousContent !== null;

      /** A file the user owns is left exactly as it was found */
      if (existedBefore && file.noOverride) {
        stats.preserved += 1;
        written.push({ action: 'preserved', path: file.path });

        console.info(chalk.cyan(`  = ${relative(cwd(), file.path)} (kept, this file is yours to edit)`));
        return;
      }

      /** Assert the parent folder exists */
      const parent = dirname(file.path);
      if (!existsSync(parent)) {
        mkdirSync(parent, { recursive: true });
      }

      writeFileSync(file.path, file.content, 'utf-8');

      /**
       * The action describes the content, not the write: a file wiped a moment ago is written
       * again regardless, but reporting it as new when it came back identical would be a lie.
       */
      const action: WrittenFileAction = !existedBefore ? 'created'
        : previousContent === file.content ? 'unchanged'
          : 'updated';

      stats[action] += 1;
      written.push({ action, path: file.path });

      console.info(WritePlan.describe(action, file.path));
    });

    return { stats, written };
  }


  // ----
  // Internal Utilities
  // ----

  /** Read a file, treating an unreadable one as absent rather than failing the run */
  private static readFileOrNull(path: string): string | null {
    try {
      return readFileSync(path, 'utf-8');
    }
    catch {
      return null;
    }
  }


  /** The single line printed for a file, coloured by what happened to it */
  private static describe(action: WrittenFileAction, path: string): string {
    const relativePath = relative(cwd(), path);

    switch (action) {
      case 'created':
        return chalk.green(`  A ${relativePath}`);

      case 'updated':
        return chalk.yellow(`  M ${relativePath}`);

      default:
        return chalk.gray(`  · ${relativePath}`);
    }
  }

}
