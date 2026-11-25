import type { SelectLabels } from '@proedis/ui/forms/select';


/** Every text a Select shows of its own: the package writes none, the application passes them once */
const labels: SelectLabels = {
  search   : 'Search',
  noResults: 'Nothing matches',
  clear    : 'Clear'
};

export default labels;
