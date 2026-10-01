import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Calendar, 
  Trash2, 
  Edit3, 
  ArrowDownLeft, 
  ArrowUpRight,
  RefreshCw,
  X
} from 'lucide-react';
import { Transaction, Wallet, TransactionType } from '../types/finance';
import { formatRupiah, formatDateIndo, exportTransactionsToCSV, getTodayString } from '../utils/formatters';

interface TransactionsViewProps {
  transactions: Transaction[];
  wallets: Wallet[];
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  initialCategoryFilter?: string;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  wallets,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  initialCategoryFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all'); // all | expense | income
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryFilter || 'all');
  const [selectedWallet, setSelectedWallet] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all'); // all | today | 7days | thisMonth
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const walletMap = useMemo(() => new Map(wallets.map((w) => [w.id, w])), [wallets]);

  // Unique categories in transactions
  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  }, [transactions]);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    const today = new Date();
    const todayStr = getTodayString();

    return transactions.filter((tx) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNote = tx.note?.toLowerCase().includes(query);
        const matchCat = tx.category.toLowerCase().includes(query);
        const matchAmt = tx.amount.toString().includes(query);
        if (!matchNote && !matchCat && !matchAmt) return false;
      }

      // Type
      if (selectedType !== 'all' && tx.type !== selectedType) return false;

      // Category
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;

      // Wallet
      if (selectedWallet !== 'all' && tx.walletId !== selectedWallet) return false;

      // Time range
      if (selectedTimeRange === 'today') {
        if (tx.date !== todayStr) return false;
      } else if (selectedTimeRange === '7days') {
        const txD = new Date(tx.date);
        const diffDays = (today.getTime() - txD.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7 || diffDays < 0) return false;
      } else if (selectedTimeRange === 'thisMonth') {
        const [y, m] = tx.date.split('-').map(Number);
        if (y !== today.getFullYear() || (m - 1) !== today.getMonth()) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime();
      }
      if (sortBy === 'amount-desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount-asc') {
        return a.amount - b.amount;
      }
      return 0;
    });
  }, [transactions, searchQuery, selectedType, selectedCategory, selectedWallet, selectedTimeRange, sortBy]);

  const totalExpenseFiltered = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncomeFiltered = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const handleExport = () => {
    exportTransactionsToCSV(filteredTransactions, wallets);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedWallet('all');
    setSelectedTimeRange('all');
  };

  const hasActiveFilters = searchQuery !== '' || selectedType !== 'all' || selectedCategory !== 'all' || selectedWallet !== 'all' || selectedTimeRange !== 'all';

  return (
    <div className="space-y-5">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-neutral-900">Buku Kas & Riwayat Transaksi</h2>
          <p className="text-xs text-neutral-500">
            Daftar lengkap pemasukan dan pengeluaran dengan filter fleksibel dan ekspor CSV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi berdasarkan catatan, kategori, nominal..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-neutral-300 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Type Tabs (Segmented control) */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs font-medium shrink-0">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedType === 'all' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedType === 'expense' ? 'bg-white text-red-600 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedType === 'income' ? 'bg-white text-emerald-600 shadow-2xs font-semibold' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Pemasukan
            </button>
          </div>
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-100 text-xs">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 font-medium"
          >
            <option value="all">Semua Kategori</option>
            {uniqueCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Wallet */}
          <select
            value={selectedWallet}
            onChange={(e) => setSelectedWallet(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 font-medium"
          >
            <option value="all">Semua Dompet</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          {/* Time Range */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 font-medium"
          >
            <option value="all">Semua Waktu</option>
            <option value="today">Hari Ini Saja</option>
            <option value="7days">7 Hari Terakhir</option>
            <option value="thisMonth">Bulan Ini</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-700 font-medium ml-auto"
          >
            <option value="date-desc">Urutkan: Tanggal Terbaru</option>
            <option value="date-asc">Urutkan: Tanggal Terlama</option>
            <option value="amount-desc">Urutkan: Nominal Terbesar</option>
            <option value="amount-asc">Urutkan: Nominal Terkecil</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-neutral-500 hover:text-neutral-900 underline ml-2"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Filter Summary Stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-neutral-600 font-mono">
        <span>Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi</span>
        <div className="flex items-center gap-4">
          <span>Total Pengeluaran: <strong className="text-neutral-900">{formatRupiah(totalExpenseFiltered)}</strong></span>
          <span>Total Pemasukan: <strong className="text-emerald-700 font-bold">+{formatRupiah(totalIncomeFiltered)}</strong></span>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-neutral-400 text-xs">
            Tidak ada transaksi yang cocok dengan filter yang dipilih.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Tanggal & Waktu</th>
                  <th className="py-3 px-4">Kategori & Keterangan</th>
                  <th className="py-3 px-4">Dompet / Akun</th>
                  <th className="py-3 px-4 text-right">Nominal</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredTransactions.map((tx) => {
                  const wallet = walletMap.get(tx.walletId);
                  const isExpense = tx.type === 'expense';

                  return (
                    <tr key={tx.id} className="hover:bg-neutral-50/70 transition-colors group">
                      {/* Tanggal & Waktu */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-neutral-900">{formatDateIndo(tx.date)}</div>
                        <div className="text-[11px] text-neutral-400 font-mono">{tx.time || '12:00'}</div>
                      </td>

                      {/* Kategori & Catatan */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isExpense ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          <span className="font-semibold text-neutral-900">{tx.category}</span>
                          {tx.isRecurring && (
                            <span className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1.5 py-0.5 rounded">
                              Rutin {tx.recurringFrequency}
                            </span>
                          )}
                        </div>
                        {tx.note && (
                          <div className="text-[11px] text-neutral-500 mt-0.5 truncate max-w-sm">
                            {tx.note}
                          </div>
                        )}
                      </td>

                      {/* Dompet */}
                      <td className="py-3 px-4 whitespace-nowrap text-neutral-600">
                        {wallet?.name || 'Lainnya'}
                      </td>

                      {/* Nominal */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className={`font-mono font-bold tabular-nums text-sm ${
                          isExpense ? 'text-neutral-900' : 'text-emerald-600'
                        }`}>
                          {isExpense ? '-' : '+'}{formatRupiah(tx.amount)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Ubah transaksi"
                            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded hover:bg-neutral-100 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTransaction(tx.id)}
                            title="Hapus transaksi"
                            className="p-1.5 text-neutral-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
