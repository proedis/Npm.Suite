'use client';

import * as React from 'react';

import { useAnnouncer } from '@proedis/react';

import { splitBaseProps } from '../../core/base';
import { cn } from '../../core/cn';

import { Button } from '../../actions/button/Button';
import { IconButton } from '../../actions/button/IconButton';
import { useFieldControl, useNonNativeFieldLabel } from '../field/fieldContext';
import { ClearGlyph } from '../text-input/glyphs';

import { acceptsFile, guardDocumentDrop, validateFiles } from './fileRules';
import { FileRow, FileThumbnail, UploadGlyph } from './FileRow';

import type { BaseProps } from '../../core/base';

import type { FileEntry, FileLimits, FileRejection } from './fileRules';


/* --------
 * Types Definition
 * -------- */

export interface FileUploadLabels {
  /** "Drag the files here or", before the button; for a single file, `dropSingle` */
  readonly drop: string;
  readonly dropSingle: string;

  /** The button that opens the system window: "choose them", "choose it" */
  readonly choose: string;
  readonly chooseSingle: string;

  /** The second line of the box, from the limits themselves so text and check never diverge */
  readonly limits: (limits: FileLimits) => string;

  /** While files are dragged over: "Drop to add 3 files", the number only if the browser says it */
  readonly release: (count: number | null) => string;

  /** At the maximum: "You added 10 files, the maximum" */
  readonly full: (max: number) => string;

  /** A drag that cannot be taken: "You can add 2 more" */
  readonly remaining: (count: number) => string;

  /** A drag of files of a kind not accepted: "Only JPG, PNG or PDF" */
  readonly typeNotAllowed: string;

  /** Why a file was rejected, with its limit: "too large: the maximum is 20 MB" */
  readonly rejection: (rejection: FileRejection) => string;

  /** "2nd file with this name" */
  readonly duplicate: (index: number) => string;

  /** Name and tooltip of the x of a row: "Remove photo.jpg" */
  readonly remove: (name: string, duplicateIndex?: number) => string;

  /** The action that replaces the one file of a single file field */
  readonly replace: string;

  /** Announced after a choice or a drop: "5 files added, 2 rejected" */
  readonly added: (added: number, rejected: number) => string;

  /** Announced after a removal: "photo.jpg removed" */
  readonly removed: (name: string) => string;

  /** The size of a file, written the way the application writes sizes */
  readonly formatSize: (bytes: number) => string;
}

export interface StrictFileUploadProps extends FileLimits, BaseProps {
  /** The files chosen so far, controlled by the form */
  files: readonly FileEntry[];

  /** New files, already checked: append them */
  onAdd: (entries: FileEntry[]) => void;

  /** A file taken off the list */
  onRemove: (id: string) => void;

  readOnly?: boolean;
  disabled?: boolean;
  invalid?: boolean;

  labels: FileUploadLabels;

  /** The id of the button that chooses the files, which the label of a field points at */
  id?: string;
  className?: string;
}

export type FileUploadProps = StrictFileUploadProps & Omit<
  React.ComponentProps<'div'>,
  keyof StrictFileUploadProps | 'ref' | 'children'
>;

type DragState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'over'; readonly count: number | null }
  | { readonly kind: 'refused'; readonly reason: string };


/* --------
 * Helpers
 * -------- */

function hasFiles(event: React.DragEvent): boolean {
  return event.dataTransfer.types.includes('Files');
}


/** The files of a drop, with the folders among them told apart */
function readDrop(event: React.DragEvent): { files: File[]; folders: Set<File> } {
  const files = Array.from(event.dataTransfer.files);
  const folders = new Set<File>();

  /*
   * `files` holds the file items only, in order, while `items` also holds the strings a drag from a
   * browser carries (a link, its text): matched on the raw index, a folder was put on the wrong file.
   */
  Array.from(event.dataTransfer.items).filter((item) => item.kind === 'file').forEach((item, index) => {
    const entry = item.webkitGetAsEntry?.();

    if (entry?.isDirectory && files[index]) {
      folders.add(files[index]);
    }
  });

  return { files, folders };
}


/* --------
 * Component Definition
 * -------- */

/**
 * Attaching files in a form: the box "Drag the files here or choose them", and the list of the files
 * chosen under it.
 *
 * ```tsx
 * <Field span={6}>
 *   <Field.Label>Photos and documents</Field.Label>
 *   <FileUpload files={files} onAdd={(entries) => setFiles([ ...files, ...entries ])} onRemove={remove}
 *     accept={'image/jpeg,image/png,application/pdf'} maxSize={20 * 1024 * 1024} maxFiles={10} labels={uploadLabels} />
 *   <Field.Error>{errors.files}</Field.Error>
 * </Field>
 * ```
 *
 * It uploads nothing: the caller sends the ready files when the form is confirmed. It checks every
 * file on arrival, in order type, size, number, and gives back the reason as a code: rejected files
 * stay in the list, do not block the submit and do not count towards the maximum. The whole box
 * forwards a click to its one button, the only Tab stop. A drag lights the box only if it carries
 * files, and says when it cannot be taken. While it is mounted, a file dropped outside it does not
 * make the browser open the file.
 *
 * `maxFiles={1}` is the field for one file: once chosen, its row takes the place of the box, with
 * "Replace". Read only, the box is gone and the files stay.
 *
 * Slots: `file-upload` (with `data-disabled`, `data-readonly`, `data-invalid`, `data-single`),
 * `file-upload-box` (with `data-drag`, `data-full`, `data-invalid`), `file-upload-choose`,
 * `file-upload-list`, `file-upload-row` (with `data-rejected`), `file-upload-row-label`,
 * `file-upload-row-detail`, `file-upload-row-actions`, `file-thumbnail`.
 */
export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>((props, ref) => {

  // ----
  // Props Deconstruct
  // ----
  const {
    accept,
    className,
    disabled = false,
    files,
    id,
    invalid = false,
    labels,
    maxFiles,
    maxSize,
    onAdd,
    onRemove,
    readOnly = false,
    ...others
  } = props;

  const { baseClasses, rest } = splitBaseProps(others);


  // ----
  // Internal Hooks
  // ----
  const field = useFieldControl();

  useNonNativeFieldLabel();

  const inputRef = React.useRef<HTMLInputElement>(null);
  const chooseRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const chooseTextId = React.useId();
  const limitsId = React.useId();


  // ----
  // Internal State
  // ----
  const [ drag, setDrag ] = React.useState<DragState>({ kind: 'idle' });
  const [ announcement, announce ] = useAnnouncer();


  // ----
  // Lifecycle Events
  // ----
  React.useEffect(() => {
    if (readOnly || disabled) {
      return undefined;
    }

    return guardDocumentDrop();
  }, [ readOnly, disabled ]);


  // ----
  // Handlers
  // ----
  const limits: FileLimits = { accept, maxFiles, maxSize };
  const readyCount = files.filter((entry) => entry.status === 'ready').length;
  const isDisabled = disabled || field.disabled;
  const isFull = maxFiles !== undefined && readyCount >= maxFiles;
  const single = maxFiles === 1;

  const add = (incoming: File[], folders?: Set<File>): void => {
    if (incoming.length === 0) {
      return;
    }

    const entries = validateFiles(incoming, files, limits, folders);
    const rejected = entries.filter((entry) => entry.status === 'rejected').length;

    onAdd(entries);
    announce(labels.added(entries.length - rejected, rejected));
  };

  const remove = (entry: FileEntry, index: number): void => {
    onRemove(entry.id);
    announce(labels.removed(entry.file.name));

    /* The focus goes to the next row, or back to the button */
    window.setTimeout(() => {
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('[data-slot=file-upload-remove]');
      const next = buttons?.[Math.min(index, buttons.length - 1)];

      (next ?? chooseRef.current)?.focus();
    }, 0);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    if (!hasFiles(event) || isFull || isDisabled) {
      return;
    }

    event.preventDefault();

    const items = Array.from(event.dataTransfer.items).filter((item) => item.kind === 'file');
    const count = items.length > 0 ? items.length : null;
    const remaining = maxFiles === undefined ? Infinity : maxFiles - readyCount;
    const knownTypes = items.every((item) => item.type !== '');

    /* While dragging only the MIME type is known, so only the MIME rules can refuse */
    const mimeRules = accept?.split(',').filter((rule) => !rule.trim().startsWith('.')).join(',') || undefined;

    if (count !== null && count > remaining) {
      setDrag({ kind: 'refused', reason: labels.remaining(remaining) });
    }
    else if (accept && knownTypes && items.some((item) => !acceptsFile({ name: '', type: item.type }, mimeRules))) {
      setDrag({ kind: 'refused', reason: labels.typeNotAllowed });
    }
    else {
      setDrag({ kind: 'over', count });
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>): void => {
    if (!hasFiles(event) || isFull || isDisabled) {
      return;
    }

    event.preventDefault();
    setDrag({ kind: 'idle' });

    const { files: dropped, folders } = readDrop(event);

    add(dropped, folders);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>): void => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setDrag({ kind: 'idle' });
    }
  };

  const openPicker = (): void => {
    inputRef.current?.click();
  };


  // ----
  // Component Render
  // ----
  const showBox = !readOnly && !(single && readyCount === 1);

  let boxText: React.ReactNode = (
    <React.Fragment>
      <span>
        {single ? labels.dropSingle : labels.drop}
        {' '}
        <button
          ref={chooseRef}
          id={id}
          type={'button'}
          disabled={isDisabled}
          aria-labelledby={[ chooseTextId, field.labelId ].filter(Boolean).join(' ')}
          aria-describedby={limitsId}
          data-slot={'file-upload-choose'}
          data-field-control={''}
          className={'rounded-sm font-medium text-primary underline-offset-2 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'}
          onClick={(event) => {
            event.stopPropagation();
            openPicker();
          }}
        >
          <span id={chooseTextId}>{single ? labels.chooseSingle : labels.choose}</span>
        </button>
      </span>
      <span id={limitsId} className={'text-xs text-muted-foreground'}>{labels.limits(limits)}</span>
    </React.Fragment>
  );

  if (isFull && maxFiles !== undefined) {
    boxText = <span>{labels.full(maxFiles)}</span>;
  }
  else if (drag.kind === 'over') {
    boxText = <span>{labels.release(drag.count)}</span>;
  }
  else if (drag.kind === 'refused') {
    boxText = <span>{drag.reason}</span>;
  }

  return (
    <div
      {...rest}
      ref={ref}
      data-slot={'file-upload'}
      data-disabled={isDisabled || undefined}
      data-readonly={readOnly || undefined}
      data-invalid={(invalid || field.invalid) || undefined}
      data-single={single || undefined}
      className={cn('flex flex-col gap-2', isDisabled && 'opacity-50', baseClasses, className)}
    >
      <input
        ref={inputRef}
        type={'file'}
        hidden
        multiple={!single}
        accept={accept}
        onChange={(event) => {
          add(Array.from(event.currentTarget.files ?? []));
          event.currentTarget.value = '';
        }}
      />

      {showBox && (
        // The box forwards the click to its button, which is the control; it takes no focus itself
        <div
          data-slot={'file-upload-box'}
          data-drag={drag.kind === 'idle' ? undefined : drag.kind}
          data-full={isFull || undefined}
          data-invalid={invalid || field.invalid || undefined}
          className={cn(
            'flex min-h-20 cursor-pointer items-center gap-3 rounded-md border border-dashed border-input bg-card px-4 py-3 text-sm',
            'transition-colors duration-100 motion-reduce:transition-none',
            'hover:border-input-hover hover:bg-background',
            'has-[[data-slot=file-upload-choose]:focus-visible]:border-ring',
            'data-[drag=over]:border-2 data-[drag=over]:border-solid data-[drag=over]:border-primary data-[drag=over]:bg-accent',
            'data-[drag=refused]:border-2 data-[drag=refused]:border-destructive data-[drag=refused]:bg-destructive-soft',
            'data-full:cursor-default data-full:border-solid data-full:border-border data-full:bg-muted',
            'data-invalid:border-destructive',
            '[&>svg]:shrink-0 [&>svg]:text-muted-foreground'
          )}
          onClick={() => {
            if (!isFull && !isDisabled) {
              openPicker();
            }
          }}
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <UploadGlyph />
          <span className={'flex flex-col gap-0.5'}>{boxText}</span>
        </div>
      )}

      {files.length > 0 && (
        <ul ref={listRef} data-slot={'file-upload-list'} className={'rounded-md border border-border'}>
          {files.map((entry, index) => (
            <FileRow
              key={entry.id}
              slot={'file-upload-row'}
              thumbnail={<FileThumbnail file={entry.status === 'ready' ? entry.file : undefined} />}
              name={entry.file.name}
              nameText={entry.file.name}
              rejected={entry.status === 'rejected'}
              detail={entry.rejection
                ? labels.rejection(entry.rejection)
                : [ labels.formatSize(entry.file.size), entry.duplicateIndex ? labels.duplicate(entry.duplicateIndex) : null ].filter(Boolean).join(' · ')}
              actions={!readOnly && (
                <React.Fragment>
                  {single && entry.status === 'ready' && (
                    <Button size={'sm'} fill={'plain'} tone={'primary'} disabled={isDisabled} onClick={openPicker}>{labels.replace}</Button>
                  )}
                  <IconButton
                    label={labels.remove(entry.file.name, entry.duplicateIndex)}
                    icon={<ClearGlyph />}
                    size={'sm'}
                    disabled={isDisabled}
                    data-slot={'file-upload-remove'}
                    onClick={() => remove(entry, index)}
                  />
                </React.Fragment>
              )}
            />
          ))}
        </ul>
      )}

      <span role={'status'} className={'sr-only'}>{announcement}</span>
    </div>
  );

});

FileUpload.displayName = 'FileUpload';
