import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { DebtItem, Wallet } from '../types/finance';
import { formatRupiah, formatNumber, parseRupiahInput } from '../utils/formatters';

interface DebtPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: DebtItem | null;
  wallets: Wallet[];
  onProcessPayment: (
    debtId: string,
    amountToPay: number,
    walletId?: string
  ) => void;
}

export const DebtPaymentModal: React.FC<DebtPaymentModalProps> = ({
  isOpen,
  onClose,
  debt,
  wallets,
  onProcessPayment,
}) => {
  const [payAmountStr, setPayAmountStr] = useState('');
  const [deductFromWallet, setDeductFromWallet] = useState(true);
  const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id || '');

  const remainingDebt = debt ? Math.max(0, debt.amount - debt.paidAmount) : 0;
  const isDebt = debt?.type === 'debt';

  useEffect(() => {
    if (debt) {
      const remaining = Math.max(0, debt.amount - debt.paidAmount);
      setPayAmountStr(formatNumber(remaining));
      setDeductFromWallet(true);
      setSelectedWalletId(wallets[0]?.id || '');
    }
  }, [debt, wallets, isOpen]);

  if (!isOpen || !debt) return null;

  const numPayAmount = parseRupiahInput(payAmountStr);
  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const isOverRemaining = numPayAmount > remainingDebt;
  const isInsufficientWallet = isDebt && deductFromWallet && selectedWallet
    ? numPayAmount > selectedWallet.balance
    : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numPayAmount <= 0 || isInsufficientWallet) return;

    onProcessPayment(
      debt.id,
      numPayAmount,
      deductFromWallet ? selectedWalletId : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200/80 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              {isDebt ? 'Bayar / Cicil Hutang' : 'Terima Pembayaran Piutang'}
            </h2>
            <p className="text-[11px] text-neutral-500">{debt.personName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 space-y-1">
            <div className="flex justify-between text-neutral-500">
              <span>Total Pokok:</span>
              <span className="font-mono font-medium text-neutral-900">{formatRupiah(debt.amount)}</span>
            </div>
            <div className="flex justify-between text-neutral-500">
              <span>Sudah Terbayar:</span>
              <span className="font-mono font-medium text-neutral-900">{formatRupiah(debt.paidAmount)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t border-neutral-200/60">
              <span className="text-neutral-800">Sisa Kewajiban:</span>
              <span className="font-mono text-neutral-950 font-bold">{formatRupiah(remainingDebt)}</span>
            </div>
          </div>

          <div>
            <label className="block text-neutral-700 font-semibold mb-1">
              {isDebt ? 'Nominal yang Dibayarkan (Rp)' : 'Nominal yang Diterima (Rp)'}
            </label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={payAmountStr}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                setPayAmountStr(raw ? formatNumber(parseInt(raw, 10)) : '');
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 font-mono text-base font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
            {numPayAmount >= remainingDebt && (
              <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Hutang ini akan dinyatakan Lunas.
              </p>
            )}
          </div>

          {/* Wallet Deduct / Credit Option */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={deductFromWallet}
                onChange={(e) => setDeductFromWallet(e.target.checked)}
                className="rounded text-neutral-900 focus:ring-neutral-900"
              />
              <span className="font-semibold text-neutral-800">
                {isDebt
                  ? 'Potong saldo dompet & catat pengeluaran'
                  : 'Tambahkan ke saldo dompet & catat pemasukan'}
              </span>
            </label>

            {deductFromWallet && (
              <div className="pl-6 pt-1">
                <label className="block text-[11px] text-neutral-500 mb-1">
                  {isDebt ? 'Bayar menggunakan dompet:' : 'Simpan uang ke dompet:'}
                </label>
                <select
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 bg-white text-neutral-900"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Saldo: {formatRupiah(w.balance)})
                    </option>
                  ))}
                </select>
                {isInsufficientWallet && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    Saldo dompet tidak mencukupi untuk pembayaran ini.
                  </p>
                )}
              </div>
            )}
          </div>

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
              disabled={numPayAmount <= 0 || isInsufficientWallet}
              className="px-5 py-2 font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              Konfirmasi Pembayaran
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
