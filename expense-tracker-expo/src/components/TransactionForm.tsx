import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type {
  Category,
  Transaction,
  TransactionDraft,
  TransactionFormErrors,
  TransactionInput,
  TransactionType,
} from '../types';
import { dateToISO, formatDate, isoToDate, todayISO } from '../utils/date';
import { validateTransaction } from '../utils/validation';
import { colors, radius, spacing } from '../theme';
import { Button } from './ui/Button';
import { TextField } from './ui/TextField';
import { CategorySelect } from './CategorySelect';

interface TransactionFormProps {
  /** When present the form edits this transaction; otherwise it creates a new one. */
  editing?: Transaction | null;
  categories: Category[];
  onSubmit: (input: TransactionInput) => void;
  onCancel: () => void;
  onAddCategory: (name: string, type: TransactionType) => Category;
  onDeleteCategory: (id: string) => void;
}

function emptyDraft(): TransactionDraft {
  return { type: 'expense', amount: '', categoryId: '', description: '', date: todayISO() };
}

function draftFromTransaction(transaction: Transaction): TransactionDraft {
  return {
    type: transaction.type,
    amount: String(transaction.amount),
    categoryId: transaction.categoryId,
    description: transaction.description,
    date: transaction.date,
  };
}

/**
 * Add/edit form for a single transaction. Validation runs on submit, then
 * re-runs live so errors clear as the user fixes them.
 */
export function TransactionForm({
  editing,
  categories,
  onSubmit,
  onCancel,
  onAddCategory,
  onDeleteCategory,
}: TransactionFormProps) {
  const [draft, setDraft] = useState<TransactionDraft>(() =>
    editing ? draftFromTransaction(editing) : emptyDraft(),
  );
  const [errors, setErrors] = useState<TransactionFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Re-seed the form when the target transaction changes.
  useEffect(() => {
    setDraft(editing ? draftFromTransaction(editing) : emptyDraft());
    setErrors({});
    setSubmitted(false);
  }, [editing]);

  const availableCategoryIds = useMemo(
    () =>
      categories.filter((category) => category.type === draft.type).map((category) => category.id),
    [categories, draft.type],
  );

  useEffect(() => {
    if (submitted) setErrors(validateTransaction(draft, availableCategoryIds));
  }, [draft, availableCategoryIds, submitted]);

  function setField<K extends keyof TransactionDraft>(key: K, value: TransactionDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handleTypeChange(type: TransactionType) {
    setDraft((current) => ({ ...current, type, categoryId: '' }));
  }

  function handleSubmit() {
    const nextErrors = validateTransaction(draft, availableCategoryIds);
    setErrors(nextErrors);
    setSubmitted(true);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      type: draft.type,
      amount: Math.round(Number(draft.amount) * 100) / 100,
      categoryId: draft.categoryId,
      description: draft.description.trim(),
      date: draft.date,
    });
  }

  return (
    <View style={styles.form}>
      {/* Type toggle */}
      <View>
        <Text style={styles.label}>Type</Text>
        <View style={styles.toggle}>
          {(['expense', 'income'] as const).map((option) => {
            const active = draft.type === option;
            return (
              <Pressable
                key={option}
                onPress={() => handleTypeChange(option)}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                style={[styles.toggleOption, active && styles.toggleOptionActive]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    active &&
                      (option === 'income' ? styles.toggleTextIncome : styles.toggleTextExpense),
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
        label="Amount"
        value={draft.amount}
        onChangeText={(text) => setField('amount', text)}
        placeholder="0.00"
        keyboardType="decimal-pad"
        inputMode="decimal"
        prefix="₦"
        error={errors.amount}
      />

      <CategorySelect
        label="Category"
        value={draft.categoryId}
        type={draft.type}
        categories={categories}
        error={errors.categoryId}
        onChange={(categoryId) => setField('categoryId', categoryId)}
        onAddCategory={onAddCategory}
        onDeleteCategory={onDeleteCategory}
      />

      <TextField
        label="Description"
        value={draft.description}
        onChangeText={(text) => setField('description', text)}
        placeholder="e.g. Weekly grocery run"
        maxLength={120}
        error={errors.description}
      />

      {/* Date */}
      <View>
        <Text style={styles.label}>Date</Text>
        <Pressable
          onPress={() => setPickerOpen((open) => !open)}
          accessibilityRole="button"
          accessibilityLabel={`Date: ${formatDate(draft.date)}`}
          style={[styles.dateField, Boolean(errors.date) && styles.dateFieldError]}
        >
          <Text style={styles.dateText}>{formatDate(draft.date)}</Text>
        </Pressable>
        {errors.date ? <Text style={styles.fieldError}>{errors.date}</Text> : null}

        {pickerOpen ? (
          <DateTimePicker
            value={isoToDate(draft.date)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={(event, selected) => {
              // Android fires once and closes; iOS keeps the spinner mounted.
              if (Platform.OS !== 'ios') setPickerOpen(false);
              if (event.type === 'dismissed') return;
              if (selected) setField('date', dateToISO(selected));
            }}
          />
        ) : null}

        {pickerOpen && Platform.OS === 'ios' ? (
          <Button
            label="Done"
            variant="secondary"
            onPress={() => setPickerOpen(false)}
            style={styles.dateDone}
          />
        ) : null}
      </View>

      <View style={styles.actions}>
        <Button label="Cancel" variant="secondary" onPress={onCancel} style={styles.action} />
        <Button
          label={editing ? 'Save changes' : 'Add transaction'}
          onPress={handleSubmit}
          style={styles.action}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  toggleOptionActive: { backgroundColor: colors.surface },
  toggleText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  toggleTextIncome: { color: colors.income },
  toggleTextExpense: { color: colors.expense },
  dateField: {
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  dateFieldError: { borderColor: colors.danger },
  dateText: { fontSize: 16, color: colors.text },
  fieldError: { marginTop: spacing.xs, fontSize: 12, fontWeight: '500', color: colors.danger },
  dateDone: { marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  action: { flex: 1 },
});
