import * as React from 'react';

import { ChevronDown, FileSpreadsheet, FileText } from 'lucide-react';

import { Button } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';


export default function Example(): React.ReactNode {
  return (
    <Menu
      aria-label={'Export the list'}
      align={'start'}
      trigger={<Button fill={'soft'} tone={'secondary'} trailing={<ChevronDown />}>Export</Button>}
    >
      <Menu.Item icon={<FileSpreadsheet />}>Spreadsheet</Menu.Item>
      <Menu.Item icon={<FileText />}>PDF</Menu.Item>
    </Menu>
  );
}
