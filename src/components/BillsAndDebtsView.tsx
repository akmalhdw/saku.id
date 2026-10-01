import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Plus, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Check, 
  X,
  CreditCard,
  Calendar
} from 'lucide-react';
import { BillReminder, DebtItem, Wallet } from '../types/finance';
import { formatRupiah, formatNumber, parseRupiahInput, formatDateIndo } from '../utils/formatters';

interface BillsAndDebtsViewProps {
  bills: BillReminder[];
  debts: DebtItem[];
  wallets: Wallet[];
  onUpdateBills: (bills: BillReminder[]) => void;
  onUpdateDebts: (debts: DebtItem[]) => void;
  onPayBillWithWallet: (bill: BillReminder, walletId: string) => void;
}

export const BillsAndDebtsView: React.FC<BillsAndDebtsViewProps> = ({
  bills,
  debts,
  wallets,
  onUpdateBills,
  onUpdateDebts,
  onPayBillWithWallet,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bills' | 'debts'>('bills');
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false);

  // New bill state
  const [billTitle, setBillTitle] = useState('');
  const [billAmountStr, setBillAmountStr] = useState('');
  const [billDueDay, setBillDueDay] = useState(15);
  const [billCategory, setBillCategory] = useState('Tagihan & Utilitas');
  const [billWalletId, setBillWalletId] = useState(wallets[0]?.id || '');

  // New debt state
  const [debtType, setDebtType] = useState<'debt' | 'receivable'>('receivable');
  const [debtPerson, setDebtPerson] = useState('');
  const [debtAmountStr, setDebtAmountStr] = useState('');
  const [debtDueDate, setDebtDueDate] = useState('2026-10-25');
  const [debtNote, setDebtNote] = useState('');

  // Bill metrics
  const totalBillsAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidBillsAmount = bills.filter((b) => b.isPaid).reduce((sum, b) => sum + b.amount, 0);
  const unpaidBillsAmount = totalBillsAmount - paidBillsAmount;

  // Debt metrics
  const totalReceivables = debts.filter((d) => d.type === 'receivable' && d.status === 'active')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  const totalDebts = debts.filter((d) => d.type === 'debt' && d.status === 'active')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const handleToggleBillStatus = (bill: BillReminder) => {
    if (!bill.isPaid) {
      // Prompt payment with wallet
      onPayBillWithWallet(bill, bill.walletId || wallets[0]?.id || '');
    } else {
      // Revert status
      const updated = bills.map((b) => b.id === bill.id ? { ...b, isPaid: false } : b);
      onUpdateBills(updated);
    }
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billTitle.trim()) return;

    const newB: BillReminder = {
      id: `br-${Date.now()}`,
      title: billTitle.trim(),
      amount: parseRupiahInput(billAmountStr),
      dueDay: Number(billDueDay),
      category: billCategory,
      walletId: billWalletId,
      isPaid: false,
      autoDeduct: false,
    };

    onUpdateBills([...bills, newB]);
    setIsAddBillOpen(false);
    setBillTitle('');
    setBillAmountStr('');
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtPerson.trim()) return;

    const amt = parseRupiahInput(debtAmountStr);
    const newD: DebtItem = {
      id: `db-${Date.now()}`,
      type: debtType,
      personName: debtPerson.trim(),
      amount: amt,
      paidAmount: 0,
      dueDate: debtDueDate,
      note: debtNote.trim(),
      status: 'active',
    };

    onUpdateDebts([...debts, newD]);
    setIsAddDebtOpen(false);
    setDebtPerson('');
    setDebtAmountStr('');
    setDebtNote('');
  };

  const handleSettleDebt = (debtId: string) => {
    const updated = debts.map((d) => {
      if (d.id === debtId) {
        return { ...d, paidAmount: d.amount, status: 'settled' as const };
      }
      return d;
    });
    onUpdateDebts(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-neutral-900">Tagihan Rutin & Hutang Piutang</h2>
          <p className="text-xs text-neutral-500">
            Pastikan tagihan bulanan tidak terlewat dan catat pinjaman agar keuangan tetap rapi dan berkah.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('bills')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSubTab === 'bills' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Tagihan Rutin ({bills.length})
          </button>
          <button
            onClick={() => setActiveSubTab('debts')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeSubTab === 'debts' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Hutang & Piutang ({debts.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'bills' ? (
        <div className="space-y-5">
          {/* Bill Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
              <span className="text-xs text-neutral-500 uppercase font-semibold">Total Tagihan Bulanan</span>
              <div className="text-xl font-bold font-mono text-neutral-900 mt-1 tabular-nums">
                {formatRupiah(totalBillsAmount)}
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
              <span className="text-xs text-neutral-500 uppercase font-semibold">Sudah Terbayar</span>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-1 tabular-nums">
                {formatRupiah(paidBillsAmount)}
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
              <span className="text-xs text-neutral-500 uppercase font-semibold">Belum Dibayar</span>
              <div className="text-xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
                {formatRupiah(unpaidBillsAmount)}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-neutral-900">Daftar Tagihan Rutin Bulan Ini</h3>
            <button
              onClick={() => setIsAddBillOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Tagihan</span>
            </button>
          </div>

          {/* Bills List */}
          <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100 shadow-xs">
            {bills.map((bill) => {
              const wallet = wallets.find((w) => w.id === bill.walletId);
              return (
                <div key={bill.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleBillStatus(bill)}
                      title={bill.isPaid ? 'Tandai belum bayar' : 'Bayar sekarang'}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                        bill.isPaid 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'border-neutral-300 text-neutral-400 hover:border-neutral-900'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${bill.isPaid ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                          {bill.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono">
                          Tiap Tgl {bill.dueDay}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        {bill.category} · Sumber: {wallet?.name || 'Dompet'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-neutral-900 tabular-nums">
                      {formatRupiah(bill.amount)}
                    </div>
                    <span className={`text-[11px] font-medium ${bill.isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {bill.isPaid ? 'Lunas Bulan Ini' : 'Menunggu Pembayaran'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Debts Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <ArrowDownLeft className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">Total Piutang (Orang Berhutang ke Anda)</span>
              </div>
              <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
                {formatRupiah(totalReceivables)}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">Uang Anda yang belum kembali</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-xs">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <ArrowUpRight className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase">Total Hutang (Anda Berhutang ke Orang)</span>
              </div>
              <div className="text-2xl font-bold font-mono text-neutral-900 tabular-nums">
                {formatRupiah(totalDebts)}
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">Kewajiban bayar yang harus diselesaikan</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-neutral-900">Catatan Hutang & Piutang</h3>
            <button
              onClick={() => setIsAddDebtOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Catatan</span>
            </button>
          </div>

          {/* Debts List */}
          <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100 shadow-xs">
            {debts.map((item) => {
              const isReceivable = item.type === 'receivable';
              const isSettled = item.status === 'settled';

              return (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        isReceivable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {isReceivable ? 'Piutang' : 'Hutang Saya'}
                      </span>
                      <span className="text-xs font-bold text-neutral-900">{item.personName}</span>
                      {isSettled && (
                        <span className="text-[10px] text-neutral-500 font-mono bg-neutral-100 px-1.5 py-0.5 rounded">
                          Lunas
                        </span>
                      )}
                    </div>
                    {item.note && (
                      <p className="text-xs text-neutral-600 mt-1">{item.note}</p>
                    )}
                    <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                      Jatuh Tempo: {formatDateIndo(item.dueDate)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-neutral-900 tabular-nums">
                        {formatRupiah(item.amount)}
                      </div>
                      {item.paidAmount > 0 && !isSettled && (
                        <div className="text-[10px] text-neutral-500 font-mono">
                          Terbayar: {formatRupiah(item.paidAmount)}
                        </div>
                      )}
                    </div>

                    {!isSettled && (
                      <button
                        onClick={() => handleSettleDebt(item.id)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors whitespace-nowrap"
                      >
                        Tandai Lunas
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {isAddBillOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">Tambah Tagihan Rutin</h3>
              <button onClick={() => setIsAddBillOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Nama Tagihan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: WiFi Rumah, Listrik PLN, Sewa Kost"
                  value={billTitle}
                  onChange={(e) => setBillTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Nominal Tagihan (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="0"
                  value={billAmountStr}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setBillAmountStr(raw ? formatNumber(parseInt(raw, 10)) : '');
                  }}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-neutral-300 text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Tanggal Jatuh Tempo</label>
                  <select
                    value={billDueDay}
                    onChange={(e) => setBillDueDay(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-900 bg-white"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>Tiap Tanggal {d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Sumber Rekening</label>
                  <select
                    value={billWalletId}
                    onChange={(e) => setBillWalletId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-900 bg-white"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddBillOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-300 text-neutral-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  Simpan Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Debt Modal */}
      {isAddDebtOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">Catat Hutang / Piutang</h3>
              <button onClick={() => setIsAddDebtOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDebt} className="space-y-4">
              <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDebtType('receivable')}
                  className={`py-1.5 rounded-md ${debtType === 'receivable' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-neutral-600'}`}
                >
                  Piutang (Orang Lain Pinjam)
                </button>
                <button
                  type="button"
                  onClick={() => setDebtType('debt')}
                  className={`py-1.5 rounded-md ${debtType === 'debt' ? 'bg-white text-red-700 shadow-2xs' : 'text-neutral-600'}`}
                >
                  Hutang (Saya Pinjam)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Nama Orang / Rekan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={debtPerson}
                  onChange={(e) => setDebtPerson(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Nominal (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="0"
                    value={debtAmountStr}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setDebtAmountStr(raw ? formatNumber(parseInt(raw, 10)) : '');
                    }}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-neutral-300 text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Target Pelunasan</label>
                  <input
                    type="date"
                    required
                    value={debtDueDate}
                    onChange={(e) => setDebtDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Catatan / Keperluan</label>
                <input
                  type="text"
                  placeholder="Contoh: Talangan tiket konser Coldplay"
                  value={debtNote}
                  onChange={(e) => setDebtNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddDebtOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-300 text-neutral-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
