import type {
  Category,
  MonthlySummaryRow,
  Summary,
  Transaction,
  TransactionFilters,
} from '../types';
import { compareMonth, isWithinRange, monthKey } from './date';

/** Sum income, expenses and the resulting balance. */
export function summarise(transactions: Transaction[]): Summary {
  let income = 0;
  let expenses = 0;

  for (const transaction of transactions) {
    if (transaction.type === 'income') income += transaction.amount;
    else expenses += transaction.amount;
  }

  return {
    income,
    expenses,
    balance: income - expenses,
    count: transactions.length,
  };
}

/**
 * Sort newest first. Dates are compared as strings (safe for ISO), then creation
 * time breaks ties so same-day entries keep a stable, predictable order.
 */
export function sortByNewest(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

/** Apply search, type, category and date-range filters together. */
export function applyFilters(
  transactions: Transaction[],
  filters: TransactionFilters,
): Transaction[] {
  const search = filters.search.trim().toLowerCase();

  return transactions.filter((transaction) => {
    if (filters.type !== 'all' && transaction.type !== filters.type) return false;
    if (filters.categoryId !== 'all' && transaction.categoryId !== filters.categoryId) return false;
    if (!isWithinRange(transaction.date, filters.from, filters.to)) return false;
    if (search && !transaction.description.toLowerCase().includes(search)) return false;
    return true;
  });
}

/** Group transactions into a per-month summary, newest month first. */
export function monthlySummary(transactions: Transaction[]): MonthlySummaryRow[] {
  const buckets = new Map<string, MonthlySummaryRow>();

  for (const transaction of transactions) {
    const month = monthKey(transaction.date);
    const row = buckets.get(month) ?? { month, income: 0, expenses: 0, balance: 0, count: 0 };
    if (transaction.type === 'income') row.income += transaction.amount;
    else row.expenses += transaction.amount;
    row.balance = row.income - row.expenses;
    row.count += 1;
    buckets.set(month, row);
  }

  return [...buckets.values()].sort((a, b) => compareMonth(b.month, a.month));
}

export interface CategoryBreakdown {
  categoryId: string;
  name: string;
  total: number;
}

/** Totals per category for a given type, largest first — feeds the breakdown chart. */
export function categoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  type: 'income' | 'expense',
): CategoryBreakdown[] {
  const nameById = new Map(categories.map((category) => [category.id, category.name]));
  const totals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.type !== type) continue;
    totals.set(
      transaction.categoryId,
      (totals.get(transaction.categoryId) ?? 0) + transaction.amount,
    );
  }

  return [...totals.entries()]
    .map(([categoryId, total]) => ({
      categoryId,
      name: nameById.get(categoryId) ?? 'Uncategorised',
      total,
    }))
    .sort((a, b) => b.total - a.total);
}

/** Chronological income/expense totals per month — feeds the trend chart. */
export function monthlyTrend(
  transactions: Transaction[],
  months = 6,
): { month: string; income: number; expenses: number }[] {
  const rows = monthlySummary(transactions)
    .slice()
    .sort((a, b) => compareMonth(a.month, b.month));

  return rows
    .slice(-months)
    .map(({ month, income, expenses }) => ({ month, income, expenses }));
}
