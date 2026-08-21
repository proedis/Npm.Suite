/**
 * The computed properties of a model: for each one, the getter producing its value.
 *
 * Only what the model declares can be implemented, and with the declared type: the members come from
 * the model itself, so a name the type does not carry, or a getter answering with something else, is
 * a compile error rather than a property that quietly never works.
 */
export type ModelVirtuals<TModel extends object> = {
  [key in keyof TModel]?: (this: TModel) => TModel[key];
};


/**
 * Install computed properties on a model, as getters on its prototype.
 *
 * A virtual is a property that belongs to the model without being part of its payload: a display
 * name, a derived flag, a total. Declaring it on the model itself, instead of on a type extending
 * it, is what makes it reach every instance the transformer builds, the ones nested in a relation
 * included, with nothing to unwrap at the point of use.
 *
 * The declaration is separate from the implementation, and both are required. Merge an interface into
 * the model to declare what it gains, then call this to say how each value is produced:
 *
 * ```ts
 * declare module './AccountDto' {
 *   interface AccountDto {
 *     readonly displayName: string;
 *   }
 * }
 *
 * defineVirtuals(AccountDto, {
 *   displayName() {
 *     return [ this.lastName, this.firstName ].filter(Boolean).join(' ');
 *   }
 * });
 * ```
 *
 * Declare virtuals `readonly`. Beyond describing them truthfully, it is what turns a collision into
 * a compile error: the day the payload starts carrying a field of the same name, its own value
 * shadows the getter, and the virtual stops being applied with nothing to show for it. A `readonly`
 * declaration cannot merge with the writable field the payload brings, so the build stops instead.
 *
 * The getters are not enumerable, which is why a virtual is absent from `toObject`, from the
 * serialized payload and from the hash: a value computed on this side does not travel back.
 *
 * ⚠️ A module that only installs virtuals has to be **evaluated** to have any effect: imported for
 * its side effect where the models are, not left to be pulled in by whoever happens to need one.
 * Skipped, the type still promises the property and every instance answers `undefined`.
 *
 * @param model The model to install the virtuals on
 * @param virtuals The getter of each computed property, keyed by its name
 */
export function defineVirtuals<TModel extends object>(
  model: abstract new (...args: never[]) => TModel,
  virtuals: ModelVirtuals<TModel>
): void {
  for (const [ name, getter ] of Object.entries(virtuals)) {
    Object.defineProperty(model.prototype, name, {
      configurable: true,
      get         : getter as () => unknown
    });
  }
}
