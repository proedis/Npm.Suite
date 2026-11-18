'use client';

import * as React from 'react';

import { cn } from '../../core/cn';

import { Spinner } from '../../components/Spinner';

import { Button } from '../button/Button';
import { IconButton } from '../button/IconButton';

import { FileRow, FileThumbnail } from './FileRow';


/* --------
 * Types Definition
 * -------- */

export interface AttachmentItem {
  readonly id: string;
  readonly name: string;

  /** The preview of an image, from the server */
  readonly previewUrl?: string;

  /** The second line, written by the caller: kind, size, who uploaded it and when */
  readonly meta?: string;

  readonly status: 'done' | 'uploading' | 'failed';
}

export interface AttachmentListLabels {
  /** Name and tooltip of the download action: "Download report.pdf" */
  readonly download: (name: string) => string;

  /** The action of a file that did not arrive */
  readonly retry: string;

  /** The second line while uploading, and the name of the spinner */
  readonly uploading: string;

  /** The second line of a file that did not arrive: "Not uploaded" */
  readonly failed: string;
}

export interface AttachmentListProps {
  items: readonly AttachmentItem[];

  /**
   * Opens the file in a new tab. A function, not a link: behind it is a hook of the application that
   * asks for the file with the client's token, which a plain link would not carry.
   */
  onOpen: (item: AttachmentItem) => void;

  /** Downloads the file, by the same route as `onOpen` */
  onDownload: (item: AttachmentItem) => void;

  onRetry?: (item: AttachmentItem) => void;

  /** The ⋯ of a row ("Change kind", "Delete"), from the module: the menu arrives with its own tranche */
  renderActions?: (item: AttachmentItem) => React.ReactNode;

  /** No ⋯: name and download stay */
  readOnly?: boolean;

  labels: AttachmentListLabels;

  className?: string;
}


/* --------
 * Glyphs
 * -------- */

function DownloadGlyph(): React.ReactNode {
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
    >
      <path d={'M12 4v12M7 11l5 5 5-5'} />
      <path d={'M4 20h16'} />
    </svg>
  );
}


/* --------
 * Component Definition
 * -------- */

/**
 * The attachments of an element, in its detail: the row of the form list, with the name opening the
 * file, "Download" in view and the module's actions in the ⋯.
 *
 * ```tsx
 * <AttachmentList items={attachments} onOpen={open} onDownload={download} renderActions={rowMenu} labels={attachmentLabels} />
 * ```
 *
 * A row is done, uploading (a spinner, while the upload runs in the background) or failed, with
 * "Retry". Empty, error and loading states, "Show all (N)" past ten and the section around it belong
 * to the screen.
 *
 * Slots: `attachment-list`, `attachment-row` (with `data-status`), `attachment-name`, `file-thumbnail`.
 */
export function AttachmentList(props: AttachmentListProps): React.ReactNode {

  // ----
  // Props Deconstruct
  // ----
  const {
    className,
    items,
    labels,
    onDownload,
    onOpen,
    onRetry,
    readOnly = false,
    renderActions
  } = props;


  // ----
  // Component Render
  // ----
  return (
    <ul data-slot={'attachment-list'} className={cn('rounded-md border border-border', className)}>
      {items.map((item) => {
        let detail: React.ReactNode = item.meta;

        if (item.status === 'uploading') {
          detail = labels.uploading;
        }
        else if (item.status === 'failed') {
          detail = labels.failed;
        }

        return (
          <FileRow
            key={item.id}
            slot={'attachment-row'}
            thumbnail={<FileThumbnail url={item.previewUrl} />}
            nameText={item.name}
            name={item.status === 'done'
              ? (
                <button
                  type={'button'}
                  data-slot={'attachment-name'}
                  className={'max-w-full truncate text-start outline-none decoration-primary underline-offset-2 hover:underline focus-visible:underline'}
                  onClick={() => onOpen(item)}
                >
                  {item.name}
                </button>
              )
              : item.name}
            detail={detail}
            actions={(
              <React.Fragment>
                {/* Silent: the second line already says it */}
                {item.status === 'uploading' && <Spinner size={'sm'} className={'size-3.5'} />}
                {item.status === 'failed' && onRetry && (
                  <Button size={'sm'} fill={'plain'} tone={'primary'} onClick={() => onRetry(item)}>{labels.retry}</Button>
                )}
                {item.status === 'done' && (
                  <IconButton label={labels.download(item.name)} icon={<DownloadGlyph />} size={'sm'} onClick={() => onDownload(item)} />
                )}
                {!readOnly && renderActions?.(item)}
              </React.Fragment>
            )}
          />
        );
      })}
    </ul>
  );

}

AttachmentList.displayName = 'AttachmentList';
