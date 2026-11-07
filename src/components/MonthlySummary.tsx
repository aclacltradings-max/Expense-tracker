import type { MonthlySummaryRow } from '../types';
import { monthLabel } from '../utils/date';
import { formatCurrency } from '../utils/format';

interface MonthlySummaryProps {
  rows: MonthlySummaryRow[];
}

/** Totals for every month that has activity, newest month first. */
export function MonthlySummary({ rows }: MonthlySummaryProps) {
  if (rows.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-slate-500">
        No monthly data yet. Add a transaction to build your first month.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      {/* Table for tablet/desktop */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">
                Month
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                Income
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                Expenses
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                Net
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.month} className="hover:bg-slate-50">
                <th scope="row" className="px-5 py-3.5 font-medium text-slate-800">
                  {monthLabel(row.month)}
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    {row.count} {row.count === 1 ? 'entry' : 'entries'}
                  </span>
                </th>
                <td className="px-5 py-3.5 text-right font-medium tabular-nums text-emerald-600">
                  {formatCurrency(row.income)}
                </td>
                <td className="px-5 py-3.5 text-right font-medium tabular-nums text-rose-600">
                  {formatCurrency(row.expenses)}
                </td>
                <td
                  className={`px-5 py-3.5 text-right font-semibold tabular-nums ${
                    row.balance >= 0 ? 'text-slate-800' : 'text-amber-700'
                  }`}
                >
                  {formatCurrency(row.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card list for mobile */}
      <ul className="divide-y divide-slate-100 sm:hidden">
        {rows.map((row) => (
          <li key={row.month} className="px-4 py-4">
            <div className="flex items-baseline justify-between">
              <p className="font-medium text-slate-800">{monthLabel(row.month)}</p>
              <p
                className={`font-semibold tabular-nums ${
                  row.balance >= 0 ? 'text-slate-800' : 'text-amber-700'
                }`}
              >
                {formatCurrency(row.balance)}
              </p>
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-emerald-50 px-3 py-2">
                <dt className="text-emerald-700/80">Income</dt>
                <dd className="mt-0.5 font-semibold tabular-nums text-emerald-700">
                  {formatCurrency(row.income)}
                </dd>
              </div>
              <div className="rounded-lg bg-rose-50 px-3 py-2">
                <dt className="text-rose-700/80">Expenses</dt>
                <dd className="mt-0.5 font-semibold tabular-nums text-rose-700">
                  {formatCurrency(row.expenses)}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
