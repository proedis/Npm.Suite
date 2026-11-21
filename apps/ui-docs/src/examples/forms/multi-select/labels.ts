import type { MultiSelectLabels } from '@proedis/ui/forms/multi-select';


/** Every text a MultiSelect shows of its own, the ones with a count written as functions */
const labels: MultiSelectLabels = {
  search   : 'Search',
  noResults: 'Nothing matches',
  selectAll: 'Select all',
  clear    : 'Clear',
  remove   : (label) => `Remove ${label}`,
  more     : (count) => `${count} more`,
  moreRest : (count) => `and ${count} more`
};

export default labels;
