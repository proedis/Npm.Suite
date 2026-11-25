import type { FileUploadLabels } from '@proedis/ui/forms/file-upload';


const SIZE = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 });

/** A size the way the application writes sizes */
function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${SIZE.format(bytes / 1024)} KB`;
  }

  return `${SIZE.format(bytes / (1024 * 1024))} MB`;
}

/** The kinds a field accepts, in words: `image/jpeg,image/png` reads “JPG or PNG” */
function kinds(accept: string | undefined): string {
  const names = (accept ?? '').split(',').filter(Boolean).map((type) => type.split('/').pop()?.replace('jpeg', 'jpg').toUpperCase());

  return names.length > 1 ? `${names.slice(0, -1).join(', ')} or ${names[names.length - 1]}` : names.join('');
}

/** Every text of an upload: the limits and the reasons are written from the limits themselves */
const labels: FileUploadLabels = {
  drop          : 'Drag the files here or',
  dropSingle    : 'Drag the file here or',
  choose        : 'choose them',
  chooseSingle  : 'choose it',
  limits        : ({ accept, maxFiles, maxSize }) => [
    accept ? kinds(accept) : null,
    maxSize ? `up to ${formatSize(maxSize)} each` : null,
    maxFiles && maxFiles > 1 ? `${maxFiles} files at most` : null
  ].filter(Boolean).join(', '),
  release       : (count) => (count ? `Drop to add ${count} file${count === 1 ? '' : 's'}` : 'Drop to add the files'),
  full          : (max) => `You added ${max} files, the maximum`,
  remaining     : (count) => `You can add ${count} more`,
  typeNotAllowed: 'This kind of file is not accepted',
  rejection     : (rejection) => {
    switch (rejection.code) {
      case 'type':
        return 'not accepted: wrong kind of file';
      case 'size':
        return `too large: the maximum is ${formatSize(rejection.max)}`;
      case 'count':
        return `one too many: the maximum is ${rejection.max} files`;
      default:
        return 'a folder cannot be attached';
    }
  },
  duplicate: (index) => `${index}${index === 2 ? 'nd' : index === 3 ? 'rd' : 'th'} file with this name`,
  remove   : (name, duplicateIndex) => `Remove ${name}${duplicateIndex ? ` (${duplicateIndex})` : ''}`,
  replace  : 'Replace',
  added    : (added, rejected) => `${added} file${added === 1 ? '' : 's'} added${rejected ? `, ${rejected} rejected` : ''}`,
  removed  : (name) => `${name} removed`,
  formatSize
};

export default labels;
