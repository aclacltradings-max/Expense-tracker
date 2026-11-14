import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useExpenseTracker } from '../context/ExpenseTrackerContext';
import { TransactionForm } from '../components/TransactionForm';
import { colors, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'TransactionForm'>;
type FormRoute = RouteProp<RootStackParamList, 'TransactionForm'>;

/** Add a new transaction, or edit an existing one when `transactionId` is set. */
export function TransactionFormScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<FormRoute>();
  const { transactions, categories, addTransaction, updateTransaction, addCategory, deleteCategory } =
    useExpenseTracker();

  const transactionId = route.params?.transactionId;
  const editing = useMemo(
    () => transactions.find((transaction) => transaction.id === transactionId) ?? null,
    [transactions, transactionId],
  );

  // The record vanished (deleted from another screen) — bail out instead of
  // silently creating a duplicate.
  if (transactionId && !editing) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingTitle}>Transaction not found</Text>
        <Text style={styles.missingText}>It may have been deleted already.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <TransactionForm
        editing={editing}
        categories={categories}
        onSubmit={(input) => {
          if (editing) updateTransaction(editing.id, input);
          else addTransaction(input);
          navigation.goBack();
        }}
        onCancel={() => navigation.goBack()}
        onAddCategory={addCategory}
        onDeleteCategory={deleteCategory}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.xs },
  missingTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  missingText: { fontSize: 13, color: colors.textMuted },
});
