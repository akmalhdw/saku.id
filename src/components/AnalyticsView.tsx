import React, { useState, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Upload, 
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';
import { Transaction, Wallet, BudgetConfig, SavingsGoal } from '../types/finance';
import { BudgetAnalysisResult } from '../utils/budgetEngine';
import { formatRupiah, downloadJSON, getTodayString } from '../utils/formatters';

interface AnalyticsViewProps {
  analysis: BudgetAnalysisResult;
  transactions: Transaction[];
  wallets: Wallet[];
  budgetConfig: BudgetConfig;
  savingsGoals: SavingsGoal[];
  onOpenResetModal: () => void;
  onRestoreData: (importedData: any) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analysis,
  transactions,
  wallets,
  budgetConfig,
  savingsGoals,
  onOpenResetModal,
  onRestoreData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chartViewMode, setChartViewMode] = useState<'7days' | 'month'>('month');

  // Compute Financial Health Score (0 - 100)
  const computeHealthScore = () => {
    let score = 100;
    const { totalIncomeThisMonth, totalExpenseThisMonth, monthly, daily } = analysis;

    if (totalIncomeThisMonth > 0) {
      const expenseRatio = totalExpenseThisMonth / totalIncomeThisMonth;
      if (expenseRatio > 1) score -= 35;
      else if (expenseRatio > 0.85) score -= 20;
      else if (expenseRatio > 0.70) score -= 10;
    } else if (totalExpenseThisMonth > 0) {
      score -= 20;
    }

    if (monthly.status === 'danger') score -= 25;
    else if (monthly.status === 'warning') score -= 10;

    if (daily.status === 'danger') score -= 10;

    const totalGoalsSaved = savingsGoals.reduce((s, g) => s + g.currentAmount, 0);
    if (totalGoalsSaved > 10000000) score = Math.min(100, score + 5);

    return Math.max(10, Math.min(100, score));
  };

  const healthScore = computeHealthScore();

  const getScoreDiagnosis = (score: number) => {
    if (score >= 80) return { title: 'Keuangan Sehat & Terkendali', badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    if (score >= 60) return { title: 'Cukup Aman, Perlu Cermat', badgeClass: 'text-amber-800 bg-amber-50 border-amber-200' };
    return { title: 'Waspada Defisit & Overbudget', badgeClass: 'text-red-800 bg-red-50 border-red-200' };
  };

  const diagnosis = getScoreDiagnosis(healthScore);

  const handleExportBackup = () => {
    const fullBackup = {
      version: 1,
      exportDate: getTodayString(),
      wallets,
      transactions,
      budgetConfig,
      savingsGoals,
    };
    downloadJSON(fullBackup, `kelolauang_backup_${getTodayString()}.json`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        onRestoreData(parsed);
        alert('Data berhasil dipulihkan dari cadangan!');
      } catch {
        alert('File cadangan tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  // Daily Trend calculation for current month
  const today = new Date();
  const currentMonthDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const dailySpendingMap: Record<number, number> = {};

  transactions.forEach((tx) => {
    if (tx.type === 'expense') {
      const [y, m, d] = tx.date.split('-').map(Number);
      if (y === today.getFullYear() && (m - 1) === today.getMonth()) {
        dailySpendingMap[d] = (dailySpendingMap[d] || 0) + tx.amount;
      }
    }
  });

  const allDays = Array.from({ length: currentMonthDays }, (_, i) => i + 1);
  const displayedDays = chartViewMode === '7days' 
    ? allDays.filter((d) => d > today.getDate() - 7 && d <= today.getDate())
    : allDays;

  const maxDailyVal = Math.max(
    budgetConfig.dailyLimit || 150000,
    ...displayedDays.map(d => dailySpendingMap[d] || 0)
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-2xl border border-neutral-200/70 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-neutral-900">Analisis & Laporan Finansial</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Laporan visual pengeluaran, rasio tabungan, dan cadangan data lokal Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Cadangkan JSON</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Pulihkan</span>
          </button>
          <button
            onClick={onOpenResetModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kelola Database</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Health Score Overview */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-neutral-200/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${diagnosis.badgeClass}`}>
              {diagnosis.title}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900">
            Skor Kesehatan Finansial: <span className="font-mono font-bold text-xl sm:text-2xl text-neutral-950">{healthScore}/100</span>
          </h3>
          <p className="text-xs text-neutral-600 max-w-xl leading-relaxed">
            {healthScore >= 80 
              ? 'Arus kas dan perencanaan anggaran Anda berada dalam kondisi prima. Tetap patuhi limit harian agar tabungan bertumbuh optimal.'
              : 'Perhatikan beberapa pos pengeluaran harian dan mingguan agar tidak menggerus alokasi tabungan bulanan Anda.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono shrink-0 w-full sm:w-auto">
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/60">
            <span className="text-neutral-500 text-[11px] font-sans">Rasio Tabungan</span>
            <div className="text-lg font-bold text-emerald-700 mt-0.5 tabular-nums">
              {analysis.savingsRate}%
            </div>
            <span className="text-[10px] text-neutral-400 font-sans">Ideal minimal ≥ 20%</span>
          </div>
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/60">
            <span className="text-neutral-500 text-[11px] font-sans">Sisa Aman Harian</span>
            <div className="text-lg font-bold text-neutral-900 mt-0.5 tabular-nums">
              {formatRupiah(analysis.recommendedDailyRemaining)}
            </div>
            <span className="text-[10px] text-neutral-400 font-sans">Rekomendasi harian</span>
          </div>
        </div>
      </div>

      {/* Daily Spending Trend (Mobile Responsive with horizontal scroll) */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-neutral-200/70 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Tren Pengeluaran Harian Bulan Ini</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Garis putus-putus menandai batas harian ({formatRupiah(budgetConfig.dailyLimit)}).
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-0.5 bg-neutral-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setChartViewMode('7days')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  chartViewMode === '7days' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-500'
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setChartViewMode('month')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  chartViewMode === 'month' ? 'bg-white text-neutral-900 shadow-2xs font-semibold' : 'text-neutral-500'
                }`}
              >
                Bulan Ini
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3 font-mono text-[11px] text-neutral-500">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-neutral-800 rounded-sm" />
                <span>Normal</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-sm" />
                <span>Overbudget</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Container on Mobile */}
        <div className="pt-4 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className={`${chartViewMode === 'month' ? 'min-w-[640px]' : 'min-w-[320px]'} h-44 flex items-end gap-1.5 border-b border-neutral-200 pb-2 relative`}>
            {/* Limit threshold guide line */}
            {budgetConfig.dailyLimit > 0 && maxDailyVal > 0 && (
              <div 
                className="absolute left-0 right-0 border-b border-dashed border-red-400 pointer-events-none z-10"
                style={{ bottom: `${(budgetConfig.dailyLimit / maxDailyVal) * 100}%` }}
              >
                <span className="absolute -top-4 right-0 text-[10px] font-mono text-red-600 bg-white px-1 font-semibold">
                  Limit {formatRupiah(budgetConfig.dailyLimit, true)}
                </span>
              </div>
            )}

            {displayedDays.map((dayNum) => {
              const spent = dailySpendingMap[dayNum] || 0;
              const heightPct = maxDailyVal > 0 ? (spent / maxDailyVal) * 100 : 0;
              const isOver = budgetConfig.dailyLimit > 0 && spent > budgetConfig.dailyLimit;
              const isCurrentDay = dayNum === today.getDate();

              return (
                <div 
                  key={dayNum} 
                  className="flex-1 flex flex-col items-center h-full justify-end group relative min-w-[16px]"
                >
                  {/* Tooltip */}
                  {spent > 0 && (
                    <div className="absolute -top-8 z-20 hidden group-hover:block bg-neutral-900 text-white text-[10px] font-mono px-2 py-0.5 rounded whitespace-nowrap shadow-md pointer-events-none">
                      Tgl {dayNum}: {formatRupiah(spent)}
                    </div>
                  )}

                  <div
                    className={`w-full rounded-t-sm transition-all duration-300 ${
                      spent === 0 
                        ? 'bg-neutral-100' 
                        : isOver 
                        ? 'bg-red-500' 
                        : 'bg-neutral-800 hover:bg-neutral-700'
                    } ${isCurrentDay ? 'ring-1 ring-neutral-900 ring-offset-1' : ''}`}
                    style={{ height: `${Math.max(4, heightPct)}%` }}
                  />
                  <span className={`text-[9px] mt-1 font-mono ${
                    isCurrentDay ? 'font-bold text-neutral-900' : 'text-neutral-400'
                  }`}>
                    {dayNum}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Category Breakdown & Actionable Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-neutral-200/70 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900">Distribusi Pengeluaran Per Kategori</h3>
          <div className="space-y-3">
            {analysis.categorySummaries.map((cat) => {
              const totalExp = analysis.totalExpenseThisMonth || 1;
              const sharePct = Math.round((cat.spent / totalExp) * 100);

              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-800 truncate mr-2">{cat.category}</span>
                    <span className="font-mono text-neutral-600 shrink-0 tabular-nums">
                      {formatRupiah(cat.spent)} ({sharePct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neutral-800 rounded-full transition-all"
                      style={{ width: `${sharePct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Practical Financial Insights */}
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-neutral-200/70 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-neutral-800" />
            <h3 className="text-sm font-bold text-neutral-900">Rekomendasi Tindakan Nyata</h3>
          </div>

          <div className="space-y-3 text-xs text-neutral-700 leading-relaxed">
            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900">Alokasi Harian Aman:</strong>
                <p className="mt-0.5 text-neutral-600">
                  Untuk menjaga agar anggaran bulanan tidak jebol, pertahankan belanja harian maksimum di angka{' '}
                  <strong className="font-mono text-neutral-900">{formatRupiah(analysis.recommendedDailyRemaining)}/hari</strong>.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900">Prioritas Pelunasan Hutang:</strong>
                <p className="mt-0.5 text-neutral-600">
                  Selesaikan pinjaman berjangka sebelum menambah pos pengeluaran gaya hidup untuk menjaga kelonggaran arus kas di masa depan.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/60 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900">Kemandirian Data:</strong>
                <p className="mt-0.5 text-neutral-600">
                  Seluruh data tersimpan otomatis di browser HP Anda. Gunakan tombol Cadangkan JSON di atas jika ingin menyimpan backup di tempat lain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
