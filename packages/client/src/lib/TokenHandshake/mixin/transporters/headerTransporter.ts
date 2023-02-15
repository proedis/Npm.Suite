import type { TokenTransporter } from '../../TokenHandshake.types';


export default function headerTransporter(name: string, isDefault?: boolean): TokenTransporter {
  return {
    type : 'header',
    value: name,
    isDefault
  };
}
