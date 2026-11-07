import type { Category } from '../types';

/**
 * Default categories ship with the app. They are seeded on first run and cannot
 * be deleted, so users always have a sensible starting point.
 */
export const DEFAULT_CATEGORIES: Category[] = [
  // Income
  { id: 'income-salary', name: 'Salary', type: 'income', isCustom: false },
  { id: 'income-freelance', name: 'Freelance', type: 'income', isCustom: false },
  { id: 'income-business', name: 'Business', type: 'income', isCustom: false },
  { id: 'income-investments', name: 'Investments', type: 'income', isCustom: false },
  { id: 'income-gifts', name: 'Gifts', type: 'income', isCustom: false },
  { id: 'income-other', name: 'Other Income', type: 'income', isCustom: false },
  // Expenses
  { id: 'expense-food', name: 'Food & Groceries', type: 'expense', isCustom: false },
  { id: 'expense-transport', name: 'Transport', type: 'expense', isCustom: false },
  { id: 'expense-housing', name: 'Rent & Bills', type: 'expense', isCustom: false },
  { id: 'expense-shopping', name: 'Shopping', type: 'expense', isCustom: false },
  { id: 'expense-health', name: 'Health', type: 'expense', isCustom: false },
  { id: 'expense-airtime', name: 'Airtime & Data', type: 'expense', isCustom: false },
  { id: 'expense-education', name: 'Education', type: 'expense', isCustom: false },
  { id: 'expense-entertainment', name: 'Entertainment', type: 'expense', isCustom: false },
  { id: 'expense-savings', name: 'Savings', type: 'expense', isCustom: false },
  { id: 'expense-other', name: 'Other', type: 'expense', isCustom: false },
];

/** Distinct, accessible hues used for chart slices and category dots. */
export const CHART_COLORS = [
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
