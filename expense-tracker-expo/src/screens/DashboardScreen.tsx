import React, { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useExpenseTracker } from '../context/ExpenseTrackerContext';
import { monthlySummary, sortByNewest, summarise } from '../utils/calculations';
import { formatCurrency } from '../utils/format';
import { monthLabel } from '../utils/date';
import { colors, radius, spacing } from '../theme';
import { SummaryCards } from '../components/SummaryCards';
import { InsightsPanel } from '../components/InsightsPanel';
import { TransactionRow, categoryNameFor } from '../components/TransactionRow';
import { Card } from '../components/ui/Card';
import type { RootStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/** Overview: headline totals, insights, recent activity and a monthly summary. */
export function DashboardScreen() {
  const navigation = useNavigation<Navigation>();
  const { transactions, categories, isHydrating, deleteTransaction } = useExpenseTracker();

  const summary = useMemo(() => summarise(transactions), [transactions]);
  const months = useMemo(() => monthlySummary(transactions), [transactions]);
  const recent = useMemo(() => sortByNewest(transactions).slice(0, 5), [transactions]);

  if (isHydrating) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.brand} />
        <Text style={styles.loadingText}>Loading your data…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={false} onRefresh={() => {}} />}
      showsVerticalScrollIndicator={false}
    >
      <SummaryCards summary={summary} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insights</Text>
        <InsightsPanel transactions={transactions} categories={categories} />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Tabs', { screen: 'Transactions' })}
          >
            See all
          </Text>
        </View>

        {recent.length === 0 ? (
          <Card>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyText}>
              Tap the + button to record your first income or expense.
            </Text>
          </Card>
        ) : (
          <Card flush>
            {recent.map((transaction, index) => (
              <View key={transaction.id}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <TransactionRow
                  transaction={transaction}
                  categoryName={categoryNameFor(categories, transaction.categoryId)}
                  onEdit={(item) => navigation.navigate('TransactionForm', { transactionId: item.id })}
                  onDelete={(item) => deleteTransaction(item.id)}
                />
              </View>
            ))}
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monthly summary</Text>

        {months.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>
              No monthly data yet. Add a transaction to build your first month.
            </Text>
          </Card>
        ) : (
          <Card flush>
            {months.map((row, index) => (
              <View key={row.month}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <View style={styles.monthRow}>
                  <View style={styles.monthHeader}>
                    <Text style={styles.monthName}>{monthLabel(row.month)}</Text>
                    <Text
                      style={[
                        styles.monthBalance,
                        row.balance < 0 && { color: colors.warning },
                      ]}
                    >
                      {formatCurrency(row.balance)}
                    </Text>
                  </View>

                  <View style={styles.monthGrid}>
                    <View style={[styles.monthStat, { backgroundColor: colors.incomeLight }]}>
                      <Text style={[styles.monthStatLabel, { color: colors.income }]}>Income</Text>
                      <Text style={[styles.monthStatValue, { color: colors.income }]}>
                        {formatCurrency(row.income)}
                      </Text>
                    </View>
                    <View style={[styles.monthStat, { backgroundColor: colors.expenseLight }]}>
                      <Text style={[styles.monthStatLabel, { color: colors.expense }]}>Expenses</Text>
                      <Text style={[styles.monthStatValue, { color: colors.expense }]}>
                        {formatCurrency(row.expenses)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.monthCount}>
                    {row.count} {row.count === 1 ? 'entry' : 'entries'}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}
      </View>

      <Text style={styles.footer}>All data is stored on this device. Nothing is sent to a server.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, backgroundColor: colors.background },
  loadingText: { fontSize: 14, color: colors.textMuted },
  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  link: { fontSize: 13, fontWeight: '600', color: colors.brand },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 68 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  emptyText: { marginTop: spacing.xs, fontSize: 13, lineHeight: 19, color: colors.textMuted },
  monthRow: { padding: spacing.lg },
  monthHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  monthName: { fontSize: 14, fontWeight: '600', color: colors.text },
  monthBalance: { fontSize: 14, fontWeight: '700', color: colors.text },
  monthGrid: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  monthStat: { flex: 1, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  monthStatLabel: { fontSize: 11 },
  monthStatValue: { marginTop: 2, fontSize: 13, fontWeight: '700' },
  monthCount: { marginTop: spacing.sm, fontSize: 11, color: colors.textFaint },
  footer: { textAlign: 'center', fontSize: 11, color: colors.textFaint },
});
