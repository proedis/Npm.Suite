import type { TokenTransporter } from '../../TokenHandshake.types';


export default function bearerTransporter(isDefault?: boolean): TokenTransporter {
  return {
    type: 'bearer',
    isDefault
  };
}
