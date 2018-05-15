import { ContextVariables } from 'gdmn-orm';

export function default2Int(defaultValue: string | null): number | undefined {
  const num = Number(defaultValue);
  return (num || num === 0) && Number.isInteger(num) ? num : undefined;
}

export function default2Number(defaultValue: string | null): number | undefined {
  const num = Number(defaultValue);
  return (num || num === 0) ? num : undefined;
}

export function default2Date(defaultValue: string | null): Date | ContextVariables | undefined {
  switch (defaultValue) {
    case 'CURRENT_TIMESTAMP(0)': return 'CURRENT_TIMESTAMP(0)';
    case 'CURRENT_TIMESTAMP': return 'CURRENT_TIMESTAMP';
    case 'CURRENT_TIME': return 'CURRENT_TIME';
    case 'CURRENT_DATE': return 'CURRENT_DATE';
    default:
      if (defaultValue && Date.parse(defaultValue)) return new Date(defaultValue);
      return undefined;
  }
}