import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Category, Transaction } from '../types';

/** Bump the version suffix whenever the persisted shape changes incompatibly. */
export const STORAGE_KEYS = {
  transactions: 'expense-tracker:transactions:v2',
  categories: 'expense-tracker:categories:v2',
} as const;

export interface PersistedState {
  transactions: Transaction[];
  categories: Category[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isValidTransaction(value: unknown): value is Transaction {
  if (!isRecord(value)) return false;
  const { id, type, amount, categoryId, description, date, createdAt } = value;
  return (
    typeof id === 'string' &&
    (type === 'income' || type === 'expense') &&
    typeof amount === 'number' &&
    Number.isFinite(amount) &&
    amount > 0 &&
    typeof categoryId === 'string' &&
    typeof description === 'string' &&
    typeof date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    typeof createdAt === 'string'
  );
}

function isValidCategory(value: unknown): value is Category {
  if (!isRecord(value)) return false;
  const { id, name, type, isCustom } = value;
  return (
    typeof id === 'string' &&
    typeof name === 'string' &&
    name.trim().length > 0 &&
    (type === 'income' || type === 'expense') &&
    typeof isCustom === 'boolean'
  );
}

/** Read and validate one collection. Corrupt, absent or unreadable data yields `null`. */
async function readArray<T>(key: string, guard: (value: unknown) => value is T): Promise<T[] | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(guard);
  } catch {
    return null;
  }
}

/** Load persisted transactions and categories, tolerating missing or corrupt values. */
export async function loadState(): Promise<Partial<PersistedState>> {
  const [transactions, categories] = await Promise.all([
    readArray(STORAGE_KEYS.transactions, isValidTransaction),
    readArray(STORAGE_KEYS.categories, isValidCategory),
  ]);

  return {
    transactions: transactions ?? undefined,
    categories: categories ?? undefined,
  };
}

/** Persist one collection. Failures are swallowed so the in-memory state keeps working. */
export async function saveCollection<T>(key: string, value: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Storage unavailable or full — the in-memory state still works. */
  }
}

/** Remove every key this app owns. Used by "clear all data". */
export async function clearAllStorage(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.transactions, STORAGE_KEYS.categories]);
  } catch {
    /* Nothing to do — the caller resets in-memory state regardless. */
  }
}
