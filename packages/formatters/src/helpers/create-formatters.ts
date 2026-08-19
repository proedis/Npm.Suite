/* --------
 * Exported Types
 * -------- */

/**
 * A formatter that carries its own defaults and can spawn further ones.
 *
 * Calling it formats a value; passing a second argument overrides the defaults for that call only;
 * calling `create` derives a new formatter whose defaults are these plus the ones just given.
 */
export type FormatterFactory<TValue, TConfiguration, TResult> =
  & ((value: TValue, config?: TConfiguration) => TResult)
  & { create(override?: TConfiguration): FormatterFactory<TValue, TConfiguration, TResult> };


/* --------
 * Main Function
 * -------- */

/**
 * Turn a plain `(value, config)` formatter into one that can be preconfigured.
 *
 * This is what every `formatX.create` in the package is built from. Configuration is layered by
 * shallow spread at three points — the defaults captured by the parent, the ones given to `create`,
 * and the ones passed to a single call — with the later always winning.
 *
 * ⚠️ The layering is **shallow**, one level deep. That is deliberate: every configuration object in
 * this package is flat, and a deep merge would mean pulling in a merge implementation and a decision
 * about how arrays combine, for no gain. A nested object in a configuration replaces its counterpart
 * rather than merging with it.
 *
 * @param fn The formatter to wrap
 * @param parentConfiguration Defaults inherited from the formatter this one was derived from
 * @returns A factory producing preconfigured formatters
 *
 * @example
 * function formatTag(value: string, config?: { upper?: boolean }): string {
 *   return config?.upper ? value.toUpperCase() : value;
 * }
 *
 * formatTag.create = instantiateFormatter<typeof formatTag, string, { upper?: boolean }>(formatTag);
 *
 * const shout = formatTag.create({ upper: true });
 * shout('hello');                    // 'HELLO'
 * shout('hello', { upper: false });  // 'hello'
 */
export function instantiateFormatter<T extends (value: P, initialConfig?: I) => any, P, I extends {}>(
  fn: T,
  parentConfiguration?: I
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
