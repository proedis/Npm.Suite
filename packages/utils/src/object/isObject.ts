import isNil from '../generics/isNil';


export default function isObject(value: any): value is Record<string, any> {
  return typeof value === 'object' && !isNil(value) && !Array.isArray(value);
}
