import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Category, Transaction } from '../types';
import { categoryBreakdown, monthlyTrend } from '../utils/calculations';
import { formatCompactCurrency, formatCurrency, formatPercent } from '../utils/format';
import { shortMonthLabel } from '../utils/date';
import { colorForIndex, colors, radius, spacing } from '../theme';
import { Card } from './ui/Card';

interface InsightsPanelProps {
  transactions: Transaction[];
  categories: Category[];
}

/**
 * Spending/earning breakdown by category plus a 6-month trend.
 *
 * Implemented with plain views and bars rather than a charting library: it keeps
 * the bundle small, renders identically in Expo Go, and reads well on a phone.
 */
export function InsightsPanel({ transactions, categories }: InsightsPanelProps) {
  const [mode, setMode] = useState<'expense' | 'income'>('expense');

  const breakdown = useMemo(
    () => categoryBreakdown(transactions, categories, mode),
    [transactions, categories, mode],
  );
  const trend = useMemo(() => monthlyTrend(transactions, 6), [transactions]);

  const total = breakdown.reduce((sum, row) => sum + row.total, 0);
  const peak = Math.max(1, ...trend.map((row) => Math.max(row.income, row.expenses)));

  return (
    <View style={styles.stack}>
      <Card>
        <View style={styles.header}>
          <Text style={styles.title}>By category</Text>
          <View style={styles.toggle}>
            {(['expense', 'income'] as const).map((option) => {
              const active = mode === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setMode(option)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  style={[styles.toggleOption, active && styles.toggleOptionActive]}
                >
                  <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
                    {option === 'expense' ? 'Expenses' : 'Income'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {breakdown.length === 0 ? (
          <Text style={styles.empty}>
            No {mode === 'expense' ? 'expenses' : 'income'} recorded yet.
          </Text>
        ) : (
          <View style={styles.bars}>
            {breakdown.slice(0, 8).map((row, index) => (
              <View key={row.categoryId} style={styles.barRow}>
                <View style={styles.barLabelRow}>
                  <View style={styles.barLabelLeft}>
                    <View style={[styles.dot, { backgroundColor: colorForIndex(index) }]} />
                    <Text style={styles.barName} numberOfLines={1}>
                      {row.name}
                    </Text>
                  </View>
                  <Text style={styles.barValue}>{formatCurrency(row.total)}</Text>
                </View>

                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${total > 0 ? Math.max(2, (row.total / total) * 100) : 0}%`,
                        backgroundColor: colorForIndex(index),
                      },
                    ]}
                  />
                </View>

                <Text style={styles.barPercent}>{formatPercent(row.total, total)}</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.title}>Last 6 months</Text>

        {trend.length === 0 ? (
          <Text style={styles.empty}>Add transactions to see your monthly trend.</Text>
        ) : (
          <>
            <View style={styles.legend}>
              <Legend color={colors.income} label="Income" />
              <Legend color={colors.expense} label="Expenses" />
            </View>

            <View style={styles.chart}>
              {trend.map((row) => (
                <View key={row.month} style={styles.column}>
                  <Text style={styles.columnValue}>
                    {formatCompactCurrency(Math.max(row.income, row.expenses))}
                  </Text>
                  <View style={styles.columnBars}>
                    <View
                      style={[
                        styles.columnBar,
                        {
                          height: Math.max(3, (row.income / peak) * 100),
                          backgroundColor: colors.income,
                        },
                      ]}
                    />
                    <View
                      style={[
                        styles.columnBar,
                        {
                          height: Math.max(3, (row.expenses / peak) * 100),
                          backgroundColor: colors.expense,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.columnLabel}>{shortMonthLabel(row.month)}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </Card>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  toggle: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: radius.sm, padding: 3 },
  toggleOption: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm - 2 },
  toggleOptionActive: { backgroundColor: colors.surface },
  toggleText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  toggleTextActive: { color: colors.text },
  empty: { fontSize: 13, color: colors.textMuted },
  bars: { gap: spacing.md },
  barRow: { gap: 5 },
  barLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  barLabelLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  dot: { width: 10, height: 10, borderRadius: radius.pill },
  barName: { flex: 1, fontSize: 13, fontWeight: '500', color: colors.text },
  barValue: { fontSize: 13, fontWeight: '600', color: colors.text },
  track: { height: 8, borderRadius: radius.pill, backgroundColor: colors.background, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  barPercent: { fontSize: 11, color: colors.textFaint },
  legend: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendText: { fontSize: 12, color: colors.textMuted },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 170,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  column: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  columnValue: { fontSize: 9, color: colors.textFaint, marginBottom: 4 },
  columnBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, flex: 1 },
  columnBar: { width: 9, borderRadius: 3, minHeight: 3 },
  columnLabel: { fontSize: 10, color: colors.textMuted, marginTop: spacing.sm },
});
