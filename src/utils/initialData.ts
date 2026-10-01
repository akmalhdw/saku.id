import { BudgetConfig, Wallet, Transaction, SavingsGoal, BillReminder, DebtItem } from '../types/finance';
import { getTodayString } from './formatters';

export const INITIAL_WALLETS: Wallet[] = [
  {
    id: 'w-1',
    name: 'Dompet Tunai',
    type: 'cash',
    balance: 850000,
    color: '#059669', // Emerald
    iconName: 'Banknote',
  },
  {
    id: 'w-2',
    name: 'BCA Utama',
    type: 'bank',
    balance: 14250000,
    accountNumber: '8210-992-120',
    color: '#2563eb', // Blue
    iconName: 'Building2',
  },
  {
    id: 'w-3',
    name: 'Mandiri Payroll',
    type: 'bank',
    balance: 4800000,
    accountNumber: '137-00-1928-11',
    color: '#d97706', // Amber
    iconName: 'Building2',
  },
  {
    id: 'w-4',
    name: 'GoPay & OVO',
    type: 'ewallet',
    balance: 420000,
    color: '#0284c7', // Sky
    iconName: 'Smartphone',
  },
  {
    id: 'w-5',
    name: 'Tabungan & Bibit',
    type: 'investment',
    balance: 22500000,
    color: '#7c3aed', // Purple
    iconName: 'TrendingUp',
  },
];

export const INITIAL_BUDGET_CONFIG: BudgetConfig = {
  dailyLimit: 150000, // Rp 150.000 per hari
  weeklyLimit: 1050000, // Rp 1.050.000 per minggu
  monthlyLimit: 4500000, // Rp 4.500.000 per bulan
  warningThresholdPercent: 80, // Peringatan mulai 80%
  enableDailyAlert: true,
  enableWeeklyAlert: true,
  enableMonthlyAlert: true,
  categoryBudgets: {
    'Makanan & Minuman': 1800000,
    'Transportasi': 600000,
    'Belanja & Kebutuhan': 800000,
    'Tagihan & Utilitas': 750000,
    'Hiburan & Hobi': 400000,
    'Kesehatan': 300000,
    'Sedekah & Donasi': 200000,
  },
};

export const getInitialTransactions = (): Transaction[] => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = today.getDate();

  // Helper to format date offset from today
  const formatDateOffset = (offsetDays: number): string => {
    const target = new Date(today);
    target.setDate(d - offsetDays);
    const ty = target.getFullYear();
    const tm = String(target.getMonth() + 1).padStart(2, '0');
    const td = String(target.getDate()).padStart(2, '0');
    return `${ty}-${tm}-${td}`;
  };

  return [
    {
      id: 'tx-1',
      type: 'income',
      category: 'Gaji Utama',
      amount: 9500000,
      date: `${y}-${m}-01`,
      time: '08:30',
      walletId: 'w-2',
      note: 'Gaji bulanan masuk rekening BCA',
    },
    {
      id: 'tx-2',
      type: 'income',
      category: 'Freelance & Usaha',
      amount: 2200000,
      date: formatDateOffset(2),
      time: '14:15',
      walletId: 'w-3',
      note: 'Pembayaran project UI/UX desain klien',
    },
    {
      id: 'tx-3',
      type: 'expense',
      category: 'Tagihan & Utilitas',
      amount: 385000,
      date: `${y}-${m}-02`,
      time: '09:00',
      walletId: 'w-4',
      note: 'Bayar WiFi IndiHome bulanan',
    },
    {
      id: 'tx-4',
      type: 'expense',
      category: 'Belanja & Kebutuhan',
      amount: 520000,
      date: formatDateOffset(4),
      time: '19:40',
      walletId: 'w-2',
      note: 'Belanja bahan dapur & toiletries di Supermarket',
    },
    {
      id: 'tx-5',
      type: 'expense',
      category: 'Transportasi',
      amount: 150000,
      date: formatDateOffset(3),
      time: '07:45',
      walletId: 'w-4',
      note: 'Top up kartu e-toll & bensin Pertamax',
    },
    {
      id: 'tx-6',
      type: 'expense',
      category: 'Makanan & Minuman',
      amount: 65000,
      date: formatDateOffset(1),
      time: '12:30',
      walletId: 'w-1',
      note: 'Makan siang Nasi Padang rendang + es jeruk',
    },
    {
      id: 'tx-7',
      type: 'expense',
      category: 'Hiburan & Hobi',
      amount: 125000,
      date: formatDateOffset(1),
      time: '20:15',
      walletId: 'w-4',
      note: 'Tiket bioskop XXI + popcorn kawan',
    },
    // Transactions for TODAY to test daily budget thresholds
    {
      id: 'tx-8',
      type: 'expense',
      category: 'Makanan & Minuman',
      amount: 45000,
      date: getTodayString(),
      time: '08:15',
      walletId: 'w-1',
      note: 'Sarapan Bubur Ayam & Teh Manis',
    },
    {
      id: 'tx-9',
      type: 'expense',
      category: 'Transportasi',
      amount: 35000,
      date: getTodayString(),
      time: '09:00',
      walletId: 'w-4',
      note: 'Ojek online berangkat kerja',
    },
    {
      id: 'tx-10',
      type: 'expense',
      category: 'Makanan & Minuman',
      amount: 55000,
      date: getTodayString(),
      time: '12:45',
      walletId: 'w-1',
      note: 'Makan siang Ayam Geprek + Kopi Kenangan',
    },
  ];
};

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'sg-1',
    title: 'Dana Darurat 6 Bulan',
    targetAmount: 30000000,
    currentAmount: 18500000,
    targetDate: '2026-12-31',
    category: 'Darurat',
    color: '#059669',
    notes: 'Prioritas utama jika ada kebutuhan medis atau transisi karir',
  },
  {
    id: 'sg-2',
    title: 'Upgrade Laptop Kerja',
    targetAmount: 14000000,
    currentAmount: 8400000,
    targetDate: '2026-11-30',
    category: 'Pekerjaan',
    color: '#2563eb',
    notes: 'MacBook Air M3 untuk efisiensi kerja produktif',
  },
  {
    id: 'sg-3',
    title: 'Liburan & Healing Akhir Tahun',
    targetAmount: 5000000,
    currentAmount: 3200000,
    targetDate: '2026-12-20',
    category: 'Lifestyle',
    color: '#d97706',
    notes: 'Wisata alam ke Bali / Lombok bersama keluarga',
  },
];

export const INITIAL_BILL_REMINDERS: BillReminder[] = [
  {
    id: 'br-1',
    title: 'WiFi & Internet IndiHome',
    amount: 385000,
    dueDay: 10,
    category: 'Tagihan & Utilitas',
    walletId: 'w-4',
    isPaid: true,
    autoDeduct: true,
  },
  {
    id: 'br-2',
    title: 'Listrik PLN Pascabayar',
    amount: 350000,
    dueDay: 15,
    category: 'Tagihan & Utilitas',
    walletId: 'w-2',
    isPaid: false,
    autoDeduct: false,
  },
  {
    id: 'br-3',
    title: 'Iuran BPJS Kesehatan',
    amount: 100000,
    dueDay: 10,
    category: 'Kesehatan',
    walletId: 'w-2',
    isPaid: false,
    autoDeduct: true,
  },
  {
    id: 'br-4',
    title: 'Langganan Spotify & iCloud',
    amount: 95000,
    dueDay: 24,
    category: 'Hiburan & Hobi',
    walletId: 'w-4',
    isPaid: false,
    autoDeduct: true,
  },
];

export const INITIAL_DEBTS: DebtItem[] = [
  {
    id: 'db-1',
    type: 'receivable',
    personName: 'Rian Aditama (Rekan Kerja)',
    amount: 350000,
    paidAmount: 100000,
    dueDate: '2026-10-15',
    note: 'Talangan beli tiket event workshop',
    status: 'active',
  },
  {
    id: 'db-2',
    type: 'debt',
    personName: 'Dimas Kurniawan',
    amount: 200000,
    paidAmount: 0,
    dueDate: '2026-10-08',
    note: 'Patungan kado pernikahan Gilang',
    status: 'active',
  },
];
