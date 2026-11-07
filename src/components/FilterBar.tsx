import type { Category, TransactionFilters } from '../types';
import { FilterIcon, SearchIcon } from './icons';

interface FilterBarProps {
  filters: TransactionFilters;
  categories: Category[];
  resultCount: number;
  onChange: (filters: TransactionFilters) => void;
  onReset: () => void;
}

export const EMPTY_FILTERS: TransactionFilters = {
  search: '',
  type: 'all',
  categoryId: 'all',
  from: '',
  to: '',
};

/** Search + type + category + date-range controls for the transaction list. */
export function FilterBar({ filters, categories, resultCount, onChange, onReset }: FilterBarProps) {
  const isFiltered =
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.categoryId !== 'all' ||
    filters.from !== '' ||
    filters.to !== '';

  const visibleCategories =
    filters.type === 'all' ? categories : categories.filter((category) => category.type === filters.type);

  function patch(changes: Partial<TransactionFilters>) {
    onChange({ ...filters, ...changes });
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <FilterIcon className="h-4 w-4 text-slate-400" />
          Search &amp; filter
        </h3>
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-brand-700 underline-offset-2 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="sm:col-span-2 lg:col-span-2">
          <label className="sr-only" htmlFor="search">
            Search descriptions
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="search"
              type="search"
              value={filters.search}
              onChange={(event) => patch({ search: event.target.value })}
              placeholder="Search descriptions…"
              className="field-input pl-9"
            />
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="sr-only" htmlFor="filter-type">
            Filter by type
          </label>
          <select
            id="filter-type"
            value={filters.type}
            onChange={(event) =>
              patch({ type: event.target.value as TransactionFilters['type'], categoryId: 'all' })
            }
            className="field-input"
          >
            <option value="all">All types</option>
            <option value="income">Income only</option>
            <option value="expense">Expenses only</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="sr-only" htmlFor="filter-category">
            Filter by category
          </label>
          <select
            id="filter-category"
            value={filters.categoryId}
            onChange={(event) => patch({ categoryId: event.target.value })}
            className="field-input"
          >
            <option value="all">All categories</option>
            {visibleCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1">
          <div>
            <label className="sr-only" htmlFor="filter-from">
              From date
            </label>
            <input
              id="filter-from"
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(event) => patch({ from: event.target.value })}
              className="field-input"
              title="From date"
            />
          </div>
          <div>
            <label className="sr-only" htmlFor="filter-to">
              To date
            </label>
            <input
              id="filter-to"
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(event) => patch({ to: event.target.value })}
              className="field-input"
              title="To date"
            />
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500" aria-live="polite">
        Showing <span className="font-semibold text-slate-700">{resultCount}</span>{' '}
        {resultCount === 1 ? 'transaction' : 'transactions'}
        {isFiltered ? ' matching your filters.' : '.'}
      </p>
    </div>
  );
}
