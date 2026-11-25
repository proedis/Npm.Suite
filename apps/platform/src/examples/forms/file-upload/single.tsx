import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { FileUpload } from '@proedis/ui/forms/file-upload';

import type { FileEntry } from '@proedis/ui/forms/file-upload';

import labels from './labels';


export default function Example(): React.ReactNode {
  const [ files, setFiles ] = React.useState<FileEntry[]>([]);

  /* One file: a new choice replaces the one there was */
  const handleAdd = React.useCallback((entries: FileEntry[]) => setFiles(entries), []);
  const handleRemove = React.useCallback(() => setFiles([]), []);

  return (
    <Field
      className={'w-full max-w-lg'}
      required
      label={'Signed delivery note'}
      description={'Once chosen, the file takes the place of the box, with Replace.'}
    >
      <FileUpload files={files} onAdd={handleAdd} onRemove={handleRemove} accept={'application/pdf'} maxFiles={1} labels={labels} />
    </Field>
  );
}
