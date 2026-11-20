'use client';

import * as React from 'react';

import { cn } from '../../core/cn';

import { Tooltip } from '../../actions/tooltip/Tooltip';


/*
 * The row of a file, shared by the list under FileUpload and by AttachmentList: a thumbnail or the
 * mark of the kind, the name truncated with its tooltip, a second line, the actions at the end.
 * Private to the interactive tier.
 */


/* --------
 * Glyphs
 * -------- */

export function FileGlyph(): React.ReactNode {
  return (
    <svg
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={1.75}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
      focusable={'false'}
      className={'size-5'}
    >
      <path d={'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z'} />
      <path d={'M14 3v5h5'} />
    </svg>
  );
}


export function UploadGlyph(): React.ReactNode {
  return (
    <svg
      viewBox={'0 0 24 24'}
      fill={'none'}
      stroke={'currentColor'}
      strokeWidth={2}
      strokeLinecap={'round'}
      strokeLinejoin={'round'}
      aria-hidden={'true'}
      focusable={'false'}
      className={'size-5'}
    >
      <path d={'M12 16V4M7 9l5-5 5 5'} />
      <path d={'M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3'} />
    </svg>
  );
}


/* --------
 * Parts
 * -------- */

interface FileThumbnailProps {
  /** A file chosen in the form: its preview is made here and freed when the row leaves */
  file?: File;

  /** An image already on the server */
  url?: string;
}

/** The 32×32 square of a row: decorative, the name next to it says what it is */
export function FileThumbnail(props: FileThumbnailProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { file, url } = props;


  // ----
  // Internal State
  // ----
  const [ objectUrl, setObjectUrl ] = React.useState<string | null>(null);


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      return undefined;
    }

    const created = URL.createObjectURL(file);
    const timer = window.setTimeout(() => setObjectUrl(created), 0);

    return () => {
      window.clearTimeout(timer);
      URL.revokeObjectURL(created);
    };
  }, [ file ]);


  // ----
  // Component Render
  // ----
  const source = url ?? objectUrl;

  return (
    <span
      data-slot={'file-thumbnail'}
      aria-hidden={'true'}
      className={'flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-muted text-muted-foreground'}
    >
      {source ? <img src={source} alt={''} className={'size-full object-cover'} /> : <FileGlyph />}
    </span>
  );

}


interface FileRowProps {
  slot: string;
  thumbnail: React.ReactNode;
  name: React.ReactNode;
  nameText: string;
  detail?: React.ReactNode;
  rejected?: boolean;

  /** Reported as `data-status`: the state of an attachment, for a skin to follow */
  status?: string;
  actions?: React.ReactNode;
}

export function FileRow(props: FileRowProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const { actions, detail, name, nameText, rejected = false, slot, status, thumbnail } = props;


  // ----
  // Component Render
  // ----
  return (
    <li
      data-slot={slot}
      data-status={status}
      data-rejected={rejected || undefined}
      className={'flex min-h-12 items-center gap-3 border-b border-border px-2 py-1.5 last:border-b-0'}
    >
      {thumbnail}

      <span className={'flex min-w-0 flex-1 flex-col'}>
        <Tooltip content={nameText} truncatedOnly align={'start'}>
          <span data-slot={`${slot}-label`} data-truncate={''} className={'min-w-0 truncate text-sm'}>{name}</span>
        </Tooltip>

        {detail && (
          <span
            data-slot={`${slot}-detail`}
            className={cn(
              'text-xs',
              rejected
                ? 'mt-0.5 rounded-sm bg-destructive-soft px-1.5 py-0.5 text-destructive-soft-foreground'
                : 'truncate text-muted-foreground'
            )}
          >
            {detail}
          </span>
        )}
      </span>

      {actions && <span data-slot={`${slot}-actions`} className={'flex shrink-0 items-center gap-1'}>{actions}</span>}
    </li>
  );

}
