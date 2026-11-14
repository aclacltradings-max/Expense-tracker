import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseTrackerProvider } from './src/context/ExpenseTrackerContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors, radius, spacing } from './src/theme';
import type { RootStackParamList } from './src/navigation/types';

/**
 * Navigation ref so the floating button (rendered outside the navigator) can
 * push the add-transaction screen.
 */
const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** Floating add button, shown above every tab screen. */
function AddTransactionButton() {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Add transaction"
      onPress={() => {
        if (navigationRef.isReady()) navigationRef.navigate('TransactionForm');
      }}
      style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
    >
      <Ionicons name="add" size={28} color="#ffffff" />
    </Pressable>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ExpenseTrackerProvider>
        <View style={styles.root}>
          <NavigationContainer ref={navigationRef}>
            <RootNavigator />
          </NavigationContainer>
          <AddTransactionButton />
          <StatusBar style="dark" />
        </View>
      </ExpenseTrackerProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: Platform.OS === 'ios' ? 96 : 80,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabPressed: { backgroundColor: colors.brandDark, transform: [{ scale: 0.96 }] },
});
