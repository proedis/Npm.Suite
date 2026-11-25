import * as React from 'react';

import { Download, Ellipsis, FileSpreadsheet, FileText, Printer } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';


export default function Example(): React.ReactNode {
  return (
    <Menu
      aria-label={'Actions on the list of collections'}
      trigger={<IconButton label={'More actions'} icon={<Ellipsis />} />}
    >
      <Menu.Item icon={<Printer />}>Print</Menu.Item>
      <Menu.Submenu label={'Export as'} icon={<Download />}>
        <Menu.Item icon={<FileSpreadsheet />}>Spreadsheet</Menu.Item>
        <Menu.Item icon={<FileText />}>PDF</Menu.Item>
      </Menu.Submenu>
    </Menu>
  );
}
