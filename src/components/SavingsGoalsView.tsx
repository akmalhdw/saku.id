import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  X, 
  Check, 
  ArrowRight,
  TrendingUp,
  FolderMinus
} from 'lucide-react';
import { SavingsGoal, Wallet } from '../types/finance';
import { formatRupiah, formatNumber, parseRupiahInput, formatDateIndo } from '../utils/formatters';
import { SavingsGoalModal } from './SavingsGoalModal';

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
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState<SavingsGoal | null>(null);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);

  // Deposit modal state
  const [depositAmountStr, setDepositAmountStr] = useState('');
  const [depositWalletId, setDepositWalletId] = useState(wallets[0]?.id || '');

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + (g.currentAmount || 0), 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleSaveGoal = (goalData: Omit<SavingsGoal, 'id'>, idToEdit?: string) => {
    if (idToEdit) {
      const updated = goals.map((g) => (g.id === idToEdit ? { ...goalData, id: idToEdit } : g));
      onUpdateGoals(updated);
    } else {
      const newGoal: SavingsGoal = {
        ...goalData,
        id: `sg-${Date.now()}`,
      };
      onUpdateGoals([...goals, newGoal]);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm('Hapus target tabungan ini?')) {
      onUpdateGoals(goals.filter((g) => g.id !== goalId));
    }
  };

  const handleClearAllGoals = () => {
    if (confirm('Hapus semua target tabungan dummy dan mulai dari nol?')) {
      onUpdateGoals([]);
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-2xl border border-neutral-200/70 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-neutral-900">Target Tabungan & Dana Impian</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Rencanakan masa depan dengan mencatat dan menabung secara teratur untuk setiap impian Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {goals.length > 0 && (
            <button
              onClick={handleClearAllGoals}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-white hover:bg-red-50 text-neutral-600 hover:text-red-700 transition-colors shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kosongkan Semua Tabungan</span>
            </button>
          )}
          <button
            onClick={() => {
              setGoalToEdit(null);
              setIsGoalModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Target Baru</span>
          </button>
        </div>
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
      {goals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200/70 text-xs text-neutral-400 space-y-2">
          <Target className="w-8 h-8 mx-auto text-neutral-300" />
          <p>Belum ada target tabungan yang dibuat.</p>
          <button
            onClick={() => {
              setGoalToEdit(null);
              setIsGoalModalOpen(true);
            }}
            className="text-xs font-semibold text-neutral-900 underline"
          >
            + Buat Target Tabungan Pertama Anda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((goal) => {
            const current = goal.currentAmount || 0;
            const pct = goal.targetAmount > 0 ? Math.round((current / goal.targetAmount) * 100) : 0;
            const remaining = Math.max(0, goal.targetAmount - current);

            return (
              <div
                key={goal.id}
                className="p-5 bg-white rounded-2xl border border-neutral-200/70 shadow-xs space-y-4 hover:border-neutral-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-neutral-900 truncate">{goal.title}</h3>
                      <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
                        Target: {formatDateIndo(goal.targetDate)} · {goal.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {pct}%
                      </span>
                      <button
                        onClick={() => {
                          setGoalToEdit(goal);
                          setIsGoalModalOpen(true);
                        }}
                        title="Ubah Target"
                        className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        title="Hapus Target"
                        className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {goal.notes && (
                    <p className="text-xs text-neutral-600 line-clamp-2">
                      {goal.notes}
                    </p>
                  )}

                  <div>
                    <div className="flex items-baseline justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-neutral-900 tabular-nums">
                        {formatRupiah(current)}
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
                      {pct >= 100 && <span className="text-emerald-700 font-semibold">Tercapai! 🎉</span>}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setGoalToEdit(goal);
                      setIsGoalModalOpen(true);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Ubah Nilai</span>
                  </button>
                  <button
                    onClick={() => setDepositGoal(goal)}
                    className="flex-1 py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Setor Tabungan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Add/Edit Modal */}
      <SavingsGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setGoalToEdit(null);
        }}
        goalToEdit={goalToEdit}
        onSave={handleSaveGoal}
      />

      {/* Deposit to Goal Modal */}
      {depositGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Setor ke Tabungan</h3>
                <p className="text-xs text-neutral-500">{depositGoal.title}</p>
              </div>
              <button
                onClick={() => setDepositGoal(null)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProcessDeposit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">
                  Nominal Setoran (Rp)
                </label>
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
                  className="w-full px-3 py-2 font-mono font-bold rounded-xl border border-neutral-300 text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">
                  Pilih Sumber Rekening / Dompet
                </label>
                <select
                  value={depositWalletId}
                  onChange={(e) => setDepositWalletId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-neutral-900 bg-white"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} (Saldo: {formatRupiah(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDepositGoal(null)}
                  className="px-4 py-2 font-semibold rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  Konfirmasi Setoran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
