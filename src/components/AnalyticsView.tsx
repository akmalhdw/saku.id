import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  Upload, 
  RotateCcw,
  Sparkles,
  BarChart2,
  CheckCircle2
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
  onResetData: () => void;
  onRestoreData: (importedData: any) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analysis,
  transactions,
  wallets,
  budgetConfig,
  savingsGoals,
  onResetData,
  onRestoreData,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Compute Financial Health Score (0 - 100)
  const computeHealthScore = () => {
    let score = 100;
    const { totalIncomeThisMonth, totalExpenseThisMonth, monthly, daily } = analysis;

    // 1. Expense to income ratio check
    if (totalIncomeThisMonth > 0) {
      const expenseRatio = totalExpenseThisMonth / totalIncomeThisMonth;
      if (expenseRatio > 1) score -= 35; // spending more than earning
      else if (expenseRatio > 0.85) score -= 20;
      else if (expenseRatio > 0.70) score -= 10;
    } else if (totalExpenseThisMonth > 0) {
      score -= 20;
    }

    // 2. Budget adherence
    if (monthly.status === 'danger') score -= 25;
    else if (monthly.status === 'warning') score -= 10;

    if (daily.status === 'danger') score -= 10;

    // 3. Savings goals progress boost
    const totalGoalsSaved = savingsGoals.reduce((s, g) => s + g.currentAmount, 0);
    if (totalGoalsSaved > 10000000) score = Math.min(100, score + 5);

    return Math.max(10, Math.min(100, score));
  };

  const healthScore = computeHealthScore();

  const getScoreDiagnosis = (score: number) => {
    if (score >= 85) return { title: 'Kondisi Finansial Prima & Sehat', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 65) return { title: 'Cukup Terkendali, Perlu Waspada', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    return { title: 'Waspada Defisit & Overbudget', color: 'text-red-700 bg-red-50 border-red-200' };
  };

  const diagnosis = getScoreDiagnosis(healthScore);

  // Backup & restore
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
      } catch (err) {
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

  const maxDailyVal = Math.max(
    budgetConfig.dailyLimit || 100000,
    ...Object.values(dailySpendingMap)
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-neutral-900">Analisis & Diagnosis Finansial</h2>
          <p className="text-xs text-neutral-500">
            Evaluasi mendalam kesehatan arus kas, rasio tabungan, dan kepatuhan anggaran.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Cadangkan JSON</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Pulihkan Data</span>
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

      {/* Health Score Hero Card */}
      <div className="p-6 bg-white rounded-xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${diagnosis.color}`}>
              {diagnosis.title}
            </span>
          </div>
          <h3 className="text-lg font-bold text-neutral-900">
            Skor Kesehatan Finansial Anda: <span className="font-mono font-bold text-2xl">{healthScore}/100</span>
          </h3>
          <p className="text-xs text-neutral-600 max-w-xl leading-relaxed">
            {healthScore >= 80 
              ? 'Arus kas surplus dengan alokasi tabungan optimal. Pertahankan kedisiplinan pada limit harian.'
              : 'Perhatikan beberapa pos pengeluaran yang mendekati batas maksimal agar tabungan bulanan tidak tergerus.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-mono shrink-0">
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <span className="text-neutral-500 text-[11px]">Rasio Tabungan</span>
            <div className="text-lg font-bold text-emerald-600 mt-0.5 tabular-nums">
              {analysis.savingsRate}%
            </div>
            <span className="text-[10px] text-neutral-400">Target ideal ≥ 20%</span>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <span className="text-neutral-500 text-[11px]">Batas Harian Aman</span>
            <div className="text-lg font-bold text-neutral-900 mt-0.5 tabular-nums">
              {formatRupiah(analysis.recommendedDailyRemaining)}
            </div>
            <span className="text-[10px] text-neutral-400">Per hari s/d akhir bulan</span>
          </div>
        </div>
      </div>

      {/* Daily Spending Trend in Current Month */}
      <div className="p-6 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Tren Pengeluaran Harian Bulan Ini</h3>
            <p className="text-xs text-neutral-500">
              Garis putus-putus merah menandai batas harian ({formatRupiah(budgetConfig.dailyLimit)}).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-neutral-500">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-neutral-900 rounded-sm" />
              <span>Normal</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-sm" />
              <span>Melebihi Limit</span>
            </div>
          </div>
        </div>

        {/* SVG / CSS Bar Chart */}
        <div className="pt-6">
          <div className="h-44 flex items-end gap-1.5 border-b border-neutral-200 pb-2 relative">
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

            {Array.from({ length: Math.min(31, currentMonthDays) }, (_, i) => i + 1).map((dayNum) => {
              const spent = dailySpendingMap[dayNum] || 0;
              const heightPct = maxDailyVal > 0 ? (spent / maxDailyVal) * 100 : 0;
              const isOver = budgetConfig.dailyLimit > 0 && spent > budgetConfig.dailyLimit;
              const isCurrentDay = dayNum === today.getDate();

              return (
                <div 
                  key={dayNum} 
                  className="flex-1 flex flex-col items-center h-full justify-end group relative"
                >
                  {/* Tooltip */}
                  {spent > 0 && (
                    <div className="absolute -top-9 z-20 hidden group-hover:block bg-neutral-900 text-white text-[10px] font-mono px-2 py-1 rounded whitespace-nowrap shadow-md pointer-events-none">
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
                  <span className={`text-[9px] mt-1.5 font-mono ${
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

      {/* Category Expense Matrix & Practical Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900">Distribusi Pengeluaran Per Kategori</h3>
          <div className="space-y-3">
            {analysis.categorySummaries.map((cat) => {
              const totalExp = analysis.totalExpenseThisMonth || 1;
              const sharePct = Math.round((cat.spent / totalExp) * 100);

              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-800">{cat.category}</span>
                    <span className="font-mono text-neutral-600 tabular-nums">
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

        {/* Personalized Financial Insights */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-neutral-900">Rekomendasi & Langkah Aksi Nyata</h3>
          </div>

          <div className="space-y-3 text-xs text-neutral-700 leading-relaxed">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900">Pengendalian Sisa Bulan Ini:</strong>
                <p className="mt-0.5 text-neutral-600">
                  Untuk menjaga agar anggaran bulanan tidak defisit, batasi pengeluaran harian maksimum pada angka{' '}
                  <strong className="font-mono text-neutral-900">{formatRupiah(analysis.recommendedDailyRemaining)}/hari</strong>.
                </p>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900">Strategi Tabungan Otomatis:</strong>
                <p className="mt-0.5 text-neutral-600">
                  Selalu sisihkan porsi tabungan (minimal 20% dari gaji) di awal tanggal penerimaan penghasilan, bukan dari sisa akhir bulan.
                </p>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-neutral-900">Prioritas Dana Darurat:</strong>
                <p className="mt-0.5 text-neutral-600">
                  Pastikan dana darurat Anda setara dengan 3 hingga 6 bulan pengeluaran rutin sebelum memperbanyak alokasi belanja gaya hidup.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-[11px] text-neutral-400">Data tersimpan aman di browser Anda</span>
            <button
              onClick={() => {
                if (confirm('Yakin ingin mereset seluruh data kembali ke data demo awal?')) {
                  onResetData();
                }
              }}
              className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
