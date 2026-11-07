import type { Summary } from '../types';
import { formatCurrency } from '../utils/format';
import { ArrowDownIcon, ArrowUpIcon, WalletIcon } from './icons';

interface SummaryCardsProps {
  summary: Summary;
}

/** Three headline figures: money in, money out and what is left. */
export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      key: 'income',
      label: 'Total Income',
      value: summary.income,
      icon: <ArrowUpIcon className="h-5 w-5" />,
      iconClass: 'bg-emerald-100 text-emerald-700',
      valueClass: 'text-emerald-700',
    },
    {
      key: 'expenses',
      label: 'Total Expenses',
      value: summary.expenses,
      icon: <ArrowDownIcon className="h-5 w-5" />,
      iconClass: 'bg-rose-100 text-rose-700',
      valueClass: 'text-rose-700',
    },
    {
      key: 'balance',
      label: 'Available Balance',
      value: summary.balance,
      icon: <WalletIcon className="h-5 w-5" />,
      iconClass:
        summary.balance >= 0 ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-700',
      valueClass: summary.balance >= 0 ? 'text-slate-900' : 'text-amber-700',
    },
  ];

  return (
    <section aria-label="Summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
      {cards.map((card) => (
        <article key={card.key} className="card p-5">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}
            >
              {card.icon}
            </span>
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
          </div>
          <p className={`mt-4 text-2xl font-bold tabular-nums sm:text-3xl ${card.valueClass}`}>
            {formatCurrency(card.value)}
          </p>
          {card.key === 'balance' && (
            <p className="mt-1 text-xs text-slate-400">
              {summary.count} transaction{summary.count === 1 ? '' : 's'} recorded
            </p>
          )}
        </article>
      ))}
    </section>
  );
}
