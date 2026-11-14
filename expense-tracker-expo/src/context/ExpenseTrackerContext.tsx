import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Category, Transaction, TransactionInput, TransactionType } from '../types';
import { DEFAULT_CATEGORIES } from '../utils/constants';
import {
  STORAGE_KEYS,
  clearAllStorage,
  loadState,
  saveCollection,
} from '../utils/storage';

/** Create a reasonably unique id without pulling in a dependency. */
function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

interface ExpenseTrackerContextValue {
  transactions: Transaction[];
  categories: Category[];
  /** `true` until the first AsyncStorage read resolves. */
  isHydrating: boolean;
  categoriesFor: (type: TransactionType) => Category[];
  addTransaction: (input: TransactionInput) => Transaction;
  updateTransaction: (id: string, input: TransactionInput) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (name: string, type: TransactionType) => Category;
  deleteCategory: (id: string) => void;
  clearTransactions: () => void;
  resetEverything: () => Promise<void>;
}

const ExpenseTrackerContext = createContext<ExpenseTrackerContextValue | null>(null);

/**
 * Owns all persisted app state: transactions and categories.
 *
 * AsyncStorage is asynchronous, so unlike the web version the first render
 * happens before data arrives. `isHydrating` lets screens show a spinner
 * instead of flashing an empty dashboard, and the hydration write-back is
 * suppressed so we never overwrite stored data with the initial empty arrays.
 */
export function ExpenseTrackerProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isHydrating, setIsHydrating] = useState(true);
  const hasHydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const persisted = await loadState();
      if (cancelled) return;

      if (persisted.transactions) setTransactions(persisted.transactions);
      // Seed defaults only when nothing was ever stored.
      if (persisted.categories) setCategories(persisted.categories);

      hasHydrated.current = true;
      setIsHydrating(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on change, but only once hydration has finished.
  useEffect(() => {
    if (!hasHydrated.current) return;
    void saveCollection(STORAGE_KEYS.transactions, transactions);
  }, [transactions]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    void saveCollection(STORAGE_KEYS.categories, categories);
  }, [categories]);

  const addTransaction = useCallback((input: TransactionInput) => {
    const transaction: Transaction = {
      ...input,
      id: createId('txn'),
      createdAt: new Date().toISOString(),
    };
    setTransactions((current) => [transaction, ...current]);
    return transaction;
  }, []);

  const updateTransaction = useCallback((id: string, input: TransactionInput) => {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === id ? { ...transaction, ...input } : transaction,
      ),
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((current) => current.filter((transaction) => transaction.id !== id));
  }, []);

  const addCategory = useCallback((name: string, type: TransactionType) => {
    const category: Category = { id: createId('cat'), name: name.trim(), type, isCustom: true };
    setCategories((current) => [...current, category]);
    return category;
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories((current) =>
      current.filter((category) => category.id !== id || !category.isCustom),
    );
  }, []);

  const clearTransactions = useCallback(() => {
    setTransactions([]);
  }, []);

  const resetEverything = useCallback(async () => {
    await clearAllStorage();
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
  }, []);

  const categoriesFor = useCallback(
    (type: TransactionType) => categories.filter((category) => category.type === type),
    [categories],
  );

  const value = useMemo<ExpenseTrackerContextValue>(
    () => ({
      transactions,
      categories,
      isHydrating,
      categoriesFor,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      deleteCategory,
      clearTransactions,
      resetEverything,
    }),
    [
      transactions,
      categories,
      isHydrating,
      categoriesFor,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      deleteCategory,
      clearTransactions,
      resetEverything,
    ],
  );

  return <ExpenseTrackerContext.Provider value={value}>{children}</ExpenseTrackerContext.Provider>;
}

/** Access the shared expense tracker store. Must be used inside the provider. */
export function useExpenseTracker(): ExpenseTrackerContextValue {
  const context = useContext(ExpenseTrackerContext);
  if (!context) {
    throw new Error('useExpenseTracker must be used within an ExpenseTrackerProvider');
  }
  return context;
}
