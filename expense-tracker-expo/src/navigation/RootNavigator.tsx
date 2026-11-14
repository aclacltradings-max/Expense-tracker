import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { TransactionFormScreen } from '../screens/TransactionFormScreen';
import { colors } from '../theme';
import type { RootStackParamList, TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'pie-chart-outline',
  Transactions: 'list-outline',
  History: 'time-outline',
  Categories: 'pricetags-outline',
};

/** Bottom tab bar — the app's four top-level areas. */
function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        headerShadowVisible: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Expense Tracker' }} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
    </Tab.Navigator>
  );
}

/** Root stack: tabs plus the add/edit form pushed over them. */
export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text, fontWeight: '700' },
        headerTintColor: colors.brand,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="TransactionForm"
        component={TransactionFormScreen}
        options={({ route }) => ({
          title: route.params?.transactionId ? 'Edit transaction' : 'Add transaction',
          presentation: 'modal',
        })}
      />
    </Stack.Navigator>
  );
}
