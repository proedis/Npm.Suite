import * as React from 'react';

import { Field } from '@proedis/ui/forms/field';
import { FileUpload, validateFiles } from '@proedis/ui/forms/file-upload';
import { Stack } from '@proedis/ui/layout';

import labels from './labels';


const FILES = validateFiles([
  new File([ new Uint8Array(180 * 1024) ], 'contract-2026.pdf', { type: 'application/pdf' }),
  new File([ new Uint8Array(64 * 1024) ], 'map.png', { type: 'image/png' })
], [], {});

const NOTHING = (): void => undefined;


export default function Example(): React.ReactNode {
  return (
    <Stack gap={6} className={'w-full max-w-lg'}>
      <Field>
        <Field.Label>Read only</Field.Label>
        <FileUpload readOnly files={FILES} onAdd={NOTHING} onRemove={NOTHING} labels={labels} />
        <Field.Description>The box is gone, the files stay.</Field.Description>
      </Field>
      <Field>
        <Field.Label>Invalid</Field.Label>
        <FileUpload files={[]} onAdd={NOTHING} onRemove={NOTHING} accept={'application/pdf'} labels={labels} />
        <Field.Error>Attach the signed contract</Field.Error>
      </Field>
      <Field disabled>
        <Field.Label>Disabled</Field.Label>
        <FileUpload files={[]} onAdd={NOTHING} onRemove={NOTHING} labels={labels} />
        <Field.Description>Attachments are closed for this order.</Field.Description>
      </Field>
    </Stack>
  );
}
