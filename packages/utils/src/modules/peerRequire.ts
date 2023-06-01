import { isObject } from '../object';
import { isNil } from '../generics';


export function peerRequire<T = any>(name: string): T {
  /** Assert the name is a node_module name and not a relative path */
  if (/(^\.)|(^\/)/.test(name)) {
    throw new Error('peerRequire() function could not be used with a relative/absolute path');
  }

  /** Load the internal module using optional require */
  let maybeTheModule: T | null = null;

  /** Try to load the module using name */
  try {
    maybeTheModule = require(name);
  }
  catch {
    maybeTheModule = null;
  }

  /** Return a Proxy to handle resolution of internal keys and functions */
  return new Proxy(isObject(maybeTheModule) ? maybeTheModule : {}, {
    get(target: any, prop: string | symbol): any {
      /** Assert the module has been loaded */
      if (isNil(maybeTheModule) || !isObject(maybeTheModule)) {
        throw new Error(`Invalid module '${name}'. You must install the package to use this function`);
      }
      /** Assert the required prop exists in module */
      if (!(prop in maybeTheModule)) {
        throw new Error(`Could not find '${String(prop)}' key in '${name}'`);
      }
      /** Return the module key */
      return maybeTheModule[name];
    }
  });
}
