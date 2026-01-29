export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function Row({
  label,
  value,
  suffix,
  formatValue = formatCurrency,
}: {
  label: string;
  value: number;
  suffix?: string;
  formatValue?: (n: number) => string;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-900 font-medium">
        {formatValue(value)}
        {suffix ?? ''}
      </span>
    </div>
  );
}
