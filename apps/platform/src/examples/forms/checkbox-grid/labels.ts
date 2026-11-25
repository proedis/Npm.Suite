import type { CheckboxGridLabels } from '@proedis/ui/forms/checkbox-grid';


/** Every text of service of the grid: the package writes none, and most of them carry a count */
const labels: CheckboxGridLabels = {
  itemsHeader  : 'Area and entity',
  allItems     : 'Whole area',
  groupMeta    : ({ selected, total }) => `${selected} of ${total} entities with permissions`,
  groupGrid    : ({ group }) => `Permissions of the area ${group.label as string}`,
  modified     : 'modified',
  changed      : 'modified',
  mixed        : ({ checked, column, total }) => `${column.label as string} granted to ${checked} of ${total} editable entities`,
  bulk         : ({ checked, column, count, group }) => (
    `${column.label as string} ${checked ? 'granted to' : 'taken from'} ${count} entities of ${group.label as string}`
  ),
  toggled      : ({ alsoChecked, checked, column, item }) => (
    `${[ column, ...alsoChecked ].map((one) => one.label as string).join(' and ')} ${checked ? 'granted to' : 'taken from'} ${item.label as string}`
  ),
  locked       : 'Always granted, not editable',
  readOnlyValue: (_item, checked) => (checked.length ? checked.map((column) => column.label as string).join(', ') : 'No permission')
};

export default labels;
