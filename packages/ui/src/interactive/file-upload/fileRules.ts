/*
 * What a file field accepts, as pure functions: the component checks what is dropped or chosen, and
 * the caller can check the same files again when a rule changes (the type of document chosen in the
 * same dialog). The reasons are codes, not text, so the language is the caller's at render time.
 */


/* --------
 * Types Definition
 * -------- */

export interface FileLimits {
  /** As the `accept` of an input: MIME types, `image/*`, extensions */
  readonly accept?: string;

  /** Bytes at most for one file */
  readonly maxSize?: number;

  /** Files at most; 1 is the field for a single file */
  readonly maxFiles?: number;
}

export type FileRejection =
  | { readonly code: 'type' }
  | { readonly code: 'size'; readonly max: number }
  | { readonly code: 'count'; readonly max: number }
  | { readonly code: 'folder' };

export interface FileEntry {
  readonly id: string;
  readonly file: File;
  readonly status: 'ready' | 'rejected';
  readonly rejection?: FileRejection;

  /** 2 for the second file with the same name, and so on: said next to the name */
  readonly duplicateIndex?: number;
}


/* --------
 * Helpers
 * -------- */

let sequence = 0;

function nextId(): string {
  sequence += 1;

  return `file-${Date.now().toString(36)}-${sequence}`;
}


/** Whether a file matches an `accept` list, by MIME type, by family (`image/*`) or by extension */
export function acceptsFile(file: Pick<File, 'name' | 'type'>, accept: string | undefined): boolean {
  if (!accept || accept.trim() === '') {
    return true;
  }

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return accept.split(',').map((item) => item.trim().toLowerCase()).some((rule) => {
    if (rule.startsWith('.')) {
      return name.endsWith(rule);
    }

    if (rule.endsWith('/*')) {
      return type.startsWith(rule.slice(0, -1));
    }

    return type === rule;
  });
}


/**
 * Checks new files against the limits, in order: type, size, number. The first rule that fails is
 * the reason. Rejected files do not count towards the maximum; past it, the first ones in order are
 * taken and the others rejected. A folder is rejected.
 */
export function validateFiles(
  incoming: readonly File[],
  existing: readonly FileEntry[],
  limits: FileLimits,
  folders: ReadonlySet<File> = new Set()
): FileEntry[] {
  const { accept, maxFiles, maxSize } = limits;

  let readyCount = existing.filter((entry) => entry.status === 'ready').length;

  const names = new Map<string, number>();

  existing.forEach((entry) => names.set(entry.file.name, (names.get(entry.file.name) ?? 0) + 1));

  return incoming.map((file) => {
    const seen = (names.get(file.name) ?? 0) + 1;

    names.set(file.name, seen);

    const base = { id: nextId(), file, duplicateIndex: seen > 1 ? seen : undefined };

    let rejection: FileRejection | undefined;

    if (folders.has(file)) {
      rejection = { code: 'folder' };
    }
    else if (!acceptsFile(file, accept)) {
      rejection = { code: 'type' };
    }
    else if (maxSize !== undefined && file.size > maxSize) {
      rejection = { code: 'size', max: maxSize };
    }
    else if (maxFiles !== undefined && readyCount >= maxFiles) {
      rejection = { code: 'count', max: maxFiles };
    }

    if (rejection) {
      return { ...base, status: 'rejected', rejection };
    }

    readyCount += 1;

    return { ...base, status: 'ready' };
  });
}


/* --------
 * The document guard
 * -------- */

let guards = 0;

function preventDefault(event: DragEvent): void {
  if (event.dataTransfer?.types.includes('Files')) {
    event.preventDefault();
  }
}


/**
 * While any file field is mounted, a file dropped outside it does not make the browser open the file
 * in place of the application. Counted: the listeners leave with the last field, and two fields at
 * once (a dialog over a drawer) do not fight over them.
 */
export function guardDocumentDrop(): () => void {
  if (guards === 0) {
    document.addEventListener('dragover', preventDefault);
    document.addEventListener('drop', preventDefault);
  }

  guards += 1;

  return () => {
    guards -= 1;

    if (guards === 0) {
      document.removeEventListener('dragover', preventDefault);
      document.removeEventListener('drop', preventDefault);
    }
  };
}
