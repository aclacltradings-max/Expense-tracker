import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Summary } from '../types';
import { formatCurrency } from '../utils/format';
import { colors, radius, spacing } from '../theme';
import { Card } from './ui/Card';

interface SummaryCardsProps {
  summary: Summary;
}

/** Three headline figures: money in, money out and what is left. */
export function SummaryCards({ summary }: SummaryCardsProps) {
  const balancePositive = summary.balance >= 0;

  return (
    <View style={styles.grid}>
      <SummaryCard
        label="Total Income"
        value={formatCurrency(summary.income)}
        icon="arrow-down-circle"
        iconColor={colors.income}
        iconBackground={colors.incomeLight}
        valueColor={colors.income}
      />
      <SummaryCard
        label="Total Expenses"
        value={formatCurrency(summary.expenses)}
        icon="arrow-up-circle"
        iconColor={colors.expense}
        iconBackground={colors.expenseLight}
        valueColor={colors.expense}
      />
      <SummaryCard
        label="Available Balance"
        value={formatCurrency(summary.balance)}
        icon="wallet"
        iconColor={balancePositive ? colors.brand : colors.warning}
        iconBackground={balancePositive ? colors.brandLight : colors.warningLight}
        valueColor={balancePositive ? colors.text : colors.warning}
        caption={`${summary.count} transaction${summary.count === 1 ? '' : 's'} recorded`}
      />
    </View>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
  valueColor: string;
  caption?: string;
}

function SummaryCard({
  label,
  value,
  icon,
  iconColor,
  iconBackground,
  valueColor,
  caption,
}: SummaryCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrap, { backgroundColor: iconBackground }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <Text style={[styles.value, { color: valueColor }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>

      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: { gap: spacing.md },
  card: { padding: spacing.lg },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 14, fontWeight: '500', color: colors.textMuted },
  value: { marginTop: spacing.md, fontSize: 26, fontWeight: '700' },
  caption: { marginTop: spacing.xs, fontSize: 12, color: colors.textFaint },
});
