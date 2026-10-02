import React, { useState } from 'react';
import { 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  CreditCard, 
  ArrowDownLeft, 
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';
import { BillReminder, DebtItem, Wallet } from '../types/finance';
import { formatRupiah, formatNumber, parseRupiahInput, formatDateIndo } from '../utils/formatters';
import { DebtModal } from './DebtModal';
import { DebtPaymentModal } from './DebtPaymentModal';

interface BillsAndDebtsViewProps {
  bills: BillReminder[];
  debts: DebtItem[];
  wallets: Wallet[];
  onUpdateBills: (bills: BillReminder[]) => void;
  onSaveDebt: (
    debtData: Omit<DebtItem, 'id'>,
    idToEdit?: string,
    syncWallet?: { enabled: boolean; walletId: string }
  ) => void;
  onDeleteDebt: (id: string) => void;
  onProcessDebtPayment: (
    debtId: string,
    amountToPay: number,
    walletId?: string
  ) => void;
  onPayBillWithWallet: (bill: BillReminder, walletId: string) => void;
}

export const BillsAndDebtsView: React.FC<BillsAndDebtsViewProps> = ({
  bills,
  debts,
  wallets,
  onUpdateBills,
  onSaveDebt,
  onDeleteDebt,
  onProcessDebtPayment,
  onPayBillWithWallet,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bills' | 'debts'>('debts');

  // Modals
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [debtToEdit, setDebtToEdit] = useState<DebtItem | null>(null);
  const [paymentTargetDebt, setPaymentTargetDebt] = useState<DebtItem | null>(null);

  // New bill state
  const [billTitle, setBillTitle] = useState('');
  const [billAmountStr, setBillAmountStr] = useState('');
  const [billDueDay, setBillDueDay] = useState(15);
  const [billCategory, setBillCategory] = useState('Tagihan & Utilitas');
  const [billWalletId, setBillWalletId] = useState(wallets[0]?.id || '');

  // Bill metrics
  const totalBillsAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidBillsAmount = bills.filter((b) => b.isPaid).reduce((sum, b) => sum + b.amount, 0);
  const unpaidBillsAmount = totalBillsAmount - paidBillsAmount;

  // Debt metrics
  const activeDebtsList = debts.filter((d) => d.type === 'debt' && d.status === 'active');
  const totalDebts = activeDebtsList.reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);

  const activeReceivablesList = debts.filter((d) => d.type === 'receivable' && d.status === 'active');
  const totalReceivables = activeReceivablesList.reduce((sum, d) => sum + (d.amount - (d.paidAmount || 0)), 0);

  const handleToggleBillStatus = (bill: BillReminder) => {
    if (!bill.isPaid) {
      onPayBillWithWallet(bill, bill.walletId || wallets[0]?.id || '');
    } else {
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

  const handleDeleteBill = (id: string) => {
    if (confirm('Hapus pengingat tagihan ini?')) {
      onUpdateBills(bills.filter((b) => b.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-2xl border border-neutral-200/70 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-neutral-900">Tagihan Rutin & Hutang Piutang</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Pantau seluruh kewajiban pinjaman dan tagihan rutin dengan integrasi saldo dompet.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('debts')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSubTab === 'debts' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Hutang & Piutang ({debts.length})
          </button>
          <button
            onClick={() => setActiveSubTab('bills')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeSubTab === 'bills' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Tagihan Rutin ({bills.length})
          </button>
        </div>
      </div>

      {/* Unified Obligation Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 bg-white rounded-2xl border border-neutral-200/70 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Hutang (Wajib Dibayar)</span>
            <span className="w-2 h-2 rounded-full bg-red-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-red-600 tabular-nums">
            {formatRupiah(totalDebts)}
          </div>
          <p className="text-[11px] text-neutral-400">
            {activeDebtsList.length} catatan hutang belum lunas
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200/70 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Piutang (Hak Tagih)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-neutral-900 tabular-nums">
            {formatRupiah(totalReceivables)}
          </div>
          <p className="text-[11px] text-neutral-400">
            {activeReceivablesList.length} orang meminjam uang Anda
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-neutral-200/70 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tagihan Rutin Belum Lunas</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-800 tabular-nums">
            {formatRupiah(unpaidBillsAmount)}
          </div>
          <p className="text-[11px] text-neutral-400">
            Kewajiban utilitas & langganan bulan ini
          </p>
        </div>
      </div>

      {activeSubTab === 'debts' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Daftar Hutang & Piutang</h3>
              <p className="text-xs text-neutral-500">
                Kelola, edit, cicil, atau lunasi pinjaman dengan sinkronisasi ke saldo kas.
              </p>
            </div>
            <button
              onClick={() => {
                setDebtToEdit(null);
                setIsDebtModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Pinjaman</span>
            </button>
          </div>

          {debts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200/70 text-xs text-neutral-400 space-y-2">
              <CreditCard className="w-8 h-8 mx-auto text-neutral-300" />
              <p>Belum ada catatan hutang atau piutang.</p>
              <button
                onClick={() => {
                  setDebtToEdit(null);
                  setIsDebtModalOpen(true);
                }}
                className="text-xs font-semibold text-neutral-900 underline"
              >
                + Tambah Catatan Baru
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200/70 divide-y divide-neutral-100 overflow-hidden shadow-xs">
              {debts.map((item) => {
                const isReceivable = item.type === 'receivable';
                const isSettled = item.status === 'settled';
                const paid = item.paidAmount || 0;
                const remaining = Math.max(0, item.amount - paid);
                const pct = item.amount > 0 ? Math.min(100, Math.round((paid / item.amount) * 100)) : 0;

                return (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/40 transition-colors">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isReceivable ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                        }`}>
                          {isReceivable ? 'Piutang (Hak Anda)' : 'Hutang Saya (Kewajiban)'}
                        </span>

                        <span className="text-xs font-bold text-neutral-900 truncate">
                          {item.personName}
                        </span>

                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isSettled ? 'bg-emerald-100 text-emerald-800 font-semibold' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {isSettled ? 'Lunas' : 'Belum Lunas'}
                        </span>
                      </div>

                      {item.note && (
                        <p className="text-xs text-neutral-600 truncate max-w-lg">{item.note}</p>
                      )}

                      <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-2">
                        <span>Jatuh Tempo: {formatDateIndo(item.dueDate)}</span>
                        {item.paidAmount > 0 && !isSettled && (
                          <>
                            <span>·</span>
                            <span>Terbayar: {formatRupiah(item.paidAmount)} ({pct}%)</span>
                          </>
                        )}
                      </div>

                      {/* Progress Bar if partially paid */}
                      {!isSettled && paid > 0 && (
                        <div className="h-1.5 w-48 bg-neutral-100 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${isReceivable ? 'bg-emerald-500' : 'bg-neutral-800'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                      <div className="text-left sm:text-right">
                        <div className="font-mono text-sm sm:text-base font-bold text-neutral-900 tabular-nums">
                          {formatRupiah(item.amount)}
                        </div>
                        {!isSettled ? (
                          <div className="text-[11px] font-mono text-red-600 font-semibold">
                            Sisa: {formatRupiah(remaining)}
                          </div>
                        ) : (
                          <div className="text-[11px] font-mono text-emerald-700">
                            Selesai Lunas
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {!isSettled && (
                          <button
                            onClick={() => setPaymentTargetDebt(item)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs whitespace-nowrap"
                          >
                            {isReceivable ? 'Terima Pelunasan' : 'Bayar / Cicil'}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setDebtToEdit(item);
                            setIsDebtModalOpen(true);
                          }}
                          title="Ubah data"
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Hapus catatan ${isReceivable ? 'piutang' : 'hutang'} ini?`)) {
                              onDeleteDebt(item.id);
                            }
                          }}
                          title="Hapus data"
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Tagihan Rutin Bulanan</h3>
              <p className="text-xs text-neutral-500">
                Centang untuk melunasi tagihan langsung memotong saldo dompet Anda.
              </p>
            </div>
            <button
              onClick={() => setIsAddBillOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Tagihan</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200/70 divide-y divide-neutral-100 overflow-hidden shadow-xs">
            {bills.map((bill) => {
              const wallet = wallets.find((w) => w.id === bill.walletId);
              return (
                <div key={bill.id} className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-neutral-50/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleBillStatus(bill)}
                      title={bill.isPaid ? 'Tandai belum bayar' : 'Bayar sekarang'}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                        bill.isPaid 
                          ? 'bg-emerald-600 border-emerald-600 text-white' 
                          : 'border-neutral-300 text-neutral-400 hover:border-neutral-900'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold truncate ${bill.isPaid ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
                          {bill.title}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 font-mono shrink-0">
                          Tiap Tgl {bill.dueDay}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono mt-0.5 truncate">
                        {bill.category} · Akun: {wallet?.name || 'Dompet'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold text-neutral-900 tabular-nums">
                        {formatRupiah(bill.amount)}
                      </div>
                      <span className={`text-[11px] font-medium ${bill.isPaid ? 'text-emerald-700' : 'text-amber-800'}`}>
                        {bill.isPaid ? 'Lunas' : 'Belum Bayar'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteBill(bill.id)}
                      title="Hapus tagihan"
                      className="p-1.5 text-neutral-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {isAddBillOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200/80 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-bold text-neutral-900">Tambah Tagihan Rutin</h3>
              <button onClick={() => setIsAddBillOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBill} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Nama Tagihan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: WiFi Rumah, Listrik PLN, Sewa Kost"
                  value={billTitle}
                  onChange={(e) => setBillTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Nominal Tagihan (Rp)</label>
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
                  className="w-full px-3 py-2 font-mono font-bold rounded-xl border border-neutral-300 text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Tanggal Jatuh Tempo</label>
                  <select
                    value={billDueDay}
                    onChange={(e) => setBillDueDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-neutral-900 bg-white"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>Tiap Tanggal {d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Sumber Rekening</label>
                  <select
                    value={billWalletId}
                    onChange={(e) => setBillWalletId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-neutral-900 bg-white"
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
                  className="px-4 py-2 font-semibold rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  Simpan Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Debt Add/Edit Modal */}
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => {
          setIsDebtModalOpen(false);
          setDebtToEdit(null);
        }}
        debtToEdit={debtToEdit}
        wallets={wallets}
        onSave={onSaveDebt}
      />

      {/* Debt Partial/Full Payment Modal with Wallet Sync */}
      <DebtPaymentModal
        isOpen={!!paymentTargetDebt}
        onClose={() => setPaymentTargetDebt(null)}
        debt={paymentTargetDebt}
        wallets={wallets}
        onProcessPayment={onProcessDebtPayment}
      />
    </div>
  );
};
