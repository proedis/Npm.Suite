/**
 * @proedis/ui/interactive/file-upload
 *
 * `FileUpload`, attaching files in a form, `AttachmentList`, the attachments of an element, and
 * `validateFiles`, the check they run, for a caller that needs it again. Runs on `@base-ui/react`,
 * an optional peer of this package.
 */

export * from './AttachmentList';

export * from './FileUpload';

export { acceptsFile, validateFiles } from './fileRules';

export type { FileEntry, FileLimits, FileRejection } from './fileRules';
