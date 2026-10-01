import React, { useState } from 'react';
import { 
  Wallet as WalletIcon, 
  Plus, 
  ArrowRightLeft, 
  Building2, 
  Smartphone, 
  TrendingUp, 
  Banknote,
  Edit2,
  Trash2,
  Check
} from 'lucide-react';
import { Wallet, WalletType, Transaction } from '../types/finance';
import { formatRupiah, formatNumber, parseRupiahInput } from '../utils/formatters';

interface WalletsViewProps {
  wallets: Wallet[];
  transactions: Transaction[];
  onOpenTransferModal: () => void;
  onUpdateWallets: (wallets: Wallet[]) => void;
}

export const WalletsView: React.FC<WalletsViewProps> = ({
  wallets,
  transactions,
  onOpenTransferModal,
  onUpdateWallets,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  // Form states
  const [walletName, setWalletName] = useState('');
  const [walletType, setWalletType] = useState<WalletType>('bank');
  const [walletBalanceStr, setWalletBalanceStr] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [walletColor, setWalletColor] = useState('#2563eb');

  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  const getWalletIcon = (type: WalletType) => {
    switch (type) {
      case 'bank': return <Building2 className="w-5 h-5" />;
      case 'ewallet': return <Smartphone className="w-5 h-5" />;
      case 'investment': return <TrendingUp className="w-5 h-5" />;
      default: return <Banknote className="w-5 h-5" />;
    }
  };

  const getTypeName = (type: WalletType) => {
    switch (type) {
      case 'bank': return 'Rekening Bank';
      case 'ewallet': return 'Dompet Digital (E-Wallet)';
      case 'investment': return 'Investasi / Reksadana';
      default: return 'Kas Tunai';
    }
  };

  const handleOpenAdd = () => {
    setEditingWallet(null);
    setWalletName('');
    setWalletType('bank');
    setWalletBalanceStr('');
    setAccountNumber('');
    setWalletColor('#2563eb');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (w: Wallet) => {
    setEditingWallet(w);
    setWalletName(w.name);
    setWalletType(w.type);
    setWalletBalanceStr(formatNumber(w.balance));
    setAccountNumber(w.accountNumber || '');
    setWalletColor(w.color);
    setIsAddModalOpen(true);
  };

  const handleDeleteWallet = (id: string) => {
    if (wallets.length <= 1) {
      alert('Minimal harus memiliki 1 dompet/akun aktif.');
      return;
    }
    if (confirm('Yakin ingin menghapus akun ini?')) {
      onUpdateWallets(wallets.filter((w) => w.id !== id));
    }
  };

  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletName.trim()) return;

    const numBalance = parseRupiahInput(walletBalanceStr);

    if (editingWallet) {
      const updated = wallets.map((w) => 
        w.id === editingWallet.id
          ? {
              ...w,
              name: walletName.trim(),
              type: walletType,
              balance: numBalance,
              accountNumber: accountNumber.trim() || undefined,
              color: walletColor,
            }
          : w
      );
      onUpdateWallets(updated);
    } else {
      const newWallet: Wallet = {
        id: `w-${Date.now()}`,
        name: walletName.trim(),
        type: walletType,
        balance: numBalance,
        accountNumber: accountNumber.trim() || undefined,
        color: walletColor,
        iconName: walletType === 'bank' ? 'Building2' : walletType === 'ewallet' ? 'Smartphone' : 'Banknote',
      };
      onUpdateWallets([...wallets, newWallet]);
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-neutral-900">Dompet & Rekening Keuangan</h2>
          <p className="text-xs text-neutral-500">
            Kelola saldo kas tunai, rekening bank, dan e-wallet Anda di satu tempat terpadu.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-2xs"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer Antar Dompet</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Akun Baru</span>
          </button>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="p-6 bg-neutral-900 text-white rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-neutral-400">Total Akumulasi Saldo Bersih</span>
          <div className="text-3xl font-bold font-mono tracking-tight text-white mt-1 tabular-nums">
            {formatRupiah(totalBalance)}
          </div>
        </div>
        <div className="text-xs text-neutral-400 font-mono">
          Tersebar di {wallets.length} Akun Penyimpanan
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {wallets.map((wallet) => {
          const walletTxs = transactions.filter((t) => t.walletId === wallet.id);
          const totalOut = walletTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

          return (
            <div
              key={wallet.id}
              className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs hover:border-neutral-300 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2.5 rounded-lg text-white"
                    style={{ backgroundColor: wallet.color }}
                  >
                    {getWalletIcon(wallet.type)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">{wallet.name}</h3>
                    <p className="text-[11px] text-neutral-500">{getTypeName(wallet.type)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(wallet)}
                    title="Ubah info akun"
                    className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteWallet(wallet.id)}
                    title="Hapus akun"
                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-500">Saldo Tersedia</div>
                <div className="text-2xl font-bold font-mono text-neutral-900 tracking-tight mt-0.5 tabular-nums">
                  {formatRupiah(wallet.balance)}
                </div>
                {wallet.accountNumber && (
                  <div className="text-[11px] text-neutral-400 font-mono mt-1">
                    No. Rek: {wallet.accountNumber}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500 font-mono">
                <span>{walletTxs.length} Transaksi Tercatat</span>
                <span>Keluar: {formatRupiah(totalOut, true)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Wallet Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-neutral-900">
              {editingWallet ? 'Ubah Informasi Dompet' : 'Tambah Akun Baru'}
            </h3>

            <form onSubmit={handleSaveWallet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Nama Akun / Dompet</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BCA Prioritas, Tunai Saku, GoPay"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Tipe Akun</label>
                <select
                  value={walletType}
                  onChange={(e) => setWalletType(e.target.value as WalletType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-900 bg-white"
                >
                  <option value="bank">Rekening Bank</option>
                  <option value="cash">Kas Tunai</option>
                  <option value="ewallet">E-Wallet (GoPay, OVO, ShopeePay)</option>
                  <option value="investment">Investasi & Tabungan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Saldo Awal / Sekarang (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="0"
                  value={walletBalanceStr}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setWalletBalanceStr(raw ? formatNumber(parseInt(raw, 10)) : '');
                  }}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-neutral-300 text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Nomor Rekening / ID (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: 821-002-1922"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Warna Label</label>
                <div className="flex items-center gap-2">
                  {['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0284c7', '#4b5563'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setWalletColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        walletColor === c ? 'scale-110 border-neutral-900' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-300 text-neutral-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
