import ora from 'ora';


type ResolveFunction<T> = (data: T, successMessage?: string) => void;

type RejectFunction = (failMessage?: string) => void;

export async function spinnerFeedbackFunction<T>(
  message: string,
  action: (resolve: ResolveFunction<T>, reject: RejectFunction) => Promise<void>,
  silent?: boolean
): Promise<T> {
  return new Promise<T>(async (resolve) => {
    /** Create the spinner to provide user feedback */
    const feedbackSpinner = !silent ? ora(message).start() : undefined;

    /** Create an internal promise to perform the action */
    await new Promise<{ data: T, successMessage?: string }>((_innerResolve, innerReject) => {
      /** Create the inner resolve function to pass to action */
      const innerResolve = (data: T, successMessage?: string) => (
        _innerResolve({ data, successMessage })
      );

      /** Execute the action with the custom resolve function */
      return action(innerResolve, innerReject);
    })
      .then(({ data, successMessage }) => {
        /** Change the feedback spinner to the success status */
        feedbackSpinner?.succeed(successMessage);
        /** Resolve the method with data returned by action */
        return resolve(data);
      })
      .catch((failMessage) => {
        /** Change the feedback spinner to the fail status */
        feedbackSpinner?.fail(typeof failMessage === 'string' ? failMessage : undefined);
        /** Throw the same error if is a valid Error instance */
        if (failMessage && failMessage instanceof Error) {
          throw failMessage;
        }
        /** Throw a new error to ensure process will stop */
        else {
          throw new Error(typeof failMessage === 'string' ? failMessage : `Error while performing action '${message}'`);
        }
      });
  });
}
