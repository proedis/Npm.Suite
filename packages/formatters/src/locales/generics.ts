export type Locale = 'it' | 'en';

export type LocaleTransformer = ((value: number) => string);

export type LocaleDictionary<TKeys extends string> = Record<TKeys, LocaleTransformer>;

export type LocaleDictionaries<TDictionary extends LocaleDictionary<string>> = Record<Locale, TDictionary>;


export function extractLocaleDictionary<TReturn extends LocaleDictionary<string>>(
  dictionaries: LocaleDictionaries<TReturn>
): (locale: Locale) => TReturn {

  return function getDictionary(locale) {
    /** Try to get the dictionary from the collection */
    let dictionary = dictionaries[locale];

    /** Assert it exists */
    if (!dictionary) {
      global.console.warn(
        `You're trying to use an invalid locale: '${locale}' is not recognized. Falling back to 'en'`
      );

      dictionary = dictionaries.en;
    }

    /** Return the found dictionary */
    return dictionary;
  };

}
