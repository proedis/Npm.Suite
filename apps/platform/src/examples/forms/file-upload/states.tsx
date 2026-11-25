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
      <Field label={'Read only'} description={'The box is gone, the files stay.'}>
        <FileUpload readOnly files={FILES} onAdd={NOTHING} onRemove={NOTHING} labels={labels} />
      </Field>
      <Field label={'Invalid'} error={'Attach the signed contract'}>
        <FileUpload files={[]} onAdd={NOTHING} onRemove={NOTHING} accept={'application/pdf'} labels={labels} />
      </Field>
      <Field disabled label={'Disabled'} description={'Attachments are closed for this order.'}>
        <FileUpload files={[]} onAdd={NOTHING} onRemove={NOTHING} labels={labels} />
      </Field>
    </Stack>
  );
}
