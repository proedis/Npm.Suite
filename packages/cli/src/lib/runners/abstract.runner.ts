import console from 'node:console';
import { cwd as currentWorkingDirectory } from 'node:process';

import chalk from 'chalk';
import type ora from 'ora';

import { spawn } from 'child_process';
import type { ChildProcess, SpawnOptions } from 'child_process';


export abstract class AbstractRunner {

  constructor(
    protected readonly binary: string,
    protected readonly args: string[] = []
  ) {
  }


  public async run(command: string, collect?: false, spinner?: ora.Ora, cwd?: string): Promise<null>;
  public async run(command: string, collect?: true, spinner?: ora.Ora, cwd?: string): Promise<string>;
  public async run(
    command: string,
    collect = false,
    spinner?: ora.Ora,
    cwd: string = currentWorkingDirectory()
  ): Promise<string | null> {
    /** Create the args array to send to binary */
    const args: string[] = [ command ];

    /** Create the options */
    const options: SpawnOptions = {
      cwd,
      stdio: collect ? 'pipe' : 'inherit',
      shell: true
    };

    /** Return the promise used to run the requested command */
    return new Promise<string | null>((resolve, reject) => {
      /** Spawn the child process and attach to events */
      const child: ChildProcess = spawn(this.binary, [ ...this.args, ...args ], options);
      const allData: string[] = [];

      /** If data collect has been enabled, attach to data event to resolve the promise with result */
      if (collect) {
        child.stdout!.on('data', (data) => {
          if (data && typeof data.toString === 'function') {
            const dataLine = data.toString();
            allData.push(dataLine);

            if (spinner) {
              spinner.text = dataLine;
            }
          }
        });
      }

      /** Attach to the close event to resolve/reject the promise */
      child.on('close', (code) => {
        /** Resolve dependent of code */
        if (code === 0) {
          resolve(collect ? allData.join('\n') : null);
        }
        else {
          console.info(
            chalk.red(`\nFailed to execute command ${this.binary} ${command}`)
          );
          reject();
        }
      });

      /** Attach to the error event to reject the run method */
      child.on('error', (error) => {
        console.info(
          chalk.red(`An error occurred while performing operation: ${error.message}`),
          error
        );
        reject(error);
      });
    });
  }


  public rawFullCommand(command: string): string {
    const commandArgs: string[] = [ ...this.args, command ];
    return `${this.binary} ${commandArgs.join(' ')}`;
  }

}
