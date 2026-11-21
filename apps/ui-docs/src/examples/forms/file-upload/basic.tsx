import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { FileUpload } from '@proedis/ui/forms/file-upload';

import type { FileEntry } from '@proedis/ui/forms/file-upload';

import labels from './labels';


export default function Example(): React.ReactNode {
  const [ files, setFiles ] = React.useState<FileEntry[]>([]);

  const handleAdd = React.useCallback((entries: FileEntry[]) => setFiles((current) => [ ...current, ...entries ]), []);
  const handleRemove = React.useCallback((id: string) => setFiles((current) => current.filter((entry) => entry.id !== id)), []);

  return (
    <Field className={'w-full max-w-lg'}>
      <Field.Label>Photos of the damage</Field.Label>
      <FileUpload
        files={files}
        onAdd={handleAdd}
        onRemove={handleRemove}
        accept={'image/jpeg,image/png,application/pdf'}
        maxSize={5 * 1024 * 1024}
        maxFiles={5}
        labels={labels}
      />
      <Field.Description>The files are sent with the report, when it is confirmed.</Field.Description>
    </Field>
  );
}
