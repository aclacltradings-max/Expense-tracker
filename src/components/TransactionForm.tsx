import { useEffect, useMemo, useState } from 'react';
import type {
  Category,
  Transaction,
  TransactionDraft,
  TransactionFormErrors,
  TransactionType,
} from '../types';
import { todayISO } from '../utils/date';
import { validateTransaction } from '../utils/validation';
import { CategorySelect } from './CategorySelect';

interface TransactionFormProps {
  /** When present the form edits this transaction; otherwise it creates a new one. */
  editing?: Transaction | null;
  categories: Category[];
  onSubmit: (draft: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  onAddCategory: (name: string, type: TransactionType) => Category;
  onDeleteCategory: (id: string) => void;
}

function emptyDraft(): TransactionDraft {
  return { type: 'expense', amount: '', categoryId: '', description: '', date: todayISO() };
}

function draftFromTransaction(transaction: Transaction): TransactionDraft {
  return {
    type: transaction.type,
    amount: String(transaction.amount),
    categoryId: transaction.categoryId,
    description: transaction.description,
    date: transaction.date,
  };
}

/**
 * Add/edit form for a single transaction. Validation runs on submit and then
 * live-updates each field once it has been touched, so errors clear as the user
 * fixes them.
 */
export function TransactionForm({
  editing,
  categories,
  onSubmit,
  onCancel,
  onAddCategory,
  onDeleteCategory,
}: TransactionFormProps) {
  const [draft, setDraft] = useState<TransactionDraft>(() =>
    editing ? draftFromTransaction(editing) : emptyDraft(),
  );
  const [errors, setErrors] = useState<TransactionFormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Re-seed the form when the target transaction changes (e.g. switching edit rows).
  useEffect(() => {
    setDraft(editing ? draftFromTransaction(editing) : emptyDraft());
    setErrors({});
    setSubmitted(false);
  }, [editing]);

  const availableCategoryIds = useMemo(
    () => categories.filter((category) => category.type === draft.type).map((category) => category.id),
    [categories, draft.type],
  );

  // Live re-validate after the first submit attempt.
  useEffect(() => {
    if (submitted) setErrors(validateTransaction(draft, availableCategoryIds));
  }, [draft, availableCategoryIds, submitted]);

  function setField<K extends keyof TransactionDraft>(key: K, value: TransactionDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleTypeChange(type: TransactionType) {
    setDraft((current) => ({ ...current, type, categoryId: '' }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validateTransaction(draft, availableCategoryIds);
    setErrors(nextErrors);
    setSubmitted(true);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      type: draft.type,
      amount: Math.round(Number(draft.amount) * 100) / 100,
      categoryId: draft.categoryId,
      description: draft.description.trim(),
      date: draft.date,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Type toggle */}
      <div>
        <span className="field-label">Type</span>
        <div
          role="radiogroup"
          aria-label="Transaction type"
          className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1"
        >
          {(['expense', 'income'] as const).map((option) => {
            const active = draft.type === option;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => handleTypeChange(option)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                  active
                    ? option === 'income'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'bg-white text-rose-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="field-label" htmlFor="amount">
          Amount
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm font-medium text-slate-400">
            ₦
          </span>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            value={draft.amount}
            onChange={(event) => setField('amount', event.target.value)}
            placeholder="0.00"
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? 'amount-error' : undefined}
            className={`field-input pl-8 ${errors.amount ? 'field-input-error' : ''}`}
          />
        </div>
        {errors.amount && (
          <p id="amount-error" className="mt-1.5 text-xs font-medium text-rose-600">
            {errors.amount}
          </p>
        )}
      </div>

      <CategorySelect
        id="categoryId"
        label="Category"
        value={draft.categoryId}
        type={draft.type}
        categories={categories}
        error={errors.categoryId}
        onChange={(categoryId) => setField('categoryId', categoryId)}
        onAddCategory={onAddCategory}
        onDeleteCategory={onDeleteCategory}
      />

      {/* Description */}
      <div>
        <label className="field-label" htmlFor="description">
          Description
        </label>
        <input
          id="description"
          type="text"
          value={draft.description}
          onChange={(event) => setField('description', event.target.value)}
          placeholder="e.g. Weekly grocery run"
          maxLength={120}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'description-error' : undefined}
          className={`field-input ${errors.description ? 'field-input-error' : ''}`}
        />
        {errors.description && (
          <p id="description-error" className="mt-1.5 text-xs font-medium text-rose-600">
            {errors.description}
          </p>
        )}
      </div>

      {/* Date */}
      <div>
        <label className="field-label" htmlFor="date">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={draft.date}
          max={todayISO()}
          onChange={(event) => setField('date', event.target.value)}
          aria-invalid={Boolean(errors.date)}
          aria-describedby={errors.date ? 'date-error' : undefined}
          className={`field-input ${errors.date ? 'field-input-error' : ''}`}
        />
        {errors.date && (
          <p id="date-error" className="mt-1.5 text-xs font-medium text-rose-600">
            {errors.date}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {editing ? 'Save changes' : 'Add transaction'}
        </button>
      </div>
    </form>
  );
}
