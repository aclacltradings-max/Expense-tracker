import { useMemo, useState } from 'react';
import type { Category, TransactionType } from '../types';
import { validateCategoryName } from '../utils/validation';

interface CategorySelectProps {
  id: string;
  label: string;
  value: string;
  type: TransactionType;
  categories: Category[];
  error?: string;
  onChange: (categoryId: string) => void;
  onAddCategory: (name: string, type: TransactionType) => Category;
  onDeleteCategory: (id: string) => void;
}

/**
 * Category picker with inline "add new" support. Custom categories can be
 * removed; the shipped defaults cannot.
 */
export function CategorySelect({
  id,
  label,
  value,
  type,
  categories,
  error,
  onChange,
  onAddCategory,
  onDeleteCategory,
}: CategorySelectProps) {
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const options = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  );
  const selected = options.find((category) => category.id === value);

  function submitNewCategory() {
    const error = validateCategoryName(
      draftName,
      categories.map((category) => category.name),
    );
    if (error) {
      setNameError(error);
      return;
    }
    const created = onAddCategory(draftName, type);
    onChange(created.id);
    setDraftName('');
    setNameError(null);
    setAdding(false);
  }

  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
      </label>

      {!adding ? (
        <div className="flex gap-2">
          <select
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={`field-input ${error ? 'field-input-error' : ''}`}
          >
            <option value="">Select a category…</option>
            {options.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="btn btn-secondary shrink-0 px-3"
            aria-label="Add a new category"
          >
            New
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-300 bg-slate-50 p-3">
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              value={draftName}
              onChange={(event) => {
                setDraftName(event.target.value);
                setNameError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  submitNewCategory();
                }
              }}
              placeholder="New category name"
              maxLength={32}
              className={`field-input ${nameError ? 'field-input-error' : ''}`}
              aria-label="New category name"
            />
            <button type="button" onClick={submitNewCategory} className="btn btn-primary shrink-0">
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setDraftName('');
                setNameError(null);
              }}
              className="btn btn-ghost shrink-0"
            >
              Cancel
            </button>
          </div>
          {nameError && <p className="mt-1.5 text-xs font-medium text-rose-600">{nameError}</p>}
        </div>
      )}

      {selected?.isCustom && !adding && (
        <button
          type="button"
          onClick={() => {
            onDeleteCategory(selected.id);
            onChange('');
          }}
          className="mt-1.5 text-xs font-medium text-slate-400 underline-offset-2 hover:text-rose-600 hover:underline"
        >
          Remove “{selected.name}” category
        </button>
      )}

      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
