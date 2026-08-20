import console from 'node:console';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { relative, resolve, sep as pathSeparator } from 'node:path';
import { cwd } from 'node:process';

import chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as yaml from 'yaml';

import type { PackageJson } from 'type-fest';


/* --------
 * Project Controller
 * -------- */
export class Project {

  // ----
  // Private Utilities
  // ----

  /**
   * Starting from current working directory, search for an element named as requested.
   * If element doesn't exist, the function will walk backward to parent folder (recursive)
   * to find the requested directory.
   * If no directory could be found, it will be optionally created and returned.
   * @param name The name of the element to search to
   * @param type The type of the element to search to
   * @private
   */
  private static getFirstPathFor(name: string, type: 'file'): string | null;
  private static getFirstPathFor(name: string, type: 'directory', createIfMissing?: boolean): string | null;
  private static getFirstPathFor(name: string, type: 'directory' | 'file', createIfMissing?: boolean): string | null {
    /** Get current working directory path parts */
    const cwdPathParts = cwd().split(pathSeparator);

    /** Walk backward from current path to root to find a valid element */
    while (cwdPathParts.length > 1) {
      /** Rebuild the path as single string */
      const rebuiltPath = cwdPathParts.join(pathSeparator);

      /** Check if the current directory is named 'name' and if it is, return it */
      if (type === 'directory' && cwdPathParts[cwdPathParts.length - 1] === name) {
        return rebuiltPath;
      }

      /** Check if the current directory contain an element named 'name' */
      const maybeChildPathName = resolve(rebuiltPath, name);
      if (existsSync(maybeChildPathName)) {
        const stats = statSync(maybeChildPathName);

        if ((type === 'file' && stats.isFile()) || (type === 'directory' && stats.isDirectory())) {
          return maybeChildPathName;
        }
      }

      /** Remove the last part of the path */
      cwdPathParts.pop();
    }

    /** If the directory has not been found, check first if it could be created */
    if (createIfMissing && type === 'directory') {
      const newDirectoryPath = resolve(cwd(), name);
      mkdirSync(newDirectoryPath, { recursive: true });
      console.info(
        chalk.green(`${name} element missing, created ad ${relative(cwd(), newDirectoryPath)}`)
      );
      return newDirectoryPath;
    }

    return null;
  }


  /**
   * Every package.json between the current working directory and the filesystem root, nearest
   * first.
   *
   * `getFirstPathFor` stops at the first hit, which is the right answer for "which project am I
   * in" and the wrong one for "is this package available here": inside a monorepo the manifest
   * that declares a dependency is often not the closest one.
   *
   * @private
   */
  private static getManifestPaths(): string[] {
    const cwdPathParts = cwd().split(pathSeparator);
    const manifestPaths: string[] = [];

    /** Walk backward from the current path to the root, collecting every manifest on the way */
    while (cwdPathParts.length > 1) {
      const manifestPath = resolve(cwdPathParts.join(pathSeparator), 'package.json');

      if (existsSync(manifestPath) && statSync(manifestPath).isFile()) {
        manifestPaths.push(manifestPath);
      }

      cwdPathParts.pop();
    }

    return manifestPaths;
  }


  // ----
  // Folders and Directories
  // ----

  private _rootDirectory: string | undefined;

  private _srcDirectory: string | undefined;


  public get rootDirectory(): string {
    if (this._rootDirectory) {
      return this._rootDirectory;
    }

    const srcPath = Project.getFirstPathFor('src', 'directory');

    this._rootDirectory = srcPath ? resolve(srcPath, '..') : cwd();

    return this._rootDirectory;
  }


  public get srcDirectory(): string {
    if (this._srcDirectory) {
      return this._srcDirectory;
    }

    const srcPath = Project.getFirstPathFor('src', 'directory', true);

    this._srcDirectory = srcPath ?? cwd();

    return this._srcDirectory;
  }


  // ----
  // Utilities
  // ----

  /**
   * Find a file by name, walking backward from the current directory to the filesystem root.
   *
   * @param name The file name to look for
   * @return Its absolute path, or null when no directory on the way up holds it
   */
  public findFile(name: string): string | null {
    return Project.getFirstPathFor(name, 'file');
  }


  // ----
  // Package Json Fields
  // ----

  private _packageJson: PackageJson | undefined;

  public get packageJson(): PackageJson {
    /** If package json has already been loaded, return it */
    if (this._packageJson) {
      return this._packageJson;
    }

    /** Get the package json path */
    const packageJsonPath = Project.getFirstPathFor('package.json', 'file');

    if (!packageJsonPath) {
      throw new Error(
        'Could not find a valid package.json in this project. '
        + 'You must initialize one package.json file before continue.'
      );
    }

    this._packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as PackageJson;

    return this._packageJson;
  }


  /**
   * Check whether a package is available to the code this project compiles.
   *
   * Used to decide what a generated file may reference: a template that imports a package the
   * project cannot resolve produces code that does not compile, and the scaffolders have no
   * business installing anything on the user's behalf.
   *
   * **This is deliberately not a lookup in the nearest package.json.** Inside a monorepo a
   * workspace routinely uses a package hoisted from the root manifest without declaring it
   * itself — real case: `zod` is declared by the root of Yard4.Web and used from
   * `packages/yard-models`, which never mentions it. Reading only the closest manifest answers
   * `false` there and silently drops a helper the project has been using all along.
   *
   * Resolution comes first because it is the question that actually matters, the same reason
   * `TemplateCompiler` resolves ESLint through `createRequire` rather than probing a manifest.
   * The manifest walk is the fallback for the two cases resolution cannot answer: dependencies
   * declared but not installed yet, and linkers whose resolution a plain `createRequire` does
   * not see.
   *
   * @param name The package name to look for
   */
  public canResolveDependency(name: string): boolean {
    /** Ask the project itself whether the package resolves from its root */
    try {
      createRequire(resolve(this.rootDirectory, 'package.json')).resolve(name);
      return true;
    }
    catch {
      /** Not resolvable from here: fall back to what the manifests declare */
    }

    /** Any manifest between the current directory and the filesystem root counts */
    return Project.getManifestPaths().some((manifestPath) => {
      try {
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as PackageJson;
        const pool = { ...manifest.dependencies, ...manifest.devDependencies };

        return typeof pool[name] === 'string';
      }
      catch {
        /** An unreadable or malformed manifest simply does not declare anything */
        return false;
      }
    });
  }


  // ----
  // Prompts
  // ----

  /** The file holding the answers remembered between runs */
  private get _settingsPath(): string {
    return resolve(this.rootDirectory, '.proedis.yml');
  }


  /** Read the remembered answers, tolerating a missing or malformed file */
  private readSettings(): Record<string, any> {
    try {
      const content = existsSync(this._settingsPath)
        ? readFileSync(this._settingsPath, 'utf-8')
        : null;

      return content ? yaml.parse(content) ?? {} : {};
    }
    catch {
      /** A settings file nobody can parse is the same as no settings file */
      return {};
    }
  }


  /**
   * The settings remembered under a key, whatever put them there.
   *
   * Answers are one source, a hand written file is the other: a project that generates into
   * somewhere other than the defaults says so here, and nothing prompts for it.
   *
   * @param promptName The key the settings live under
   */
  public getSettings(promptName: string): Record<string, any> {
    return this.readSettings()[promptName] ?? {};
  }


  /**
   * Ask a set of questions, defaulting each one to the answer remembered from the last run.
   *
   * Answers are **not** written back here: persisting them is `persistPromptAnswers`, which the
   * caller invokes once the configuration has proven to work. Writing on the way in remembered
   * a host that had just failed, and offered it again as the default on the next run.
   *
   * @param promptName The key the answers are remembered under
   * @param questions The questions to ask
   * @param presets Answers already known, which skip their question entirely
   */
  public async getPromptWithCachedDefaults<T extends inquirer.Answers>(
    promptName: string,
    questions: Array<inquirer.DistinctQuestion<T>>,
    presets?: Partial<T>
  ): Promise<T> {
    /** Extract the defaults from settings */
    const cachedAnswers = this.readSettings()[promptName] || {};

    /** Anything already provided is not worth asking about */
    const pendingQuestions = questions.filter((question) => (
      presets?.[question.name as keyof T] === undefined
    ));

    /** Every answer known upfront: there is nothing to prompt */
    if (!pendingQuestions.length) {
      return { ...presets } as T;
    }

    /** Create the inquirer prompt */
    const prompt = inquirer.createPromptModule();

    /** Get the answers */
    const answers = await prompt<T>(
      pendingQuestions.map((q) => ({
        ...q,
        default: cachedAnswers[q.name] || q.default
      }))
    );

    return { ...presets, ...answers } as T;
  }


  /**
   * Remember a set of answers for the next run.
   *
   * @param promptName The key the answers are remembered under
   * @param answers The answers to persist
   */
  public persistPromptAnswers(promptName: string, answers: Record<string, any>): void {
    const settings = this.readSettings();

    /**
     * Merge, never replace.
     *
     * The same section holds what was asked and what was written by hand — where the generated
     * code belongs, for one — and replacing it wholesale erased the second the first time the
     * first succeeded.
     */
    settings[promptName] = { ...settings[promptName], ...answers };

    writeFileSync(this._settingsPath, yaml.stringify(settings), 'utf-8');
  }

}
