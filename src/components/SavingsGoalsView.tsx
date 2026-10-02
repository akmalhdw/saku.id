import React, { useState } from 'react';
import { Target, Plus, ShieldCheck, TrendingUp, Sparkles, X, Check, ArrowRight } from 'lucide-react';
import { SavingsGoal, Wallet } from '../types/finance';
import { formatRupiah, formatNumber, parseRupiahInput, formatDateIndo } from '../utils/formatters';

interface SavingsGoalsViewProps {
  goals: SavingsGoal[];
  wallets: Wallet[];
  onUpdateGoals: (goals: SavingsGoal[]) => void;
  onDepositToGoal: (goalId: string, walletId: string, amount: number) => void;
}

export const SavingsGoalsView: React.FC<SavingsGoalsViewProps> = ({
  goals,
  wallets,
  onUpdateGoals,
  onDepositToGoal,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);

  // Form states for new goal
  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [currentAmountStr, setCurrentAmountStr] = useState('0');
  const [targetDate, setTargetDate] = useState('2026-12-31');
  const [category, setCategory] = useState('Dana Darurat');
  const [notes, setNotes] = useState('');

  // Deposit modal state
  const [depositAmountStr, setDepositAmountStr] = useState('');
  const [depositWalletId, setDepositWalletId] = useState(wallets[0]?.id || '');

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newG: SavingsGoal = {
      id: `sg-${Date.now()}`,
      title: title.trim(),
      targetAmount: parseRupiahInput(targetAmountStr),
      currentAmount: parseRupiahInput(currentAmountStr),
      targetDate,
      category,
      color: '#059669',
      notes: notes.trim(),
    };

    onUpdateGoals([...goals, newG]);
    setIsAddOpen(false);
    setTitle('');
    setTargetAmountStr('');
    setCurrentAmountStr('0');
  };

  const handleProcessDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoal) return;
    const amt = parseRupiahInput(depositAmountStr);
    if (amt <= 0) return;

    onDepositToGoal(depositGoal.id, depositWalletId, amt);
    setDepositGoal(null);
    setDepositAmountStr('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-neutral-900">Target Tabungan & Dana Darurat</h2>
          <p className="text-xs text-neutral-500">
            Rencanakan masa depan finansial yang aman dengan disiplin menabung untuk impian dan proteksi darurat.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Target Baru</span>
        </button>
      </div>

      {/* Aggregate Goal Tracker */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-neutral-500 font-medium">Total Akumulasi Tabungan Impian</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-neutral-900 mt-1 tabular-nums">
              {formatRupiah(totalSaved)}
            </div>
            <div className="text-xs text-neutral-500 font-mono mt-0.5">
              Sasaran target: {formatRupiah(totalTarget)} ({overallProgress}% Tercapai)
            </div>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/60 text-left sm:text-right">
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Disiplin Finansial
            </span>
            <p className="text-[11px] text-neutral-500 mt-0.5">Menabung teratur melatih kestabilan anggaran bulanan.</p>
          </div>
        </div>

        {/* Aggregate Progress Bar */}
        <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, overallProgress)}%` }}
          />
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {goals.map((goal) => {
          const pct = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

          return (
            <div
              key={goal.id}
              className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-4 hover:border-neutral-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">{goal.title}</h3>
                    <p className="text-[11px] text-neutral-500 font-mono">
                      Target: {formatDateIndo(goal.targetDate)} · {goal.category}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {pct}%
                  </span>
                </div>

                {goal.notes && (
                  <p className="text-xs text-neutral-600 line-clamp-2">
                    {goal.notes}
                  </p>
                )}

                <div>
                  <div className="flex items-baseline justify-between text-xs mb-1">
                    <span className="font-mono font-bold text-neutral-900 tabular-nums">
                      {formatRupiah(goal.currentAmount)}
                    </span>
                    <span className="font-mono text-neutral-500 text-[11px] tabular-nums">
                      Pagu: {formatRupiah(goal.targetAmount)}
                    </span>
                  </div>

                  <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-1 font-mono">
                    <span>Kurang: {formatRupiah(remaining)}</span>
                    {pct >= 100 && <span className="text-emerald-600 font-semibold">Tercapai! 🎉</span>}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100">
                <button
                  onClick={() => setDepositGoal(goal)}
                  className="w-full py-2 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Setor Tabungan</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit to Goal Modal */}
      {depositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Setor Tabungan</h3>
                <p className="text-xs text-neutral-500">{depositGoal.title}</p>
              </div>
              <button
                onClick={() => setDepositGoal(null)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Ambil Dari Rekening / Dompet</label>
                <select
                  value={depositWalletId}
                  onChange={(e) => setDepositWalletId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-900 bg-white"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Saldo: {formatRupiah(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Jumlah Setoran (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="0"
                  value={depositAmountStr}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setDepositAmountStr(raw ? formatNumber(parseInt(raw, 10)) : '');
                  }}
                  className="w-full px-3 py-2.5 text-base font-mono font-bold rounded-xl border border-neutral-300 text-neutral-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDepositGoal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-300 text-neutral-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  Konfirmasi Setor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">Buat Sasaran Tabungan Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Nama Target Tabungan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dana Darurat 3 Bulan, Liburan ke Bali"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Target Nominal (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="0"
                    value={targetAmountStr}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setTargetAmountStr(raw ? formatNumber(parseInt(raw, 10)) : '');
                    }}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-neutral-300 text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Saldo Awal Terkumpul</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={currentAmountStr}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setCurrentAmountStr(raw ? formatNumber(parseInt(raw, 10)) : '');
                    }}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-neutral-300 text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-900 bg-white"
                  >
                    <option value="Dana Darurat">Dana Darurat</option>
                    <option value="Investasi">Investasi</option>
                    <option value="Pekerjaan & Gadget">Pekerjaan & Gadget</option>
                    <option value="Liburan & Hiburan">Liburan & Hiburan</option>
                    <option value="Pendidikan">Pendidikan</option>
                    <option value="Kendaraan">Kendaraan</option>
                    <option value="Properti & Rumah">Properti & Rumah</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 mb-1">Batas Waktu</label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1">Catatan Strategi (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: Sisihkan Rp 500rb per bulan tiap gajian"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 text-neutral-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-300 text-neutral-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
