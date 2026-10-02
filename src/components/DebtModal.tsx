import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { DebtItem, Wallet } from '../types/finance';
import { formatNumber, parseRupiahInput, getTodayString } from '../utils/formatters';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debtToEdit?: DebtItem | null;
  wallets: Wallet[];
  onSave: (
    debtData: Omit<DebtItem, 'id'>,
    idToEdit?: string,
    syncWallet?: { enabled: boolean; walletId: string }
  ) => void;
}

export const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  debtToEdit,
  wallets,
  onSave,
}) => {
  const [type, setType] = useState<'debt' | 'receivable'>('debt');
  const [personName, setPersonName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [paidAmountStr, setPaidAmountStr] = useState('0');
  const [dueDate, setDueDate] = useState(getTodayString());
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'active' | 'settled'>('active');

  // Wallet sync option for new debt/receivable
  const [syncWithWallet, setSyncWithWallet] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id || '');

  useEffect(() => {
    if (debtToEdit) {
      setType(debtToEdit.type);
      setPersonName(debtToEdit.personName);
      setAmountStr(formatNumber(debtToEdit.amount));
      setPaidAmountStr(formatNumber(debtToEdit.paidAmount || 0));
      setDueDate(debtToEdit.dueDate || getTodayString());
      setNote(debtToEdit.note || '');
      setStatus(debtToEdit.status);
      setSyncWithWallet(false);
    } else {
      setType('debt');
      setPersonName('');
      setAmountStr('');
      setPaidAmountStr('0');
      setDueDate(getTodayString());
      setNote('');
      setStatus('active');
      setSyncWithWallet(false);
      setSelectedWalletId(wallets[0]?.id || '');
    }
  }, [debtToEdit, isOpen, wallets]);

  if (!isOpen) return null;

  const numericAmount = parseRupiahInput(amountStr);
  const numericPaid = parseRupiahInput(paidAmountStr);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || numericAmount <= 0) return;

    const isSettled = numericPaid >= numericAmount || status === 'settled';

    onSave(
      {
        type,
        personName: personName.trim(),
        amount: numericAmount,
        paidAmount: Math.min(numericAmount, numericPaid),
        dueDate,
        note: note.trim(),
        status: isSettled ? 'settled' : 'active',
      },
      debtToEdit?.id,
      !debtToEdit && syncWithWallet ? { enabled: true, walletId: selectedWalletId } : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200/80 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-sm font-bold text-neutral-900">
            {debtToEdit ? 'Ubah Catatan Hutang / Piutang' : 'Catat Hutang / Piutang Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Type Segmented Toggle */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('debt')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'debt'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Hutang (Kewajiban Saya)
            </button>
            <button
              type="button"
              onClick={() => setType('receivable')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                type === 'receivable'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Piutang (Hak Saya Ditagih)
            </button>
          </div>

          <div>
            <label className="block text-neutral-600 font-semibold mb-1">
              {type === 'debt' ? 'Nama Pemberi Pinjaman (Kreditur)' : 'Nama Peminjam (Debitur)'}
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso, Bank BCA, dll"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 font-semibold mb-1">Total Pokok (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                required
                placeholder="0"
                value={amountStr}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setAmountStr(raw ? formatNumber(parseInt(raw, 10)) : '');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 font-mono text-sm font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
            <div>
              <label className="block text-neutral-600 font-semibold mb-1">Sudah Dibayar (Rp)</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={paidAmountStr}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setPaidAmountStr(raw ? formatNumber(parseInt(raw, 10)) : '');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 font-mono text-sm font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-600 font-semibold mb-1">Jatuh Tempo</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-neutral-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-neutral-600 font-semibold mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'settled')}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-neutral-900 bg-white"
              >
                <option value="active">Belum Lunas (Aktif)</option>
                <option value="settled">Lunas (Selesai)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-neutral-600 font-semibold mb-1">Keterangan / Keperluan</label>
            <input
              type="text"
              placeholder="Contoh: Talangan beli perlengkapan kantor"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 text-neutral-900"
            />
          </div>

          {/* Sync with Wallet option only for new entries */}
          {!debtToEdit && (
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={syncWithWallet}
                  onChange={(e) => setSyncWithWallet(e.target.checked)}
                  className="rounded text-neutral-900 focus:ring-neutral-900"
                />
                <span className="font-semibold text-neutral-800">
                  {type === 'debt'
                    ? 'Sinkronkan: Masukkan dana pinjaman ke Saldo Dompet'
                    : 'Sinkronkan: Potong dana pinjaman dari Saldo Dompet'}
                </span>
              </label>

              {syncWithWallet && (
                <div className="pl-6 pt-1">
                  <label className="block text-[11px] text-neutral-500 mb-1">Pilih Dompet / Rekening:</label>
                  <select
                    value={selectedWalletId}
                    onChange={(e) => setSelectedWalletId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-900"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={numericAmount <= 0 || !personName.trim()}
              className="px-5 py-2 font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {debtToEdit ? 'Simpan Perubahan' : 'Catat Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
