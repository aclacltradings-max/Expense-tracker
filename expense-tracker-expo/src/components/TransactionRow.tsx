import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Category, Transaction } from '../types';
import { formatDate } from '../utils/date';
import { formatSignedCurrency } from '../utils/format';
import { colors, radius, spacing } from '../theme';

interface TransactionRowProps {
  transaction: Transaction;
  categoryName: string;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

/** One transaction line: type badge, description, category/date and amount. */
export function TransactionRow({
  transaction,
  categoryName,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const isIncome = transaction.type === 'income';

  return (
    <View style={styles.row}>
      <View
        style={[styles.badge, { backgroundColor: isIncome ? colors.incomeLight : colors.expenseLight }]}
      >
        <Ionicons
          name={isIncome ? 'arrow-down' : 'arrow-up'}
          size={18}
          color={isIncome ? colors.income : colors.expense}
        />
      </View>

      <View style={styles.middle}>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText} numberOfLines={1}>
              {categoryName}
            </Text>
          </View>
          <Text style={styles.date}>{formatDate(transaction.date)}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text
          style={[styles.amount, { color: isIncome ? colors.income : colors.expense }]}
          numberOfLines={1}
        >
          {formatSignedCurrency(transaction.amount, transaction.type)}
        </Text>

        <View style={styles.actions}>
          <Pressable
            onPress={() => onEdit(transaction)}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${transaction.description}`}
            hitSlop={8}
            style={styles.actionButton}
          >
            <Ionicons name="create-outline" size={18} color={colors.textFaint} />
          </Pressable>
          <Pressable
            onPress={() => onDelete(transaction)}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${transaction.description}`}
            hitSlop={8}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={18} color={colors.textFaint} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/** Look up a category name, falling back for orphaned references. */
export function categoryNameFor(categories: Category[], categoryId: string): string {
  return categories.find((category) => category.id === categoryId)?.name ?? 'Uncategorised';
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: { flex: 1, minWidth: 0 },
  description: { fontSize: 15, fontWeight: '600', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 3 },
  chip: {
    backgroundColor: colors.background,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    maxWidth: 150,
  },
  chipText: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
  date: { fontSize: 11, color: colors.textMuted },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '700' },
  actions: { flexDirection: 'row', marginTop: 2 },
  actionButton: { padding: 6 },
});
