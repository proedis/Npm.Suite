import console from 'node:console';
import { relative } from 'node:path';
import process, { cwd } from 'node:process';

import chalk from 'chalk';

import type { Class } from 'type-fest';

import { EnumScaffolder, ModelsScaffolder } from '../lib';
import type { AbstractedScaffolder, LintOutcome, ScaffolderOptions, WritePlanInspection, WriteStats } from '../lib';

import { AbstractAction } from './lib';
import type { ActionInputs } from './lib';

import { spinnerFeedbackFunction } from '../ui';


/* --------
 * Internal Types
 * -------- */
export interface ScaffoldActionInput {
  /** Report what a run would change and write nothing */
  check?: boolean;

  /** The element to scaffold */
  element: 'enums' | 'models';

  /** The endpoint serving the definition, which skips its prompt */
  endpoint?: string;

  /** The host serving the definition, which skips its prompt */
  host?: string;

  /** Where to save the downloaded definition */
  saveSpec?: string;

  /** A definition on disk to generate from, instead of downloading one */
  spec?: string;

  /** Answer every optional prompt affirmatively */
  yes?: boolean;
}


/* --------
 * Action Definition
 * -------- */
export class ScaffoldAction extends AbstractAction<ScaffoldActionInput> {

  constructor() {
    super('scaffold');
  }


  // ----
  // Public Handlers
  // ----
  public handle(inputs: ActionInputs<ScaffoldActionInput>): Promise<void> {
    /** Carry down what the command line already answered */
    const options: ScaffolderOptions = {
      autoConfirm: !!inputs.getOption('yes'),
      check      : !!inputs.getOption('check'),
      endpoint   : inputs.getOption('endpoint'),
      host       : inputs.getOption('host'),
      saveSpec   : inputs.getOption('saveSpec'),
      spec       : inputs.getOption('spec')
    };

    /** Use switch case to use the right scaffold */
    switch (inputs.getOption('element')) {
      case 'enums':
        return this.scaffoldElement(EnumScaffolder, options);

      case 'models':
        return this.scaffoldElement(ModelsScaffolder, options);

      default:
        throw new Error(`Invalid Scaffold found ${inputs.getOption('element')}`);
    }
  }


  // ----
  // Internal Handlers
  // ----
  private async scaffoldElement<S extends AbstractedScaffolder>(
    Scaffolder: Class<S>,
    options: ScaffolderOptions
  ): Promise<void> {
    const scaffolder = new Scaffolder(this.project, this.compiler, options);

    /** A check renders the same output and reports on it, without writing or linting anything */
    if (options.check) {
      ScaffoldAction.reportCheck(await scaffolder.check());
      return;
    }

    /**
     * Render everything, then write everything.
     *
     * A failure while rendering leaves the project untouched: the plan is what reaches the
     * disk, and it only does so once it is complete.
     */
    const { stats, written } = await scaffolder.scaffold();

    /** Only files that actually reached the disk are worth handing to ESLint */
    const generatedFiles = written
      .filter((file) => file.action !== 'preserved')
      .map((file) => file.path);

    /**
     * Fix the generated files.
     *
     * The spinner now fails when the fix fails: it used to succeed and then print the reason
     * underneath, which reads as a fix that has been applied. The outcome is kept outside the
     * closure so the summary can report it either way — a held box rather than a plain
     * variable, so its type survives the assignment happening inside a callback.
     */
    const lintState: { outcome: LintOutcome | null } = { outcome: null };

    await spinnerFeedbackFunction<void>(
      'Fixing generated files...',
      async (resolveLint, reject) => {
        const outcome = await this.compiler.lintAndFixFiles(generatedFiles);
        lintState.outcome = outcome;

        if (outcome.skipped) {
          reject(`generated files were not fixed, ${outcome.skipped}`);
          return;
        }

        if (outcome.problems.length) {
          reject('ESLint could not parse the generated files');
          return;
        }

        resolveLint(
          undefined,
          `Fixed ${outcome.fixed} of ${outcome.linted} generated file${outcome.linted === 1 ? '' : 's'}`
        );
      }
    ).catch(() => {
      /**
       * A project whose ESLint cannot run must not fail the scaffold: the files are on disk and
       * are correct, only unformatted. The spinner has already worded the reason.
       */
    });

    ScaffoldAction.printSummary(stats, lintState.outcome);
  }


  /**
   * Report an inspection and set the exit code, so a pipeline can rely on it.
   *
   * The failure names the files that are behind: a check that only said 'out of date' would
   * leave whoever reads the log to diff the whole output by hand.
   *
   * @param inspection What committing the plan would have done
   */
  private static reportCheck(inspection: WritePlanInspection): void {
    const { stats, written, stale, isUpToDate } = inspection;

    if (isUpToDate) {
      console.info(chalk.green(`Generated code is up to date: ${stats.unchanged} files match the definition`));
      return;
    }

    console.info(chalk.red('Generated code does not match the definition.'));
    console.info();

    written
      .filter((file) => file.action === 'created' || file.action === 'updated')
      .forEach((file) => console.info(
        chalk.yellow(`  ${file.action === 'created' ? 'missing' : 'stale '} ${relative(cwd(), file.path)}`)
      ));

    stale.forEach((path) => console.info(chalk.yellow(`  orphan ${relative(cwd(), path)}`)));

    console.info();
    console.info(`Run the same command without ${chalk.bold('--check')} to bring it back in line.`);

    process.exitCode = 1;
  }


  /**
   * Print what the run actually did.
   *
   * Without it the only trace of a run is the list of paths scrolling by, which says nothing
   * about how many files were left untouched or whether the fix ever ran.
   *
   * @param stats The counters accumulated while writing
   * @param lintOutcome What the ESLint pass did, or null when it could not run
   */
  private static printSummary(stats: WriteStats, lintOutcome: LintOutcome | null): void {
    console.info();
    console.info(chalk.bold('Scaffold complete.'));

    console.info(`  ${chalk.green(`${stats.created} created`)}, `
      + `${chalk.yellow(`${stats.updated} updated`)}, `
      + `${chalk.gray(`${stats.unchanged} unchanged`)}, `
      + `${chalk.cyan(`${stats.preserved} kept`)}`);

    if (lintOutcome && !lintOutcome.skipped && !lintOutcome.problems.length) {
      console.info(`  ${lintOutcome.fixed} file${lintOutcome.fixed === 1 ? '' : 's'} fixed by ESLint`);
    }
    else {
      console.info(chalk.yellow('  the files are written but not formatted, ESLint could not run'));

      /** ESLint names what is wrong with the project setup better than any hint hardcoded here */
      lintOutcome?.problems.forEach((problem) => console.info(chalk.yellow(`    ${problem}`)));
    }

    console.info();
  }

}
