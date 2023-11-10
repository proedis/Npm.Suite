import * as inquirer from 'inquirer';


/**
 * Ask user to confirm requested question
 * @param question Question message
 * @param defaultAnswer Default question answer
 */
export async function askForConfirmation(question: string, defaultAnswer: boolean = true): Promise<boolean> {
  const prompt = inquirer.createPromptModule();
  const answer = await prompt<{ response: boolean }>([
    {
      type   : 'confirm',
      name   : 'response',
      message: question,
      default: !!defaultAnswer
    }
  ]);
  return answer.response;
}
