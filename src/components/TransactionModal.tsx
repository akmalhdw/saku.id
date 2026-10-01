import React, { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Check, AlertTriangle } from 'lucide-react';
import { Transaction, TransactionType, Wallet, ExpenseCategory, IncomeCategory, BudgetConfig } from '../types/finance';
import { formatRupiah, getTodayString, getCurrentTimeString, parseRupiahInput, formatNumber } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id'>, idToEdit?: string) => void;
  transactionToEdit?: Transaction | null;
  wallets: Wallet[];
  budgetConfig: BudgetConfig;
  currentDailySpent: number;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja & Kebutuhan',
  'Tagihan & Utilitas',
  'Hiburan & Hobi',
  'Kesehatan',
  'Pendidikan',
  'Investasi & Tabungan',
  'Keluarga & Anak',
  'Sedekah & Donasi',
  'Lainnya',
];

const INCOME_CATEGORIES: IncomeCategory[] = [
  'Gaji Utama',
  'Bonus & THR',
  'Freelance & Usaha',
  'Hasil Investasi',
  'Hadiah & Cashback',
  'Penjualan Barang',
  'Lainnya',
];

const QUICK_AMOUNTS = [
  { label: '+10rb', value: 10000 },
  { label: '+25rb', value: 25000 },
  { label: '+50rb', value: 50000 },
  { label: '+100rb', value: 100000 },
  { label: '+250rb', value: 250000 },
  { label: '+500rb', value: 500000 },
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transactionToEdit,
  wallets,
  budgetConfig,
  currentDailySpent,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<string>('Makanan & Minuman');
  const [walletId, setWalletId] = useState<string>(wallets[0]?.id || '');
  const [date, setDate] = useState<string>(getTodayString());
  const [time, setTime] = useState<string>(getCurrentTimeString());
  const [note, setNote] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmountStr(formatNumber(transactionToEdit.amount));
      setCategory(transactionToEdit.category);
      setWalletId(transactionToEdit.walletId);
      setDate(transactionToEdit.date);
      setTime(transactionToEdit.time || getCurrentTimeString());
      setNote(transactionToEdit.note || '');
      setIsRecurring(!!transactionToEdit.isRecurring);
      setRecurringFrequency(transactionToEdit.recurringFrequency || 'monthly');
    } else {
      setType('expense');
      setAmountStr('');
      setCategory('Makanan & Minuman');
      setWalletId(wallets[0]?.id || '');
      setDate(getTodayString());
      setTime(getCurrentTimeString());
      setNote('');
      setIsRecurring(false);
      setRecurringFrequency('monthly');
    }
  }, [transactionToEdit, isOpen, wallets]);

  if (!isOpen) return null;

  const numericAmount = parseRupiahInput(amountStr);

  const handleQuickAddAmount = (addVal: number) => {
    const nextVal = numericAmount + addVal;
    setAmountStr(formatNumber(nextVal));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const num = raw ? parseInt(raw, 10) : 0;
    setAmountStr(num > 0 ? formatNumber(num) : '');
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory('Makanan & Minuman');
    } else {
      setCategory('Gaji Utama');
    }
  };

  // Preview potential daily overbudget
  const willOverbudgetDaily = type === 'expense' && date === getTodayString() && 
    budgetConfig.dailyLimit > 0 && 
    (currentDailySpent + numericAmount) > budgetConfig.dailyLimit;

  const projectedDailyPercent = budgetConfig.dailyLimit > 0 && type === 'expense' && date === getTodayString()
    ? Math.round(((currentDailySpent + numericAmount) / budgetConfig.dailyLimit) * 100)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0) return;

    onSave(
      {
        type,
        amount: numericAmount,
        category,
        walletId,
        date,
        time,
        note: note.trim(),
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
      },
      transactionToEdit?.id
    );
    onClose();
  };

  const activeCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-bold text-neutral-900">
            {transactionToEdit ? 'Ubah Transaksi' : 'Catat Transaksi Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Transaction Type Segmented Toggle */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-white text-red-600 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Pemasukan</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              Nominal Transaksi (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-base font-bold text-neutral-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={amountStr}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-300 font-mono text-xl font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900 tabular-nums"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_AMOUNTS.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => handleQuickAddAmount(chip.value)}
                  className="px-2.5 py-1 text-xs font-mono rounded-md bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Live Daily Budget Warning Notification */}
            {willOverbudgetDaily && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Peringatan:</span> Transaksi ini akan membuat pengeluaran hari ini mencapai{' '}
                  <strong>{projectedDailyPercent}%</strong> dari batas harian ({formatRupiah(budgetConfig.dailyLimit)}).
                </div>
              </div>
            )}
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              Kategori
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {activeCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors truncate ${
                    category === cat
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Wallet / Source Account */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              Sumber Akun / Dompet
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({formatRupiah(w.balance)})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                Tanggal
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                Waktu
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Note / Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
              Catatan Transaksi (Opsional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Makan siang rendang, Bensin Shell, Token listrik"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>

          {/* Recurring Option */}
          <div className="pt-1 border-t border-neutral-100 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span className="text-xs text-neutral-700 font-medium">Transaksi Berulang (Rutin)</span>
            </label>
            {isRecurring && (
              <select
                value={recurringFrequency}
                onChange={(e) => setRecurringFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="text-xs px-2 py-1 border border-neutral-200 rounded-md bg-white text-neutral-700"
              >
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={numericAmount <= 0}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {transactionToEdit ? 'Simpan Perubahan' : 'Catat Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
