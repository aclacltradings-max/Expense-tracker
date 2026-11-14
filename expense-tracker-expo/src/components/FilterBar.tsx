import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Category, TransactionFilters } from '../types';
import { colors, radius, spacing } from '../theme';
import { Card } from './ui/Card';
import { TextField } from './ui/TextField';

interface FilterBarProps {
  filters: TransactionFilters;
  categories: Category[];
  resultCount: number;
  onChange: (filters: TransactionFilters) => void;
  onReset: () => void;
}

export const EMPTY_FILTERS: TransactionFilters = {
  search: '',
  type: 'all',
  categoryId: 'all',
  from: '',
  to: '',
};

/**
 * Search, type, category and date-range controls. Collapsed by default so the
 * list stays the focus on a phone; the summary line always shows the count.
 */
export function FilterBar({ filters, categories, resultCount, onChange, onReset }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const isFiltered =
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.categoryId !== 'all' ||
    filters.from !== '' ||
    filters.to !== '';

  const visibleCategories =
    filters.type === 'all'
      ? categories
      : categories.filter((category) => category.type === filters.type);

  function patch(changes: Partial<TransactionFilters>) {
    onChange({ ...filters, ...changes });
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setExpanded((open) => !open)}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          hitSlop={8}
          style={styles.headerButton}
        >
          <Ionicons name="options-outline" size={16} color={colors.textMuted} />
          <Text style={styles.headerTitle}>Search &amp; filter</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textFaint}
          />
        </Pressable>

        {isFiltered ? (
          <Pressable onPress={onReset} hitSlop={8} accessibilityRole="button">
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.count}>
        Showing <Text style={styles.countStrong}>{resultCount}</Text>{' '}
        {resultCount === 1 ? 'transaction' : 'transactions'}
        {isFiltered ? ' matching your filters.' : '.'}
      </Text>

      {expanded ? (
        <View style={styles.body}>
          <TextField
            value={filters.search}
            onChangeText={(text) => patch({ search: text })}
            placeholder="Search descriptions…"
            returnKeyType="search"
            autoCorrect={false}
          />

          <SegmentedRow
            options={[
              { key: 'all', label: 'All' },
              { key: 'income', label: 'Income' },
              { key: 'expense', label: 'Expenses' },
            ]}
            value={filters.type}
            onChange={(type) => patch({ type: type as TransactionFilters['type'], categoryId: 'all' })}
          />

          <ChipRow
            label="Category"
            options={[{ key: 'all', label: 'All categories' }, ...visibleCategories.map((c) => ({ key: c.id, label: c.name }))]}
            value={filters.categoryId}
            onChange={(categoryId) => patch({ categoryId })}
          />

          <View style={styles.dateRow}>
            <TextField
              containerStyle={styles.dateField}
              value={filters.from}
              onChangeText={(text) => patch({ from: text })}
              placeholder="From YYYY-MM-DD"
              autoCapitalize="none"
            />
            <TextField
              containerStyle={styles.dateField}
              value={filters.to}
              onChangeText={(text) => patch({ to: text })}
              placeholder="To YYYY-MM-DD"
              autoCapitalize="none"
            />
          </View>
        </View>
      ) : null}
    </Card>
  );
}

interface SegmentedRowProps {
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}

function SegmentedRow({ options, value, onChange }: SegmentedRowProps) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const active = option.key === value;
        return (
          <Pressable
            key={option.key}
            onPress={() => onChange(option.key)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface ChipRowProps {
  label: string;
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}

function ChipRow({ label, options, value, onChange }: ChipRowProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const active = option.key === value;
          return (
            <Pressable
              key={option.key}
              onPress={() => onChange(option.key)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  clear: { fontSize: 12, fontWeight: '700', color: colors.brand },
  count: { marginTop: spacing.sm, fontSize: 12, color: colors.textMuted },
  countStrong: { fontWeight: '700', color: colors.text },
  body: { marginTop: spacing.lg, gap: spacing.lg },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  segment: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.sm, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.surface },
  segmentText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  segmentTextActive: { color: colors.text },
  label: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: spacing.sm },
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
  chipText: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  chipTextActive: { color: '#ffffff' },
  dateRow: { flexDirection: 'row', gap: spacing.md },
  dateField: { flex: 1 },
});
