import type { NavigatorScreenParams } from '@react-navigation/native';

/** Bottom tab routes. */
export type TabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  History: undefined;
  Categories: undefined;
};

/** Root stack routes. Tabs are nested so detail screens push over them. */
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  TransactionForm: { transactionId?: string } | undefined;
};
