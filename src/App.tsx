import { Suspense, lazy, useMemo, useState } from 'react';
import { SummaryCards } from './components/SummaryCards';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { FilterBar, EMPTY_FILTERS } from './components/FilterBar';
import { MonthlySummary } from './components/MonthlySummary';
import { Modal } from './components/ui/Modal';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { PwaToasts } from './components/PwaToasts';
import { DownloadIcon, PlusIcon } from './components/icons';
import { useExpenseTracker } from './hooks/useExpenseTracker';
import { usePwa } from './hooks/usePwa';
import { applyFilters, monthlySummary, sortByNewest, summarise } from './utils/calculations';
import type { Transaction, TransactionFilters } from './types';

// Recharts is heavy; load it on demand so the dashboard paints immediately.
const ChartsPanel = lazy(() =>
  import('./components/ChartsPanel').then((module) => ({ default: module.ChartsPanel })),
);

function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {[0, 1].map((key) => (
        <div key={key} className="card h-72 animate-pulse bg-slate-100" aria-hidden="true" />
      ))}
    </div>
  );
}

export default function App() {
  const {
    transactions,
    categories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    deleteCategory,
    clearAll,
  } = useExpenseTracker();
  const pwa = usePwa();

  const [filters, setFilters] = useState<TransactionFilters>(EMPTY_FILTERS);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const summary = useMemo(() => summarise(transactions), [transactions]);
  const months = useMemo(() => monthlySummary(transactions), [transactions]);
  const visibleTransactions = useMemo(
    () => sortByNewest(applyFilters(transactions, filters)),
    [transactions, filters],
  );

  function openAddForm() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEditForm(transaction: Transaction) {
    setEditing(transaction);
    setFormOpen(true);
  }

  function handleSubmit(draft: Omit<Transaction, 'id' | 'createdAt'>) {
    if (editing) updateTransaction(editing.id, draft);
    else addTransaction(draft);
    setFormOpen(false);
    setEditing(null);
  }

  function handleConfirmDelete() {
    if (pendingDelete) deleteTransaction(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-700 text-lg font-bold text-white">
              ₦
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900 sm:text-base">Expense Tracker</p>
              <p className="hidden text-xs text-slate-500 sm:block">Know where your money goes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {transactions.length > 0 && (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="btn btn-ghost hidden sm:inline-flex"
              >
                Clear data
              </button>
            )}
            {pwa.canInstall && (
              <button
                type="button"
                onClick={() => void pwa.install()}
                className="btn btn-ghost hidden sm:inline-flex"
                title="Install Expense Tracker as an app"
              >
                <DownloadIcon className="h-4 w-4" />
                Install app
              </button>
            )}
            <button type="button" onClick={openAddForm} className="btn btn-primary">
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Add transaction</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8">
        {/* Dashboard */}
        <section aria-labelledby="dashboard-heading">
          <h1 id="dashboard-heading" className="mb-4 text-xl font-bold text-slate-900 sm:text-2xl">
            Dashboard
          </h1>
          <SummaryCards summary={summary} />
        </section>

        {/* Charts */}
        <section aria-labelledby="charts-heading">
          <h2 id="charts-heading" className="mb-4 text-lg font-semibold text-slate-900">
            Insights
          </h2>
          <Suspense fallback={<ChartsSkeleton />}>
            <ChartsPanel transactions={transactions} categories={categories} />
          </Suspense>
        </section>

        {/* Monthly summary */}
        <section aria-labelledby="monthly-heading">
          <h2 id="monthly-heading" className="mb-4 text-lg font-semibold text-slate-900">
            Monthly summary
          </h2>
          <MonthlySummary rows={months} />
        </section>

        {/* Transactions */}
        <section aria-labelledby="transactions-heading" className="space-y-4">
          <h2 id="transactions-heading" className="text-lg font-semibold text-slate-900">
            Transactions
          </h2>
          <FilterBar
            filters={filters}
            categories={categories}
            resultCount={visibleTransactions.length}
            onChange={setFilters}
            onReset={() => setFilters(EMPTY_FILTERS)}
          />
          <TransactionList
            transactions={visibleTransactions}
            categories={categories}
            onEdit={openEditForm}
            onDelete={setPendingDelete}
          />
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-2 text-center text-xs text-slate-400 sm:px-6">
        All data is stored locally in your browser. Nothing is sent to a server.
      </footer>

      {/* Floating add button for mobile */}
      <button
        type="button"
        onClick={openAddForm}
        aria-label="Add transaction"
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg transition hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:hidden"
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      {/* Add / edit modal */}
      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit transaction' : 'Add transaction'}
        description={
          editing ? 'Update the details and save your changes.' : 'Record money in or money out.'
        }
        size="lg"
      >
        <TransactionForm
          editing={editing}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditing(null);
          }}
          onAddCategory={addCategory}
          onDeleteCategory={deleteCategory}
        />
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this transaction?"
        message={
          pendingDelete ? (
            <>
              “{pendingDelete.description}” will be permanently removed. This cannot be undone.
            </>
          ) : null
        }
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      {/* Clear-all confirmation */}
      <ConfirmDialog
        open={confirmClear}
        title="Clear all data?"
        message="Every transaction will be permanently deleted from this browser. This cannot be undone."
        confirmLabel="Clear everything"
        onConfirm={() => {
          clearAll();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />

      {/* Offline-ready notice and new-version prompt */}
      <PwaToasts pwa={pwa} />
    </div>
  );
}
