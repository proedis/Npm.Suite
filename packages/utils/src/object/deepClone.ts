import cloneDeep from 'clone-deep';


export default function deepClone<T>(value: T): T {
  return cloneDeep(value);
}
