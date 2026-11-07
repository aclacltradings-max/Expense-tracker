import { useCallback, useMemo } from 'react';
import type { Category, Transaction, TransactionType } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import { STORAGE_KEYS, loadState } from '../utils/storage';
import { useLocalStorage } from './useLocalStorage';

/** Create a reasonably unique id without pulling in a dependency. */
function createId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}-${random}`;
}

/**
 * Owns all persisted app state: transactions and categories.
 *
 * Persisted data is read once, at hook creation, so the very first render is
 * already correct — no empty flash before localStorage hydrates.
 */
export function useExpenseTracker() {
  const initial = useMemo(() => loadState(), []);
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(
    STORAGE_KEYS.transactions,
    initial.transactions ?? [],
  );
  const [categories, setCategories] = useLocalStorage<Category[]>(
    STORAGE_KEYS.categories,
    initial.categories ?? DEFAULT_CATEGORIES,
  );

  const addTransaction = useCallback(
    (draft: Omit<Transaction, 'id' | 'createdAt'>) => {
      const transaction: Transaction = {
        ...draft,
        id: createId('txn'),
        createdAt: new Date().toISOString(),
      };
      setTransactions((current) => [transaction, ...current]);
      return transaction;
    },
    [setTransactions],
  );

  const updateTransaction = useCallback(
    (id: string, changes: Omit<Transaction, 'id' | 'createdAt'>) => {
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.id === id ? { ...transaction, ...changes } : transaction,
        ),
      );
    },
    [setTransactions],
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions((current) => current.filter((transaction) => transaction.id !== id));
    },
    [setTransactions],
  );

  const addCategory = useCallback(
    (name: string, type: TransactionType) => {
      const category: Category = { id: createId('cat'), name: name.trim(), type, isCustom: true };
      setCategories((current) => [...current, category]);
      return category;
    },
    [setCategories],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((current) =>
        current.filter((category) => category.id !== id || !category.isCustom),
      );
    },
    [setCategories],
  );

  const categoriesFor = useCallback(
    (type: TransactionType) => categories.filter((category) => category.type === type),
    [categories],
  );

  const clearAll = useCallback(() => {
    setTransactions([]);
  }, [setTransactions]);

  return {
    transactions,
    categories,
    categoriesFor,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    clearAll,
  };
}

export type ExpenseTrackerApi = ReturnType<typeof useExpenseTracker>;
