import type { MultipleComboboxLabels } from '@proedis/ui/forms/combobox';


/** The multiple field has no x of its own: it asks for the texts of its chips and its footer instead */
const labels: MultipleComboboxLabels = {
  placeholder: 'E.g. Rossi or UT-004812',
  minChars   : 'Type at least 2 characters: code, holder or address',
  searching  : 'Searching…',
  results    : (count) => `${count} contract${count === 1 ? '' : 's'} found`,
  noResults  : (text) => `No contract for “${text}”`,
  tooMany    : (count) => `First ${count} shown: type more to narrow the search`,
  error      : 'Search failed',
  retry      : 'Retry',
  current    : (label) => `Current value: ${label}`,
  clearAll   : 'Clear all',
  remove     : (label) => `Remove ${label}`,
  more       : (count) => `${count} more`,
  moreRest   : (count) => `and ${count} more`
};

export default labels;
