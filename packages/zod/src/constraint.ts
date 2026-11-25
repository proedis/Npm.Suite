/**
 * The key under which a validator of this package leaves, on the `def` of the schema it returns, the
 * schema its refinement builds: `nullableString(s => s.max(120))` keeps `z.string().max(120)` there.
 *
 * The refinement runs inside a `superRefine`, where no introspection can see it, and that is the only
 * way the bound becomes readable without measuring `null` against it. Shared by the two halves of the
 * package without either importing the other: `validators` writes it, `fields` reads it. A key of the
 * `def` because Zod copies the `def` when it clones a schema, so it survives `.describe()` and every
 * wrapper (measured on zod 4.4.3).
 */
export const CONSTRAINT_KEY = 'proedisConstraint';
