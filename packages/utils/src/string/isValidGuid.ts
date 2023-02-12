import isValidString from './isValidString';


/* --------
 * Constants
 * -------- */
const GUID_REGEXP = /^[\da-fA-F]{8}\b-[\da-fA-F]{4}\b-[\da-fA-F]{4}\b-[\da-fA-F]{4}\b-[\da-fA-F]{12}$/gi;


export default function isValidGuid(str: string): str is string {
  return isValidString(str) && GUID_REGEXP.test(str);
}
