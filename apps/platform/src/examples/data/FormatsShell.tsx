import * as React from 'react';

import { TableFormatsProvider } from '@proedis/ui/data/table';

import { tableFormats } from './labels';


/**
 * The formats of the Data pages, mounted once around each page as an application mounts them once
 * around its router: every Table and ModalSelector inside reads its dates, numbers and labels here.
 */
export default function FormatsShell(props: { children: React.ReactNode }): React.ReactNode {
  return <TableFormatsProvider formats={tableFormats}>{props.children}</TableFormatsProvider>;
}
