import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useExpenseTracker } from '../context/ExpenseTrackerContext';
import { applyFilters, sortByNewest } from '../utils/calculations';
import { colors, spacing } from '../theme';
import { FilterBar, EMPTY_FILTERS } from '../components/FilterBar';
import { TransactionRow, categoryNameFor } from '../components/TransactionRow';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import type { Transaction, TransactionFilters } from '../types';
import type { RootStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList>;

/** Full transaction list with search, filters and per-row edit/delete. */
export function TransactionsScreen() {
  const navigation = useNavigation<Navigation>();
  const { transactions, categories, isHydrating, deleteTransaction } = useExpenseTracker();

  const [filters, setFilters] = useState<TransactionFilters>(EMPTY_FILTERS);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);

  const visible = useMemo(
    () => sortByNewest(applyFilters(transactions, filters)),
    [transactions, filters],
  );

  if (isHydrating) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <FilterBar
            filters={filters}
            categories={categories}
            resultCount={visible.length}
            onChange={setFilters}
            onReset={() => setFilters(EMPTY_FILTERS)}
          />
        }
        ListHeaderComponentStyle={styles.headerSpacing}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <TransactionRow
            transaction={item}
            categoryName={categoryNameFor(categories, item.categoryId)}
            onEdit={(transaction) =>
              navigation.navigate('TransactionForm', { transactionId: transaction.id })
            }
            onDelete={setPendingDelete}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={40} color={colors.textFaint} />
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptyText}>
              Nothing matches your current filters. Add a transaction or clear the filters to see
              more.
            </Text>
          </View>
        }
      />

      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Delete this transaction?"
        message={
          pendingDelete
            ? `“${pendingDelete.description}” will be permanently removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={() => {
          if (pendingDelete) deleteTransaction(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerSpacing: { marginBottom: spacing.md },
  separator: { height: spacing.md },
  empty: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg, gap: spacing.sm },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  emptyText: { fontSize: 13, lineHeight: 19, color: colors.textMuted, textAlign: 'center' },
});
