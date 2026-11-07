import { useMemo, useState } from 'react';
import type { Category, Transaction, TransactionType } from '../types';
import { categoryBreakdown, monthlyTrend } from '../utils/calculations';
import { shortMonthLabel } from '../utils/date';
import { formatCompactCurrency, formatCurrency, formatPercent } from '../utils/format';
import { CHART_COLORS } from '../utils/constants';
import { ChartIcon } from './icons';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface ChartsPanelProps {
  transactions: Transaction[];
  categories: Category[];
}

type BreakdownType = Extract<TransactionType, 'expense' | 'income'>;

/** Two lightweight Recharts visuals: monthly trend and category breakdown. */
export function ChartsPanel({ transactions, categories }: ChartsPanelProps) {
  const [breakdownType, setBreakdownType] = useState<BreakdownType>('expense');

  const trendData = useMemo(
    () =>
      monthlyTrend(transactions, 6).map((row) => ({
        ...row,
        label: shortMonthLabel(row.month),
      })),
    [transactions],
  );

  const breakdownData = useMemo(
    () => categoryBreakdown(transactions, categories, breakdownType),
    [transactions, categories, breakdownType],
  );

  const breakdownTotal = breakdownData.reduce((sum, row) => sum + row.total, 0);
  const hasTrend = trendData.some((row) => row.income > 0 || row.expenses > 0);
  const hasBreakdown = breakdownData.length > 0;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {/* Monthly trend */}
      <section className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <ChartIcon className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">Monthly trend</h3>
          <span className="ml-auto text-xs text-slate-400">Last 6 months</span>
        </div>

        {hasTrend ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(value: number) => formatCompactCurrency(value)}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Bar dataKey="income" name="Income" fill="#0d9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart message="Add transactions to see your monthly trend." />
        )}
      </section>

      {/* Category breakdown */}
      <section className="card p-5">
        <div className="mb-4 flex items-center gap-2">
          <ChartIcon className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">By category</h3>
          <div className="ml-auto inline-flex rounded-lg bg-slate-100 p-0.5">
            {(['expense', 'income'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setBreakdownType(option)}
                className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition ${
                  breakdownType === option
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {hasBreakdown ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-56 w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdownData}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={2}
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={entry.categoryId} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${formatCurrency(value)} (${formatPercent(value, breakdownTotal)})`,
                      name,
                    ]}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="w-full space-y-2 sm:w-1/2">
              {breakdownData.map((row, index) => (
                <li key={row.categoryId} className="flex items-center gap-2 text-sm">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate text-slate-600">{row.name}</span>
                  <span className="font-semibold tabular-nums text-slate-800">
                    {formatCurrency(row.total)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyChart message={`No ${breakdownType} data to break down yet.`} />
        )}
      </section>
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-400">
      {message}
    </div>
  );
}
