import type { ComboboxLabels } from '@proedis/ui/forms/combobox';


/** Every text a single Combobox shows of its own: the messages of a search are functions of what was typed */
const labels: ComboboxLabels = {
  placeholder: 'E.g. Rossi or UT-004812',
  minChars   : 'Type at least 2 characters: code, holder or address',
  searching  : 'Searching…',
  results    : (count) => `${count} contract${count === 1 ? '' : 's'} found`,
  noResults  : (text) => `No contract for “${text}”`,
  tooMany    : (count) => `First ${count} shown: type more to narrow the search`,
  error      : 'Search failed',
  retry      : 'Retry',
  clear      : 'Clear',
  clearSearch: 'Clear the search',
  current    : (label) => `Current value: ${label}`
};

export default labels;
