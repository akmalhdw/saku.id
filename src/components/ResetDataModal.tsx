import React from 'react';
import { X, RotateCcw, Trash2, Sparkles, ShieldAlert } from 'lucide-react';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetTransactionsOnly: () => void;
  onResetToCleanZero: () => void;
  onResetToDemoData: () => void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({
  isOpen,
  onClose,
  onResetTransactionsOnly,
  onResetToCleanZero,
  onResetToDemoData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200/80 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-neutral-900" />
            <h2 className="text-sm font-bold text-neutral-900">Kelola & Reset Database Lokal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3.5 text-xs text-neutral-600">
          <p className="leading-relaxed">
            Semua data tersimpan privat di memori lokal HP Anda. Pilih cara Anda ingin mengatur ulang data:
          </p>

          {/* Option 1: Reset Transactions Only (Nolkan Pengeluaran & Pemasukan) */}
          <div 
            onClick={() => {
              onResetTransactionsOnly();
              onClose();
            }}
            className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50/60 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
              <RotateCcw className="w-4 h-4 text-red-600 group-hover:text-red-700" />
              <span>Nolkan Pengeluaran & Pemasukan (Hapus Transaksi)</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed pl-6">
              Hapus semua riwayat transaksi sehingga total pengeluaran dan pemasukan bulan ini kembali ke <strong>Rp 0</strong>. Saldo dompet Anda tetap dipertahankan.
            </p>
          </div>

          {/* Option 2: Clean Zero Start */}
          <div 
            onClick={() => {
              onResetToCleanZero();
              onClose();
            }}
            className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50/60 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
              <Trash2 className="w-4 h-4 text-neutral-700 group-hover:text-neutral-900" />
              <span>Mulai Baru dari Nol (Reset Total Saldo Rp 0)</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed pl-6">
              Hapus seluruh data dummy (transaksi, tabungan, hutang). Siapkan dompet dengan saldo 0 tanpa data tiruan, siap diisi keuangan pribadi Anda.
            </p>
          </div>

          {/* Option 3: Load Demo Example */}
          <div 
            onClick={() => {
              onResetToDemoData();
              onClose();
            }}
            className="p-4 rounded-xl border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50/60 cursor-pointer transition-all space-y-1 group"
          >
            <div className="flex items-center gap-2 text-neutral-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Muat Data Contoh Simulasi (Demo)</span>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed pl-6">
              Isi kembali aplikasi dengan contoh data realistis untuk menguji fitur grafik, batasan anggaran harian/mingguan/bulanan, dan simulasi overbudget.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
