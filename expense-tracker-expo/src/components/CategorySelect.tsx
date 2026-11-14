import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Category, TransactionType } from '../types';
import { validateCategoryName } from '../utils/validation';
import { colors, radius, spacing } from '../theme';
import { Button } from './ui/Button';
import { TextField } from './ui/TextField';

interface CategorySelectProps {
  label: string;
  value: string;
  type: TransactionType;
  categories: Category[];
  error?: string;
  onChange: (categoryId: string) => void;
  onAddCategory: (name: string, type: TransactionType) => Category;
  onDeleteCategory: (id: string) => void;
}

/**
 * Category picker rendered as a wrapping chip grid (a native picker would hide
 * the options). Supports adding and removing custom categories inline.
 */
export function CategorySelect({
  label,
  value,
  type,
  categories,
  error,
  onChange,
  onAddCategory,
  onDeleteCategory,
}: CategorySelectProps) {
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);

  const options = useMemo(
    () => categories.filter((category) => category.type === type),
    [categories, type],
  );
  const selected = options.find((category) => category.id === value);

  function submitNewCategory() {
    const validationError = validateCategoryName(
      draftName,
      categories.map((category) => category.name),
    );
    if (validationError) {
      setNameError(validationError);
      return;
    }
    const created = onAddCategory(draftName, type);
    onChange(created.id);
    setDraftName('');
    setNameError(null);
    setAdding(false);
  }

  return (
    <View>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {!adding ? (
          <Pressable
            onPress={() => setAdding(true)}
            accessibilityRole="button"
            accessibilityLabel="Add a new category"
            hitSlop={8}
          >
            <Text style={styles.addLink}>+ New</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.chips}>
        {options.map((category) => {
          const active = category.id === value;
          return (
            <Pressable
              key={category.id}
              onPress={() => onChange(category.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{category.name}</Text>
            </Pressable>
          );
        })}
      </View>

      {adding ? (
        <View style={styles.addPanel}>
          <TextField
            autoFocus
            value={draftName}
            onChangeText={(text) => {
              setDraftName(text);
              setNameError(null);
            }}
            placeholder="New category name"
            maxLength={32}
            returnKeyType="done"
            onSubmitEditing={submitNewCategory}
            error={nameError ?? undefined}
          />
          <View style={styles.addActions}>
            <Button
              label="Add"
              onPress={submitNewCategory}
              style={styles.addAction}
            />
            <Button
              label="Cancel"
              variant="secondary"
              onPress={() => {
                setAdding(false);
                setDraftName('');
                setNameError(null);
              }}
              style={styles.addAction}
            />
          </View>
        </View>
      ) : null}

      {selected?.isCustom && !adding ? (
        <Pressable
          onPress={() => {
            onDeleteCategory(selected.id);
            onChange('');
          }}
          accessibilityRole="button"
          hitSlop={8}
          style={styles.removeRow}
        >
          <Ionicons name="close-circle-outline" size={14} color={colors.textFaint} />
          <Text style={styles.removeText}>Remove “{selected.name}” category</Text>
        </Pressable>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  addLink: { fontSize: 13, fontWeight: '700', color: colors.brand },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  chipTextActive: { color: '#ffffff' },
  addPanel: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  addAction: { flex: 1 },
  removeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  removeText: { fontSize: 12, fontWeight: '500', color: colors.textFaint },
  error: { marginTop: spacing.sm, fontSize: 12, fontWeight: '500', color: colors.danger },
});
