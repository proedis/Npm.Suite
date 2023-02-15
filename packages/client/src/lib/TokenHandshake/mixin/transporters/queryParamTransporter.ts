import type { TokenTransporter } from '../../TokenHandshake.types';


export default function queryParamTransporter(name: string, isDefault?: boolean): TokenTransporter {
  return {
    type : 'query',
    value: name,
    isDefault
  };
}
