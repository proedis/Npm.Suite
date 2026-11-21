import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { FileUpload, validateFiles } from '@proedis/ui/forms/file-upload';

import type { FileEntry, FileLimits } from '@proedis/ui/forms/file-upload';

import labels from './labels';


const LIMITS: FileLimits = { accept: 'image/jpeg,image/png', maxSize: 1024 * 1024, maxFiles: 3 };

/** Files made on the spot, of the sizes and kinds that each rule rejects */
function sample(name: string, type: string, bytes: number): File {
  return new File([ new Uint8Array(bytes) ], name, { type });
}

/** The same check the field runs on arrival, run here on a few files already in hand */
const INITIAL: FileEntry[] = validateFiles([
  sample('bin-front.jpg', 'image/jpeg', 320 * 1024),
  sample('bin-front.jpg', 'image/jpeg', 280 * 1024),
  sample('report.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 40 * 1024),
  sample('panorama.png', 'image/png', 3 * 1024 * 1024),
  sample('lid.png', 'image/png', 150 * 1024),
  sample('handle.png', 'image/png', 90 * 1024)
], [], LIMITS);


export default function Example(): React.ReactNode {
  const [ files, setFiles ] = React.useState<FileEntry[]>(INITIAL);

  const handleAdd = React.useCallback((entries: FileEntry[]) => setFiles((current) => [ ...current, ...entries ]), []);
  const handleRemove = React.useCallback((id: string) => setFiles((current) => current.filter((entry) => entry.id !== id)), []);

  return (
    <Field className={'w-full max-w-lg'}>
      <Field.Label>Photos of the bin</Field.Label>
      <FileUpload files={files} onAdd={handleAdd} onRemove={handleRemove} {...LIMITS} labels={labels} />
      <Field.Description>A duplicate name, a wrong kind, a file too large, one past the maximum.</Field.Description>
    </Field>
  );
}
