/* --------
 * Internal Types
 * -------- */
type FormatterFactory<P, I, R> =
  & ((value: P, config?: I) => R)
  & { create(override?: I): FormatterFactory<P, I, R> };


/* --------
 * Main Function
 * -------- */

/** Create a formatter using default configuration */
export function instantiateFormatter<T extends (value: P, initialConfig?: I) => any, P extends any, I extends {}>(
  fn: T, parentConfiguration?: I
) {

  /**
   * Return the function to create a
   * new formatter using a local configuration
   */
  return function createFormatter(initialConfig?: I): FormatterFactory<P, I, ReturnType<T>> {

    /**
     * Merge configuration from parent.
     * This is necessary to let an
     * instantiated formatter create
     * a child instance
     */
    const instanceConfig = {
      ...parentConfiguration,
      ...initialConfig
    } as I;

    function useFormatter(value: P, overrideConfig?: I): ReturnType<T> {
      /** Build local configuration */
      const localConfig = {
        ...instanceConfig,
        ...overrideConfig
      };
      /** Return the invoked formatter function */
      return fn(value, localConfig);
    }

    /** Set the create method */
    useFormatter.create = instantiateFormatter<T, P, I>(fn, instanceConfig);

    return useFormatter;

  };
}
