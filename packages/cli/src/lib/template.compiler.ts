import console from 'node:console';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { cwd } from 'node:process';

import chalk from 'chalk';

import * as ejs from 'ejs';
import * as prettier from 'prettier';


/* --------
 * Internal Types
 * -------- */
interface CompileOptions {
  /** A model passed down to compiler */
  model?: any;

  /** Override default prettier options */
  prettierOptions?: Exclude<prettier.Options, 'parser'>;

  /** Print the disclaimer on top of produced output */
  printDisclaimer?: boolean;

  /** Set the type of the file, use this option to enable prettier */
  type?: prettier.BuiltInParserName;

  /** Optionally override the root path */
  root?: string;
}


/* --------
 * Template Compiler Definition
 * -------- */
export class TemplateCompiler {

  /**
   * Default prettier options used to format file
   * when saved to destination location
   * @private
   */
  private static readonly _defaultPrettierOptions: prettier.Options = {
    /** Use semicolons at the ends of statements */
    semi: true,
    /** Always use single quote instead of double quotes */
    singleQuote: true,
    /** Never use trailing commas */
    trailingComma: 'none',
    /** Print a space between objects brackets */
    bracketSpacing: true,
    /** Multi line element > position */
    bracketSameLine: false,
    /** Include parentheses around a sole arrow function parameter. */
    arrowParens: 'always',
    /** Set the max width of files */
    printWidth: 120,
    /** Specify tab width */
    tabWidth: 2,
    /** Disable the usage of tabs */
    useTabs: false
  };


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
  private static getDisclaimer(): string {
    return [
      '/* --------',
      ' * AutoGenerated File',
      ' * --',
      ...this._disclaimerText.map((line) => ` * ${line}`),
      ' * --',
      ` * Updated at ${new Date()}`,
      ' * -------- */'
    ].join('\n');
  }


  /**
   * Initialize a new TemplateCompiler setting the root
   * of the project to resolve files relative
   * @param root
   */
  constructor(
    private readonly root: string
  ) {

  }


  public async compile(file: string, options?: CompileOptions): Promise<string> {
    /** Extract options */
    const {
      model,
      prettierOptions,
      printDisclaimer,
      type,
      root
    } = options || {};

    /** Build the template path */
    const path = resolve(root || this.root, file);

    /** Load the template resolving the path */
    if (!existsSync(path)) {
      throw new Error(`Invalid template ${file} in ${root || this.root} folder`);
    }

    const template = readFileSync(path, 'utf-8');
    const renderedTemplate = ejs.render(template, model);

    /** Beautify using prettier if defined */
    const fileContent = typeof type === 'string'
      ? await prettier.format(renderedTemplate, {
        ...TemplateCompiler._defaultPrettierOptions,
        ...prettierOptions,
        parser: type
      })
      : renderedTemplate;

    /** Produce the file content */
    return [
      printDisclaimer && `${TemplateCompiler.getDisclaimer()}\n\n`,
      fileContent
    ].filter(Boolean).join('').replace(/(\n)+$/, '\n');
  }


  public async save(path: string, file: string, options?: CompileOptions): Promise<void> {
    /** Get the file rendered */
    const fileContent = await this.compile(file, options);

    /** Save the file into desired path */
    writeFileSync(path, fileContent, 'utf-8');

    console.log(
      chalk.green(`  [A] ${relative(cwd(), path)}`)
    );
  }

}
