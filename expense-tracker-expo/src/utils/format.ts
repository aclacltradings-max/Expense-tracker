/**
 * Currency formatting.
 *
 * Implemented by hand rather than with `Intl.NumberFormat`: Hermes ships a
 * reduced Intl on Android and does not reliably support options such as
 * `notation: 'compact'`, so a manual formatter keeps output identical on every
 * device and in Expo Go.
 */

export const CURRENCY_SYMBOL = '₦';

/** Insert thousands separators into the integer part of a fixed-decimal string. */
function groupThousands(value: string): string {
  const [whole, fraction] = value.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction ? `${grouped}.${fraction}` : grouped;
}

/** `₦12,500.00` — the standard display for amounts. */
export function formatCurrency(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  const fixed = Math.abs(safe).toFixed(2);
  const sign = safe < 0 ? '-' : '';
  return `${sign}${CURRENCY_SYMBOL}${groupThousands(fixed)}`;
}

/** `₦12.5K` — short form for tight spaces such as summary cards. */
export function formatCompactCurrency(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  const sign = safe < 0 ? '-' : '';
  const absolute = Math.abs(safe);

  if (absolute >= 1_000_000_000) {
    return `${sign}${CURRENCY_SYMBOL}${(absolute / 1_000_000_000).toFixed(1)}B`;
  }
  if (absolute >= 1_000_000) {
    return `${sign}${CURRENCY_SYMBOL}${(absolute / 1_000_000).toFixed(1)}M`;
  }
  if (absolute >= 1_000) {
    return `${sign}${CURRENCY_SYMBOL}${(absolute / 1_000).toFixed(1)}K`;
  }
  return formatCurrency(safe);
}

/** Signed form for transaction rows: `+₦5,000.00` / `-₦1,200.00`. */
export function formatSignedCurrency(value: number, type: 'income' | 'expense'): string {
  const sign = type === 'income' ? '+' : '-';
  return `${sign}${formatCurrency(Math.abs(value))}`;
}

/** `42%` — used by the category breakdown bars. */
export function formatPercent(value: number, total: number): string {
  if (total <= 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}
