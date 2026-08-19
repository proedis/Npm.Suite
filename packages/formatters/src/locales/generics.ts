/* --------
 * Locale Primitives
 * -------- */

/** The locales the formatters ship translations for */
export type Locale = 'it' | 'en';

/** A set of translations, one entry per supported locale */
export type LocaleDictionaries<TDictionary> = Record<Locale, TDictionary>;


/* --------
 * Resolution
 * -------- */

/**
 * Pick the translations for a locale, falling back to English.
 *
 * The fallback is silent, and deliberately so: `Locale` is a literal union, so an unknown value can
 * only reach here from untyped JavaScript, and a formatter called from a render path is the wrong
 * place to either throw or write to the console on every single call.
 *
 * @param dictionaries The available translations
 * @param locale The requested locale
 * @returns The translations for that locale, or the English ones
 */
export function resolveLocaleDictionary<TDictionary>(
  dictionaries: LocaleDictionaries<TDictionary>,
  locale: Locale
): TDictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
