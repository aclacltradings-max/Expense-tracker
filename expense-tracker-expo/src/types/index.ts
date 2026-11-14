/** A single money movement — either money in (income) or money out (expense). */
export type TransactionType = 'income' | 'expense';

/** A named bucket a transaction belongs to, e.g. "Food" or "Salary". */
export interface Category {
  id: string;
  name: string;
  /** Categories are scoped to a transaction type so the picker only shows relevant options. */
  type: TransactionType;
  /** Custom categories are user-created and therefore deletable; defaults are not. */
  isCustom: boolean;
}

/** One logged income or expense entry. */
export interface Transaction {
  id: string;
  type: TransactionType;
  /** Always stored as a positive number; `type` carries the sign. */
  amount: number;
  categoryId: string;
  description: string;
  /** ISO date string in `YYYY-MM-DD` form. */
  date: string;
  /** ISO timestamp of when the record was created, used as a stable tie-breaker. */
  createdAt: string;
}

/** Draft shape used by the add/edit form before validation. */
export interface TransactionDraft {
  type: TransactionType;
  amount: string;
  categoryId: string;
  description: string;
  date: string;
}

/** Field-keyed validation errors for the transaction form. */
export type TransactionFormErrors = Partial<Record<keyof TransactionDraft, string>>;

/** All the filters the transaction list can apply at once. */
export interface TransactionFilters {
  search: string;
  type: 'all' | TransactionType;
  categoryId: string;
  from: string;
  to: string;
}

/** Aggregated totals used by the dashboard cards. */
export interface Summary {
  income: number;
  expenses: number;
  balance: number;
  count: number;
}

/** One row of the monthly summary table. */
export interface MonthlySummaryRow {
  /** `YYYY-MM` key. */
  month: string;
  income: number;
  expenses: number;
  balance: number;
  count: number;
}

/** Payload accepted by the create/update actions — ids and timestamps are generated. */
export type TransactionInput = Omit<Transaction, 'id' | 'createdAt'>;
