import React from 'react';
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  Plus, 
  ArrowRightLeft, 
  Sliders, 
  Calendar, 
  Coffee, 
  Utensils, 
  Fuel, 
  ShoppingBag,
  ArrowRight,
  CreditCard
} from 'lucide-react';
import { Transaction, Wallet, BudgetConfig, DebtItem } from '../types/finance';
import { BudgetAnalysisResult } from '../utils/budgetEngine';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import { BudgetProgressCard } from './BudgetProgressCard';

interface DashboardViewProps {
  wallets: Wallet[];
  transactions: Transaction[];
  debts: DebtItem[];
  analysis: BudgetAnalysisResult;
  budgetConfig: BudgetConfig;
  onOpenAddModal: () => void;
  onOpenTransferModal: () => void;
  onOpenConfigModal: () => void;
  onSelectTab: (tabId: string) => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onQuickAdd: (category: string, amount: number, note: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  wallets,
  transactions,
  debts,
  analysis,
  budgetConfig,
  onOpenAddModal,
  onOpenTransferModal,
  onOpenConfigModal,
  onSelectTab,
  onEditTransaction,
  onDeleteTransaction,
  onQuickAdd,
}) => {
  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  const totalActiveDebt = (debts || [])
    .filter((d) => d.type === 'debt' && d.status === 'active')
    .reduce((acc, d) => acc + (d.amount - d.paidAmount), 0);

  const activeDebtCount = (debts || []).filter((d) => d.type === 'debt' && d.status === 'active').length;

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime())
    .slice(0, 6);

  const walletMap = new Map(wallets.map((w) => [w.id, w]));

  const quickShortcuts = [
    { label: 'Kopi / Minuman', amount: 25000, category: 'Makanan & Minuman', icon: <Coffee className="w-3.5 h-3.5" /> },
    { label: 'Makan Siang', amount: 35000, category: 'Makanan & Minuman', icon: <Utensils className="w-3.5 h-3.5" /> },
    { label: 'Bensin Motor', amount: 30000, category: 'Transportasi', icon: <Fuel className="w-3.5 h-3.5" /> },
    { label: 'Jajan Sore', amount: 20000, category: 'Makanan & Minuman', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* 5 High-Density Key Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Saldo */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Saldo Kas</span>
            <div className="p-2 bg-neutral-100 rounded-lg text-neutral-700">
              <WalletIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-900 tabular-nums">
            {formatRupiah(totalBalance)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between">
            <span>{wallets.length} Dompet/Akun</span>
            <button
              onClick={() => onSelectTab('wallets')}
              className="text-neutral-700 hover:text-neutral-950 font-medium hover:underline text-[11px]"
            >
              Rincian →
            </button>
          </div>
        </div>

        {/* Total Hutang */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Hutang</span>
            <div className={`p-2 rounded-lg ${totalActiveDebt > 0 ? 'bg-red-50 text-red-600' : 'bg-neutral-100 text-neutral-700'}`}>
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums ${
            totalActiveDebt > 0 ? 'text-red-600' : 'text-neutral-900'
          }`}>
            {formatRupiah(totalActiveDebt)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 flex items-center justify-between">
            <span>{activeDebtCount > 0 ? `${activeDebtCount} Tagihan Belum Lunas` : 'Bebas Hutang'}</span>
            <button
              onClick={() => onSelectTab('bills')}
              className="text-neutral-700 hover:text-neutral-950 font-medium hover:underline text-[11px]"
            >
              Kelola →
            </button>
          </div>
        </div>

        {/* Pemasukan Bulan Ini */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pemasukan Bulan Ini</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-emerald-600 tabular-nums">
            +{formatRupiah(analysis.totalIncomeThisMonth)}
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            Arus kas masuk
          </div>
        </div>

        {/* Pengeluaran Bulan Ini */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pengeluaran Bulan Ini</span>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-900 tabular-nums">
            {formatRupiah(analysis.totalExpenseThisMonth)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 font-mono">
            {analysis.monthly.percentage}% kuota bulanan
          </div>
        </div>

        {/* Arus Kas Bersih (Net Cashflow) */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Arus Kas Bersih</span>
            <div className="p-2 bg-neutral-100 rounded-lg text-neutral-700">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-mono tracking-tight tabular-nums ${
            analysis.netCashFlowThisMonth >= 0 ? 'text-neutral-900' : 'text-red-600'
          }`}>
            {analysis.netCashFlowThisMonth >= 0 ? '+' : ''}{formatRupiah(analysis.netCashFlowThisMonth)}
          </div>
          <div className="mt-2 text-xs text-neutral-500 font-mono">
            Tabungan: <strong className="text-neutral-800">{analysis.savingsRate}%</strong>
          </div>
        </div>
      </div>

      {/* Primary Section: Trio Perencanaan Anggaran (Harian, Mingguan, Bulanan) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              Monitoring Anggaran Multi-Periode
            </h3>
            <p className="text-xs text-neutral-500">
              Pantau batas pengeluaran harian, mingguan, dan bulanan secara berjenjang untuk mencegah kebocoran dana.
            </p>
          </div>
          <button
            onClick={onOpenConfigModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Atur Limit</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <BudgetProgressCard
            summary={analysis.daily}
            subtext="Reset otomatis setiap tengah malam"
            onClickConfigure={onOpenConfigModal}
          />
          <BudgetProgressCard
            summary={analysis.weekly}
            subtext="Siklus Senin hingga Minggu"
            onClickConfigure={onOpenConfigModal}
          />
          <BudgetProgressCard
            summary={analysis.monthly}
            subtext={`Alokasi aman per hari tersisa: ${formatRupiah(analysis.recommendedDailyRemaining)}`}
            onClickConfigure={onOpenConfigModal}
          />
        </div>
      </div>

      {/* Quick Add Shortcuts for Fast Daily Logging */}
      <div className="p-4 bg-white rounded-xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-neutral-900">Catat Cepat Pengeluaran Harian</span>
          <p className="text-[11px] text-neutral-500">1-Klik untuk mencatat transaksi rutin tanpa mengetik panjang</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {quickShortcuts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onQuickAdd(item.category, item.amount, item.label)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-xs font-medium transition-colors active:scale-95"
            >
              {item.icon}
              <span>{item.label}</span>
              <span className="font-mono text-[11px] text-neutral-500">({formatRupiah(item.amount, true)})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Split Grid: Recent Transactions & Top Spending Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 columns on lg) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Transaksi Terbaru</h3>
              <p className="text-xs text-neutral-500">Aktivitas keuangan terakhir dicatat</p>
            </div>
            <button
              onClick={() => onSelectTab('transactions')}
              className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua ({transactions.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-10 text-center text-neutral-400 text-xs">
              Belum ada transaksi. Klik "Catat Transaksi" untuk memulai.
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentTransactions.map((tx) => {
                const wallet = walletMap.get(tx.walletId);
                const isExpense = tx.type === 'expense';
                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isExpense ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {isExpense ? '↓' : '↑'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-neutral-900 truncate">
                          {tx.category}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate flex items-center gap-1.5">
                          <span>{formatDateIndo(tx.date)}</span>
                          <span aria-hidden="true">·</span>
                          <span>{wallet?.name || 'Dompet'}</span>
                          {tx.note && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="italic truncate">{tx.note}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`font-mono text-xs sm:text-sm font-bold tabular-nums ${
                        isExpense ? 'text-neutral-900' : 'text-emerald-600'
                      }`}>
                        {isExpense ? '-' : '+'}{formatRupiah(tx.amount)}
                      </div>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="text-[10px] text-neutral-500 hover:text-neutral-900"
                        >
                          Ubah
                        </button>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="text-[10px] text-red-500 hover:text-red-700"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Spending Categories Breakdown */}
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">Alokasi Kategori Terbesar</h3>
            <button
              onClick={() => onSelectTab('budget')}
              className="text-xs text-neutral-600 hover:text-neutral-900 hover:underline"
            >
              Atur Kategori
            </button>
          </div>

          <div className="space-y-3">
            {analysis.categorySummaries.slice(0, 5).map((cat) => {
              const clamped = Math.min(100, cat.percentage);
              const isOver = cat.status === 'danger';
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-800 truncate">{cat.category}</span>
                    <span className="font-mono text-neutral-900 font-bold tabular-nums">
                      {formatRupiah(cat.spent)}
                    </span>
                  </div>
                  {cat.limit > 0 && (
                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isOver ? 'bg-red-500' : cat.percentage >= 80 ? 'bg-amber-500' : 'bg-neutral-800'
                          }`}
                          style={{ width: `${clamped}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                        <span>{cat.percentage}% dari limit {formatRupiah(cat.limit, true)}</span>
                        {isOver && <span className="text-red-600 font-semibold">Overbudget!</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick CTA to Savings Goals */}
          <div className="pt-3 border-t border-neutral-100">
            <button
              onClick={() => onSelectTab('savings')}
              className="w-full py-2 px-3 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-800 flex items-center justify-between transition-colors"
            >
              <span>Target Tabungan & Dana Darurat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
