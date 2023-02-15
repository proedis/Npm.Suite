import type { TokenTransporter } from '../../TokenHandshake.types';


export default function queryTransporter(name: string, isDefault?: boolean): TokenTransporter {
  return {
    type : 'query',
    value: name,
    isDefault
  };
}
