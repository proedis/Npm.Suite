import console from 'node:console';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, resolve, relative, sep as pathSeparator } from 'node:path';
import { cwd } from 'node:process';

import chalk from 'chalk';
import ora from 'ora';

import * as ejs from 'ejs';

import { globSync } from 'glob';

import { ESLint } from 'eslint';

import type { Project } from './project';

import { askForConfirmation } from '../ui';


/* --------
 * Internal Types
 * -------- */
interface CompileOptions {
  /** A model passed down to compiler */
  model?: any;

  /** Disallow linting for the file */
  noLint?: boolean;

  /** Disable overriding file */
  noOverride?: boolean | ((fileName: string, path: string) => boolean);

  /** Print the disclaimer on top of produced output */
  printDisclaimer?: boolean;

  /** Rename the template when saving compiled file */
  rename?: string;
}

export type SavedFile = string | null;


/* --------
 * Internal Constant
 * -------- */
const FIXABLE_EXTENSIONS: string[] = [ '.js', '.jsx', '.ts', '.tsx' ];


/* --------
 * Template Compiler Definition
 * -------- */
export class TemplateCompiler {

  /**
   * The template suffix to use while searching for templates
   * @private
   */
  private static readonly _templateSuffix: string = '.template.ejs';


  /**
   * Default disclaimer text to print above each compiled documents
   * @private
   */
  private static readonly _disclaimerText: string[] = [
    'This file is autogenerated by Proedis TemplatesCompiler utility.',
    'Does not modify this file as it could be overwritten'
  ];


  /**
   * A function that will return the disclaimer text, formatted
   * based on output document type
   * @private
   */
  public static getDisclaimer(): string {
    return [
      '/* --------',
      ' * AutoGenerated File',
      ' * --',
      ...this._disclaimerText.map((line) => ` * ${line}`),
      ' * -------- */'
    ].join('\n');
  }


  /**
   * Default compiler options to use while
   * saving templates
   * @private
   */
  private _defaultCompilerOptions: Partial<CompileOptions> = {};


  /**
   * Initialize a new TemplateCompiler setting the root
   * of the project to resolve files relative
   * @param root
   * @param project
   */
  constructor(
    private readonly root: string,
    private readonly project: Project
  ) {

  }


  /**
   * Update the defaults compiler options for this instance
   * @param defaults
   */
  public defaults(defaults: Partial<CompileOptions>): this {
    this._defaultCompilerOptions = defaults;
    return this;
  }


  /**
   * Change the root path of the TemplateCompiler.
   * The path will be resolved starting from defined root.
   * This method will return a new TemplateCompiler
   * @param paths
   */
  public forPath(...paths: string[]): TemplateCompiler {
    return new TemplateCompiler(resolve(this.root, ...paths), this.project);
  }


  /**
   * Completely set a new Root for the TemplateCompiler
   * @param root
   */
  public forRoot(root: string): TemplateCompiler {
    return new TemplateCompiler(root, this.project);
  }


  /**
   * Use the template suffix to build template name
   * for desired name
   * @param name
   */
  public getTemplateName(name: string): string {
    return `${name}${TemplateCompiler._templateSuffix}`;
  }


  /**
   * Get a template file in current root
   * @param name The template name, without the suffix
   */
  public getTemplate(name: string): string {
    const templateName = this.getTemplateName(name);
    const templatePath = resolve(this.root, templateName);

    if (!existsSync(templatePath)) {
      throw new Error(`No template named ${templateName} has been found in ${this.root} folder`);
    }

    return readFileSync(templatePath, 'utf-8');
  }


  /**
   * Return all templates in all directories
   */
  public getAllTemplates(): string[] {
    /** Search for all template files */
    return globSync(`**/*${TemplateCompiler._templateSuffix}`, {
      cwd          : this.root,
      dot          : true,
      nodir        : true,
      withFileTypes: false
    }).filter((t) => !basename(t).startsWith('_'));
  }


  /**
   * Compile a template file
   * @param name
   * @param options
   */
  public async compile(name: string, options?: CompileOptions): Promise<string> {
    /** Extract options */
    const {
      model,
      printDisclaimer
    } = {
      ...this._defaultCompilerOptions,
      ...options
    };

    /** Get the template from current root directory */
    const template = this.getTemplate(name);

    /** Render the template */
    return [
      printDisclaimer && `${TemplateCompiler.getDisclaimer()}\n\n`,
      ejs.render(template, model)
    ]
      .filter(Boolean)
      .join('')
      .replace(/(^\n)|(\n$)/gi, '');
  }


  /**
   * Compile a template by name and save into desired path
   * @param name
   * @param path
   * @param _options
   */
  public async save(name: string, path: string, _options?: CompileOptions): Promise<SavedFile> {
    const options = {
      ...this._defaultCompilerOptions,
      ..._options
    };

    /** Get the file content compiling the requested template */
    const file = await this.compile(name, options);

    /** Set the file output name */
    const outputFilename = ejs.render(options.rename || name, options.model);
    const outputPath = resolve(path, outputFilename);

    /** Check if a file already exists with same name */
    const fileExists = existsSync(outputPath);

    const saveFile = fileExists
      ? await askForConfirmation(`${name} already exists in output path. Do you want to override it?`)
      : true;

    /** Abort if saving is not requested */
    if (!saveFile) {
      return null;
    }

    const savedFilePath = this.writeFile(outputPath, file, fileExists, options.noOverride);

    /** Lint and fix all files, if not omitted */
    if (!options?.noLint) {
      await this.lintAndFixFiles([ savedFilePath ]);
    }

    /** Return the path of the saved file */
    return savedFilePath;
  }


  /**
   * Compile all templates and save preserving directory structure
   * @param root
   * @param _options
   * @param silent
   */
  public async saveAll(
    root: string,
    _options?: Exclude<CompileOptions, 'rename'>,
    silent?: boolean
  ): Promise<SavedFile[]> {
    const templates = this.getAllTemplates();

    if (!templates.length) {
      return [];
    }

    const options = {
      ...this._defaultCompilerOptions,
      ..._options
    };

    const templatesDescriptor = templates.map((template) => {
      const templateName = basename(template, TemplateCompiler._templateSuffix);
      const templatePath = dirname(template).replace(/^\./, '');

      return {
        name: templateName,
        path: templatePath ? templatePath.split(pathSeparator) : null
      };
    });

    if (!silent) {
      ora('Generating files...').succeed();
    }

    const templatesPromises = templatesDescriptor.map((descriptor) => (
      new Promise<SavedFile>(async (resolveTemplate) => {
        /** Create or use the current compiler */
        const compiler = descriptor.path ? this.forPath(...descriptor.path) : this;
        /** Compile the file */
        const file = await compiler.compile(descriptor.name, options);
        /** Create the output name */
        const outputName = ejs.render(descriptor.name, options.model);
        /** Create the output path */
        const outputPath = resolve(root, ...(descriptor.path || []), outputName);
        /** Write the file */
        return resolveTemplate(this.writeFile(outputPath, file, undefined, options.noOverride));
      })
    ));

    const savedFiles = await Promise.all(templatesPromises);

    if (!options?.noLint) {
      await this.lintAndFixFiles(savedFiles);
    }

    return savedFiles.filter(Boolean);
  }


  /**
   * Write the file
   * @param path
   * @param file
   * @param modified
   * @param noOverride
   * @private
   */
  public writeFile(
    path: string,
    file: string,
    modified?: boolean,
    noOverride?: CompileOptions['noOverride']
  ): SavedFile {
    /** Template will be saved only if contains at least one char */
    if (!/[A-Za-z]/.test(file)) {
      return null;
    }

    /** Assert the parent folder exists */
    const parent = dirname(path);
    if (!existsSync(parent)) {
      mkdirSync(parent, { recursive: true });
    }

    /** Check if file is modified or not */
    const isFileModified = modified ?? existsSync(path);

    /** Check if file must be overridden */
    const fileName = basename(path);
    const avoidOverriding = typeof noOverride === 'function' ? noOverride(fileName, path) : noOverride;
    if (isFileModified && avoidOverriding) {
      console.info(
        chalk.yellow(
          `File ${path} already exists and won\'t be overridden`
        )
      );

      return null;
    }

    /** Write the file and show feedback to user */
    writeFileSync(path, file, 'utf-8');
    console.info(
      isFileModified
        ? chalk.yellow(`  M ${relative(cwd(), path)}`)
        : chalk.green(`  A ${relative(cwd(), path)}`)
    );

    return path;
  }


  public async lintAndFixFiles(paths: SavedFile[]) {
    /** Filter keeping only valid paths */
    const fixablePaths = paths.filter((path) => (
      typeof path === 'string' && FIXABLE_EXTENSIONS.includes(extname(path)))
    ) as string[];

    /** Assert at least one file exist */
    if (!fixablePaths.length) {
      return;
    }

    /** Check if necessary dependencies to use eslint have been installed */
    const manager = await this.project.manager();
    if (!manager.areDependenciesInstalled(
      { name: 'eslint', global: true },
      { name: 'eslint-config-proedis', global: true }
    )) {
      console.info(
        chalk.yellow(
          'To enable instant fix for template files, the eslint and eslint-config-proedis packages must be installed'
        )
      );
      return;
    }

    /** Check if a valid .eslintrc file exists */
    if (
      !this.project.couldResolveFile('eslint.config.js')
      && !this.project.couldResolveFile('.eslintrc.js')
      && !this.project.couldResolveFile('.eslintrc.cjs')
    ) {
      console.info(
        chalk.yellow(
          'To enable instant fix for template files, a valid configuration file for ESLint must exists'
        )
      );
      return;
    }

    /** Check if the tsconfig json file exists */
    if (!this.project.couldResolveFile('tsconfig.eslint.json')) {
      console.info(
        chalk.yellow(
          'To enable instant fix for template files, the tsconfig.eslint.json file must exist in project root directory'
        )
      );
      return;
    }

    /** Create the new eslint instance */
    const eslint = new ESLint({
      useEslintrc: true,
      cwd        : this.project.rootDirectory,
      fix        : true
    });

    /** Lint all files */
    const results = await eslint.lintFiles(fixablePaths);

    /** Produce the fixing */
    await ESLint.outputFixes(results);
  }

}
