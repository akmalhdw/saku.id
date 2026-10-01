export type TransactionType = 'income' | 'expense';

export type ExpenseCategory = 
  | 'Makanan & Minuman'
  | 'Transportasi'
  | 'Belanja & Kebutuhan'
  | 'Tagihan & Utilitas'
  | 'Hiburan & Hobi'
  | 'Kesehatan'
  | 'Pendidikan'
  | 'Investasi & Tabungan'
  | 'Keluarga & Anak'
  | 'Sedekah & Donasi'
  | 'Lainnya';

export type IncomeCategory = 
  | 'Gaji Utama'
  | 'Bonus & THR'
  | 'Freelance & Usaha'
  | 'Hasil Investasi'
  | 'Hadiah & Cashback'
  | 'Penjualan Barang'
  | 'Lainnya';

export type Category = ExpenseCategory | IncomeCategory;

export type WalletType = 'cash' | 'bank' | 'ewallet' | 'investment';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  accountNumber?: string;
  color: string;
  iconName: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  walletId: string;
  note: string;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly';
}

export interface BudgetConfig {
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  warningThresholdPercent: number; // e.g., 80%
  enableDailyAlert: boolean;
  enableWeeklyAlert: boolean;
  enableMonthlyAlert: boolean;
  categoryBudgets: Record<string, number>;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  color: string;
  notes?: string;
}

export interface BillReminder {
  id: string;
  title: string;
  amount: number;
  dueDay: number; // 1 to 31
  category: string;
  walletId: string;
  isPaid: boolean;
  autoDeduct: boolean;
}

export interface DebtItem {
  id: string;
  type: 'debt' | 'receivable'; // debt = hutang saya, receivable = piutang orang lain
  personName: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  note: string;
  status: 'active' | 'settled';
}

export type BudgetStatusLevel = 'safe' | 'warning' | 'danger';

export interface PeriodBudgetSummary {
  period: 'daily' | 'weekly' | 'monthly';
  label: string;
  spent: number;
  limit: number;
  percentage: number;
  remaining: number;
  status: BudgetStatusLevel;
  overspendAmount: number;
  averagePerDay?: number;
}

export interface BudgetAlert {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'category';
  title: string;
  message: string;
  severity: 'warning' | 'danger';
  currentAmount: number;
  limitAmount: number;
  percentage: number;
  categoryName?: string;
  timestamp: string;
}
