/**
 * Central design tokens. Keeping colours and spacing in one place makes the
 * screens consistent and lets the palette be retuned without hunting through
 * every StyleSheet.
 */

export const colors = {
  // Brand (teal, matches the web app's brand-700)
  brand: '#0f766e',
  brandDark: '#115e59',
  brandLight: '#ccfbf1',
  brandTint: '#f0fdfa',

  // Semantic
  income: '#047857',
  incomeLight: '#d1fae5',
  expense: '#be123c',
  expenseLight: '#ffe4e6',

  // Neutrals
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',
  text: '#0f172a',
  textMuted: '#64748b',
  textFaint: '#94a3b8',

  // Feedback
  warning: '#b45309',
  warningLight: '#fef3c7',
  danger: '#e11d48',
  dangerLight: '#fff1f2',
  overlay: 'rgba(15, 23, 42, 0.45)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

/** Distinct hues used for category dots and the breakdown bars. */
export const chartColors = [
  '#0f766e',
  '#f97316',
  '#2563eb',
  '#db2777',
  '#65a30d',
  '#9333ea',
  '#dc2626',
  '#0891b2',
  '#ca8a04',
  '#4f46e5',
  '#059669',
  '#be123c',
];

/** Pick a stable colour for a category by its index. */
export function colorForIndex(index: number): string {
  return chartColors[index % chartColors.length];
}
