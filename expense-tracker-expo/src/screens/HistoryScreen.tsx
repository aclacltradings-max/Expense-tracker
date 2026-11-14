import React, { useMemo } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useExpenseTracker } from '../context/ExpenseTrackerContext';
import { sortByNewest } from '../utils/calculations';
import { formatCurrency } from '../utils/format';
import { monthLabel, monthKey } from '../utils/date';
import { colors, radius, spacing } from '../theme';
import { TransactionRow, categoryNameFor } from '../components/TransactionRow';
import { Card } from '../components/ui/Card';
import type { Transaction } from '../types';
import type { RootStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

interface HistorySection {
  title: string;
  income: number;
  expenses: number;
  balance: number;
  data: Transaction[];
}

/** Transactions grouped by month, newest first, with per-month totals. */
export function HistoryScreen() {
  const navigation = useNavigation<Navigation>();
  const { transactions, categories, isHydrating, deleteTransaction } = useExpenseTracker();

  const sections = useMemo<HistorySection[]>(() => {
    const byMonth = new Map<string, Transaction[]>();

    for (const transaction of transactions) {
      const key = monthKey(transaction.date);
      const bucket = byMonth.get(key) ?? [];
      bucket.push(transaction);
      byMonth.set(key, bucket);
    }

    return [...byMonth.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([month, items]) => {
        let income = 0;
        let expenses = 0;
        for (const item of items) {
          if (item.type === 'income') income += item.amount;
          else expenses += item.amount;
        }
        return {
          title: month,
          income,
          expenses,
          balance: income - expenses,
          data: sortByNewest(items),
        };
      });
  }, [transactions]);

  if (isHydrating) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>{monthLabel(section.title)}</Text>
              <Text
                style={[styles.sectionBalance, section.balance < 0 && { color: colors.warning }]}
              >
                {formatCurrency(section.balance)}
              </Text>
            </View>
            <View style={styles.sectionTotals}>
              <Text style={[styles.sectionTotal, { color: colors.income }]}>
                +{formatCurrency(section.income)}
              </Text>
              <Text style={[styles.sectionTotal, { color: colors.expense }]}>
                -{formatCurrency(section.expenses)}
              </Text>
            </View>
          </View>
        )}
        renderItem={({ item }) => (
          <Card flush style={styles.rowCard}>
            <TransactionRow
              transaction={item}
              categoryName={categoryNameFor(categories, item.categoryId)}
              onEdit={(transaction) =>
                navigation.navigate('TransactionForm', { transactionId: transaction.id })
              }
              onDelete={(transaction) => deleteTransaction(transaction.id)}
            />
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={40} color={colors.textFaint} />
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptyText}>
              Transactions you add will appear here, grouped by month.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  sectionHeader: { marginTop: spacing.lg, marginBottom: spacing.md },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  sectionBalance: { fontSize: 15, fontWeight: '700', color: colors.text },
  sectionTotals: { flexDirection: 'row', gap: spacing.lg, marginTop: 2 },
  sectionTotal: { fontSize: 12, fontWeight: '600' },
  rowCard: { marginBottom: spacing.sm, borderRadius: radius.lg },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  emptyText: { fontSize: 13, lineHeight: 19, color: colors.textMuted, textAlign: 'center' },
});
