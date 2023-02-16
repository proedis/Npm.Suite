import getHash from './getHash';
import isNil from './isNil';


/**
 * Perform a hash check using oldData and newData to
 * get if there are some changes between the two values
 * @param oldData
 * @param newData
 */
export default function hasEqualHash(oldData: any, newData: any): boolean {
  /** If old data is a nil object, check if new data is nil too */
  if (isNil(oldData)) {
    return isNil(newData);
  }

  /** If new data is a nil object, check if old data is nil too */
  if (isNil(newData)) {
    return isNil(oldData);
  }

  /** If the two data values are objects, compare the hash */
  if (typeof oldData === 'object' && typeof newData === 'object') {
    return getHash(oldData) === getHash(newData);
  }

  /** If they are primitive values, return strict comparison */
  return oldData === newData;
}
