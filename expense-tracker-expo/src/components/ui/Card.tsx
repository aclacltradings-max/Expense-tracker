import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Removes inner padding when the child manages its own spacing (e.g. lists). */
  flush?: boolean;
}

/** White rounded surface with a hairline border — the base container for content. */
export function Card({ children, style, flush = false }: CardProps) {
  return <View style={[styles.card, !flush && styles.padded, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: { padding: spacing.lg },
});
