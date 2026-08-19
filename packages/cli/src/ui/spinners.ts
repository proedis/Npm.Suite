import ora from 'ora';


type ResolveFunction<T> = (data: T, successMessage?: string) => void;

type RejectFunction = (failMessage?: string) => void;


/**
 * An error whose message has already been shown to the user.
 *
 * The spinner prints the reason as it fails, so printing the same message again at the top
 * level says it twice. The entry point checks for this to stay quiet and only set the exit
 * code — the message is still on the error for anything that needs it.
 */
export class ReportedError extends Error {

  public readonly reported: boolean = true;

}


/**
 * Run an action behind a spinner, resolving with whatever the action produced.
 *
 * The action is handed a `resolve` that also accepts the message to print on success, and a
 * `reject` that accepts the message to print on failure.
 *
 * This used to be written as `new Promise(async (resolve) => …)`, which cannot report a
 * failure: the executor's own rejection is discarded by the Promise constructor, so the
 * returned promise never settled and the error surfaced as an unhandled rejection — killing
 * the process with an internal stack trace instead of the message the caller had prepared.
 * Every failing path of both scaffolders went through that hole.
 *
 * @param message The text shown while the action runs
 * @param action The action to perform
 * @param silent Suppress the spinner entirely, for nested steps that have their own feedback
 */
export async function spinnerFeedbackFunction<T>(
  message: string,
  action: (resolve: ResolveFunction<T>, reject: RejectFunction) => Promise<void>,
  silent?: boolean
): Promise<T> {
  /** Create the spinner to provide user feedback */
  const feedbackSpinner = !silent ? ora(message).start() : undefined;

  try {
    const { data, successMessage } = await new Promise<{ data: T, successMessage?: string }>((resolve, reject) => {
      /** Adapt the caller facing resolve, which carries its own success message */
      const innerResolve: ResolveFunction<T> = (result, resultMessage) => (
        resolve({ data: result, successMessage: resultMessage })
      );

      /**
       * An action that throws, or whose promise rejects, must fail the whole thing: it is the
       * single reason this wrapper exists in the first place.
       */
      action(innerResolve, reject).catch(reject);
    });

    feedbackSpinner?.succeed(successMessage);

    return data;
  }
  catch (failure) {
    const reason = typeof failure === 'string' ? failure
      : failure instanceof Error ? failure.message
        : `Error while performing action '${message}'`;

    /** Mark the spinner as failed, which is where the user reads the reason */
    feedbackSpinner?.fail(reason);

    /** Already shown when a spinner carried it: the entry point must not repeat it */
    throw feedbackSpinner ? new ReportedError(reason) : new Error(reason);
  }
}
