import type { TransactionDraft, TransactionFormErrors } from '../types';
import { todayISO } from './date';

/** Largest amount we accept, to catch obvious typos and keep totals sane. */
export const MAX_AMOUNT = 1_000_000_000;

/** Validate a transaction form draft and return a field-keyed error map. */
export function validateTransaction(
  draft: TransactionDraft,
  availableCategoryIds: string[],
): TransactionFormErrors {
  const errors: TransactionFormErrors = {};

  const description = draft.description.trim();
  if (!description) {
    errors.description = 'Description is required.';
  } else if (description.length < 2) {
    errors.description = 'Use at least 2 characters.';
  } else if (description.length > 120) {
    errors.description = 'Keep the description under 120 characters.';
  }

  const rawAmount = draft.amount.trim();
  if (!rawAmount) {
    errors.amount = 'Amount is required.';
  } else if (!/^\d*\.?\d+$/.test(rawAmount)) {
    errors.amount = 'Enter a valid number, e.g. 1500.50.';
  } else {
    const amount = Number(rawAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.amount = 'Amount must be greater than zero.';
    } else if (amount > MAX_AMOUNT) {
      errors.amount = 'That amount looks too large.';
    }
  }

  if (!draft.categoryId) {
    errors.categoryId = 'Pick a category.';
  } else if (!availableCategoryIds.includes(draft.categoryId)) {
    errors.categoryId = 'Choose a valid category for this type.';
  }

  if (!draft.date) {
    errors.date = 'Date is required.';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) {
    errors.date = 'Use a valid date.';
  } else if (draft.date > todayISO()) {
    errors.date = 'Date cannot be in the future.';
  }

  return errors;
}

/** Validate a new custom category name. Returns an error string or `null` when valid. */
export function validateCategoryName(name: string, existingNames: string[]): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Category name is required.';
  if (trimmed.length < 2) return 'Use at least 2 characters.';
  if (trimmed.length > 32) return 'Keep the name under 32 characters.';
  const clash = existingNames.some((existing) => existing.toLowerCase() === trimmed.toLowerCase());
  if (clash) return 'That category already exists.';
  return null;
}
