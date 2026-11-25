import * as React from 'react';

import { Ellipsis, Pencil, Trash2 } from 'lucide-react';

import { IconButton } from '@proedis/ui/actions/button';
import { Menu } from '@proedis/ui/actions/menu';
import { AttachmentList } from '@proedis/ui/forms/file-upload';

import type { AttachmentItem, AttachmentListLabels } from '@proedis/ui/forms/file-upload';


const LABELS: AttachmentListLabels = {
  download : (name) => `Download ${name}`,
  retry    : 'Retry',
  uploading: 'Uploading…',
  failed   : 'Not uploaded'
};

const ITEMS: readonly AttachmentItem[] = [
  { id: '1', name: 'contract-2026.pdf', meta: 'PDF · 180 KB · Anna Gallo, 12 Nov', status: 'done' },
  { id: '2', name: 'site-inspection.jpg', meta: 'JPG · 1.2 MB · Marco Ricci, 14 Nov', status: 'done' },
  { id: '3', name: 'delivery-note.pdf', status: 'uploading' },
  { id: '4', name: 'route-map.png', status: 'failed' }
];


export default function Example(): React.ReactNode {
  const [ opened, setOpened ] = React.useState<string | null>(null);

  const handleOpen = React.useCallback((item: AttachmentItem) => setOpened(`Opened ${item.name}`), []);
  const handleDownload = React.useCallback((item: AttachmentItem) => setOpened(`Downloaded ${item.name}`), []);
  const handleRetry = React.useCallback((item: AttachmentItem) => setOpened(`Retrying ${item.name}`), []);

  const renderActions = React.useCallback((item: AttachmentItem) => (
    <Menu aria-label={`Actions on ${item.name}`} trigger={<IconButton size={'sm'} label={'More actions'} icon={<Ellipsis />} />}>
      <Menu.Item icon={<Pencil />}>Change the kind</Menu.Item>
      <Menu.Separator />
      <Menu.Item icon={<Trash2 />} tone={'destructive'}>Delete</Menu.Item>
    </Menu>
  ), []);

  return (
    <div className={'w-full max-w-lg'}>
      <AttachmentList
        items={ITEMS}
        onOpen={handleOpen}
        onDownload={handleDownload}
        onRetry={handleRetry}
        renderActions={renderActions}
        labels={LABELS}
      />
      <p className={'mt-3 text-sm text-muted-foreground'}>{opened ?? 'Open, download or retry a file.'}</p>
    </div>
  );
}
