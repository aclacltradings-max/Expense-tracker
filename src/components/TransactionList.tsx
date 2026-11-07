import type { Category, Transaction } from '../types';
import { formatDate } from '../utils/date';
import { formatSignedCurrency } from '../utils/format';
import { PencilIcon, TrashIcon } from './icons';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

/** Newest-first list of transactions, colour-coded by type. */
export function TransactionList({
  transactions,
  categories,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const categoryName = (id: string) =>
    categories.find((category) => category.id === id)?.name ?? 'Uncategorised';

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <p className="text-base font-semibold text-slate-700">No transactions found</p>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Nothing matches your current filters. Add a transaction or clear the filters to see more.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      {transactions.map((transaction) => {
        const isIncome = transaction.type === 'income';
        return (
          <li
            key={transaction.id}
            className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50 sm:gap-4 sm:px-5"
          >
            <span
              aria-hidden="true"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                isIncome ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}
            >
              {isIncome ? '↓' : '↑'}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-900">{transaction.description}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                  {categoryName(transaction.categoryId)}
                </span>
                <span>{formatDate(transaction.date)}</span>
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <span
                className={`text-right text-sm font-semibold tabular-nums sm:text-base ${
                  isIncome ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatSignedCurrency(transaction.amount, transaction.type)}
              </span>

              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => onEdit(transaction)}
                  aria-label={`Edit ${transaction.description}`}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-brand-700"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(transaction)}
                  aria-label={`Delete ${transaction.description}`}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
