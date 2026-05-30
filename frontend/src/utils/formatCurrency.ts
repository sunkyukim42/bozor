export function formatCurrency(value: number, currency = 'UZS'): string {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value)} ${currency}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}
