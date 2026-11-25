import type { ModalSelectorColumn, ModalSelectorRowLabel } from '@proedis/ui/data/modal-selector';
import { modalSelectorLabels } from '../labels';

import type { Customer } from '../fixtures';


/*
 * What the module of the customers declares for every selector of a customer: four columns at most,
 * one that takes the rest, the name a chosen row reads as, and the texts.
 */


export const customerColumns: readonly ModalSelectorColumn<Customer>[] = [
  { id: 'code', header: 'Code', kind: 'code', width: 'sm' },
  { id: 'name', header: 'Customer', kind: 'text', width: 'fill' },
  { id: 'town', header: 'Town', kind: 'text', width: 'md' },
  { id: 'contract', header: 'Contract', kind: 'enum', width: 'sm' }
];

export function customerLabel(customer: Customer): ModalSelectorRowLabel {
  return { label: customer.name, code: customer.code };
}

export const customerSelectorLabels = modalSelectorLabels({ one: 'customer', many: 'customers' });
