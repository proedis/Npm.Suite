import hasher from 'object-hash';


/**
 * Return the sha1 hash string of any object
 * @param value
 */
export default function getHash(value: any): string {
  return hasher(value ?? null, {
    unorderedArrays : false,
    unorderedSets   : false,
    unorderedObjects: false
  });
}
