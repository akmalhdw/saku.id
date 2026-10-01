import React, { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { Wallet } from '../types/finance';
import { formatRupiah, parseRupiahInput, formatNumber, getTodayString } from '../utils/formatters';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onTransfer: (sourceWalletId: string, destWalletId: string, amount: number, note: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  wallets,
  onTransfer,
}) => {
  const [sourceId, setSourceId] = useState<string>(wallets[0]?.id || '');
  const [destId, setDestId] = useState<string>(wallets[1]?.id || wallets[0]?.id || '');
  const [amountStr, setAmountStr] = useState<string>('');
  const [note, setNote] = useState<string>('Pindah saldo / Tarik tunai');

  if (!isOpen) return null;

  const numericAmount = parseRupiahInput(amountStr);
  const sourceWallet = wallets.find((w) => w.id === sourceId);
  const isInsufficient = sourceWallet ? numericAmount > sourceWallet.balance : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0 || sourceId === destId || isInsufficient) return;
    onTransfer(sourceId, destId, numericAmount, note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-neutral-900" />
            <h2 className="text-base font-bold text-neutral-900">Transfer Antar Dompet</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Dari Akun Asal</label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs text-neutral-900 bg-white"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (Saldo: {formatRupiah(w.balance)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Ke Akun Tujuan</label>
            <select
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs text-neutral-900 bg-white"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id} disabled={w.id === sourceId}>
                  {w.name} (Saldo: {formatRupiah(w.balance)})
                </option>
              ))}
            </select>
            {sourceId === destId && (
              <p className="text-[11px] text-red-600 mt-1">Pilih dompet tujuan yang berbeda dari asal.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Jumlah Transfer (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={amountStr}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                const num = raw ? parseInt(raw, 10) : 0;
                setAmountStr(num > 0 ? formatNumber(num) : '');
              }}
              placeholder="0"
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-300 font-mono text-base font-bold text-neutral-900"
            />
            {isInsufficient && (
              <p className="text-[11px] text-red-600 mt-1">Saldo akun asal tidak mencukupi.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1">Catatan</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs text-neutral-900"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={numericAmount <= 0 || sourceId === destId || isInsufficient}
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proses Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
