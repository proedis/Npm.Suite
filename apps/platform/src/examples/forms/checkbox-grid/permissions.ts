import type { CheckboxGridColumn, CheckboxGridGroup, CheckboxGridValue } from '@proedis/ui/forms/checkbox-grid';


/* --------
 * The permissions of a profile: areas, their entities, four rights
 * -------- */

export const COLUMNS: readonly CheckboxGridColumn[] = [
  { id: 'read', label: 'Read' },
  { id: 'create', label: 'Create' },
  { id: 'update', label: 'Update' },
  { id: 'delete', label: 'Delete' }
];

export const GROUPS: readonly CheckboxGridGroup[] = [
  {
    id   : 'fleet',
    label: 'Fleet',
    items: [
      { id: 'vehicles', label: 'Vehicles' },
      { id: 'drivers', label: 'Drivers' },
      { id: 'maintenance', label: 'Maintenance' },
      { id: 'fuel', label: 'Fuel cards' }
    ]
  },
  {
    id   : 'collection',
    label: 'Collection',
    items: [
      { id: 'rounds', label: 'Rounds' },
      { id: 'stops', label: 'Stops' },
      { id: 'weighings', label: 'Weighings' },
      /* The audit log is always readable: read is decided by the system, not here */
      { id: 'audit', label: 'Audit log', locked: [ 'read' ] }
    ]
  },
  {
    id   : 'billing',
    label: 'Billing',
    items: [
      { id: 'contracts', label: 'Contracts' },
      { id: 'invoices', label: 'Invoices' },
      { id: 'tariffs', label: 'Tariffs' }
    ]
  }
];

/** What the profile has on the server */
export const SAVED: CheckboxGridValue = {
  vehicles : [ 'read', 'update' ],
  drivers  : [ 'read' ],
  rounds   : [ 'read', 'create', 'update' ],
  stops    : [ 'read' ],
  audit    : [ 'read' ],
  contracts: [ 'read' ]
};

/**
 * The rule the grid does not know: creating, updating or deleting something needs reading it. A grant of
 * any of the three brings read with it, and taking read away takes the others too.
 */
export function grantReadWithOthers(next: CheckboxGridValue, previous: CheckboxGridValue): CheckboxGridValue {
  const resolved: Record<string, readonly string[]> = {};

  for (const [ item, columns ] of Object.entries(next)) {
    const before = previous[item] ?? [];
    const lostRead = before.includes('read') && !columns.includes('read');

    if (lostRead) {
      resolved[item] = [];
    }
    else if (columns.some((column) => column !== 'read') && !columns.includes('read')) {
      resolved[item] = [ 'read', ...columns ];
    }
    else {
      resolved[item] = columns;
    }
  }

  return resolved;
}

/** The four together, as a screen would receive them */
const permissions = { columns: COLUMNS, groups: GROUPS, saved: SAVED, resolve: grantReadWithOthers };

export default permissions;
