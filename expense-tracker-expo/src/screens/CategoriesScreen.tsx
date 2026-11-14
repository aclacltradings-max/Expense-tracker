import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useExpenseTracker } from '../context/ExpenseTrackerContext';
import { validateCategoryName } from '../utils/validation';
import { colors, radius, spacing } from '../theme';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Modal } from '../components/ui/Modal';
import { TextField } from '../components/ui/TextField';
import type { Category, TransactionType } from '../types';

/** Manage categories: view defaults and custom ones, add new, delete custom. */
export function CategoriesScreen() {
  const { categories, transactions, addCategory, deleteCategory, resetEverything } =
    useExpenseTracker();

  const [addOpen, setAddOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftType, setDraftType] = useState<TransactionType>('expense');
  const [nameError, setNameError] = useState<string | null>(null);

  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const grouped = useMemo(
    () => ({
      expense: categories.filter((category) => category.type === 'expense'),
      income: categories.filter((category) => category.type === 'income'),
    }),
    [categories],
  );

  /** How many transactions reference each category, so deletion impact is visible. */
  const usageByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const transaction of transactions) {
      counts.set(transaction.categoryId, (counts.get(transaction.categoryId) ?? 0) + 1);
    }
    return counts;
  }, [transactions]);

  function handleAdd() {
    const validationError = validateCategoryName(
      draftName,
      categories.map((category) => category.name),
    );
    if (validationError) {
      setNameError(validationError);
      return;
    }
    addCategory(draftName, draftType);
    setDraftName('');
    setNameError(null);
    setAddOpen(false);
  }

  function handleDelete() {
    if (!pendingDelete) return;
    const usage = usageByCategory.get(pendingDelete.id) ?? 0;
    deleteCategory(pendingDelete.id);
    setPendingDelete(null);

    if (usage > 0) {
      Alert.alert(
        'Category removed',
        `${usage} existing transaction${usage === 1 ? '' : 's'} still reference this category and now show as “Uncategorised”.`,
      );
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Button label="New category" icon={<Ionicons name="add" size={18} color="#ffffff" />} onPress={() => setAddOpen(true)} />

      {(['expense', 'income'] as const).map((type) => (
        <View key={type} style={styles.section}>
          <Text style={styles.sectionTitle}>
            {type === 'expense' ? 'Expense categories' : 'Income categories'}
          </Text>

          <Card flush>
            {grouped[type].map((category, index) => {
              const usage = usageByCategory.get(category.id) ?? 0;
              return (
                <View key={category.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <View style={styles.row}>
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowName}>{category.name}</Text>
                      <Text style={styles.rowMeta}>
                        {category.isCustom ? 'Custom' : 'Default'}
                        {usage > 0 ? ` · ${usage} transaction${usage === 1 ? '' : 's'}` : ''}
                      </Text>
                    </View>

                    {category.isCustom ? (
                      <Pressable
                        onPress={() => setPendingDelete(category)}
                        accessibilityRole="button"
                        accessibilityLabel={`Delete ${category.name}`}
                        hitSlop={8}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                      </Pressable>
                    ) : (
                      <Ionicons name="lock-closed-outline" size={15} color={colors.textFaint} />
                    )}
                  </View>
                </View>
              );
            })}
          </Card>
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger zone</Text>
        <Card>
          <Text style={styles.dangerText}>
            Removes every transaction and resets categories to the defaults. This cannot be undone.
          </Text>
          <Button
            label="Clear all data"
            variant="danger"
            onPress={() => setConfirmReset(true)}
            style={styles.dangerButton}
          />
        </Card>
      </View>

      <Modal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        title="New category"
        description="Custom categories can be deleted later."
      >
        <View style={styles.modalBody}>
          <View>
            <Text style={styles.fieldLabel}>Type</Text>
            <View style={styles.toggle}>
              {(['expense', 'income'] as const).map((option) => {
                const active = draftType === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setDraftType(option)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    style={[styles.toggleOption, active && styles.toggleOptionActive]}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        active &&
                          (option === 'income'
                            ? { color: colors.income }
                            : { color: colors.expense }),
                      ]}
                    >
                      {option === 'income' ? 'Income' : 'Expense'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <TextField
            autoFocus
            label="Name"
            value={draftName}
            onChangeText={(text) => {
              setDraftName(text);
              setNameError(null);
            }}
            placeholder="e.g. Subscriptions"
            maxLength={32}
            error={nameError ?? undefined}
            onSubmitEditing={handleAdd}
            returnKeyType="done"
          />

          <View style={styles.modalActions}>
            <Button label="Cancel" variant="secondary" onPress={() => setAddOpen(false)} style={styles.modalAction} />
            <Button label="Add category" onPress={handleAdd} style={styles.modalAction} />
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={pendingDelete !== null}
        title="Delete this category?"
        message={
          pendingDelete
            ? `“${pendingDelete.name}” will be removed from the picker. Existing transactions keep their amounts but show as “Uncategorised”.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        visible={confirmReset}
        title="Clear all data?"
        message="Every transaction will be permanently deleted and categories reset to defaults. This cannot be undone."
        confirmLabel="Clear everything"
        onConfirm={() => {
          void resetEverything();
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  section: { gap: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowLeft: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '500', color: colors.text },
  rowMeta: { marginTop: 2, fontSize: 11, color: colors.textFaint },
  deleteButton: { padding: spacing.xs },
  dangerText: { fontSize: 13, lineHeight: 19, color: colors.textMuted },
  dangerButton: { marginTop: spacing.lg },
  modalBody: { gap: spacing.lg },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.sm },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  toggleOption: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.sm, alignItems: 'center' },
  toggleOptionActive: { backgroundColor: colors.surface },
  toggleText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  modalActions: { flexDirection: 'row', gap: spacing.md },
  modalAction: { flex: 1 },
});
