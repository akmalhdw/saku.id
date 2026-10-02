import React, { useState } from 'react';
import { 
  Sliders, 
  Calculator, 
  Check, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Info,
  Calendar,
  Clock,
  PieChart,
  Plus,
  Trash2
} from 'lucide-react';
import { BudgetConfig, ExpenseCategory } from '../types/finance';
import { BudgetAnalysisResult } from '../utils/budgetEngine';
import { formatRupiah, formatNumber, parseRupiahInput } from '../utils/formatters';

interface BudgetPlannerViewProps {
  config: BudgetConfig;
  analysis: BudgetAnalysisResult;
  onUpdateConfig: (newConfig: BudgetConfig) => void;
}

const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja & Kebutuhan',
  'Tagihan & Utilitas',
  'Hiburan & Hobi',
  'Kesehatan',
  'Pendidikan',
  'Investasi & Tabungan',
  'Keluarga & Anak',
  'Sedekah & Donasi',
  'Lainnya',
];

export const BudgetPlannerView: React.FC<BudgetPlannerViewProps> = ({
  config,
  analysis,
  onUpdateConfig,
}) => {
  const [dailyLimitStr, setDailyLimitStr] = useState<string>(formatNumber(config.dailyLimit));
  const [weeklyLimitStr, setWeeklyLimitStr] = useState<string>(formatNumber(config.weeklyLimit));
  const [monthlyLimitStr, setMonthlyLimitStr] = useState<string>(formatNumber(config.monthlyLimit));
  const [threshold, setThreshold] = useState<number>(config.warningThresholdPercent);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({ ...config.categoryBudgets });

  // 50/30/20 Rule Calculator state
  const [incomeForCalc, setIncomeForCalc] = useState<string>('8000000');
  const [calcActive, setCalcActive] = useState<boolean>(false);
  const [isSavedToast, setIsSavedToast] = useState<boolean>(false);

  // New custom category budget add
  const [selectedNewCat, setSelectedNewCat] = useState<string>(DEFAULT_CATEGORIES[0]);
  const [newCatAmountStr, setNewCatAmountStr] = useState<string>('500000');

  const handleSaveAll = () => {
    const newConfig: BudgetConfig = {
      ...config,
      dailyLimit: parseRupiahInput(dailyLimitStr),
      weeklyLimit: parseRupiahInput(weeklyLimitStr),
      monthlyLimit: parseRupiahInput(monthlyLimitStr),
      warningThresholdPercent: threshold,
      categoryBudgets: { ...categoryBudgets },
    };
    onUpdateConfig(newConfig);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 2500);
  };

  const handleApply503020Rule = () => {
    const inc = parseRupiahInput(incomeForCalc);
    if (inc <= 0) return;

    const needs = Math.round(inc * 0.50); // 50%
    const wants = Math.round(inc * 0.30); // 30%
    const savings = Math.round(inc * 0.20); // 20%

    // Distribute into monthly, weekly, daily
    const totalMonthlyExpense = needs + wants;
    const weekly = Math.round(totalMonthlyExpense / 4.3);
    const daily = Math.round(weekly / 7);

    setMonthlyLimitStr(formatNumber(totalMonthlyExpense));
    setWeeklyLimitStr(formatNumber(weekly));
    setDailyLimitStr(formatNumber(daily));

    // Distribute into default categories
    const newCats: Record<string, number> = {
      'Makanan & Minuman': Math.round(needs * 0.45),
      'Tagihan & Utilitas': Math.round(needs * 0.25),
      'Transportasi': Math.round(needs * 0.15),
      'Belanja & Kebutuhan': Math.round(needs * 0.15),
      'Hiburan & Hobi': Math.round(wants * 0.60),
      'Kesehatan': Math.round(wants * 0.40),
      'Investasi & Tabungan': savings,
    };
    setCategoryBudgets(newCats);
    setCalcActive(true);
  };

  const handleUpdateCategoryBudget = (cat: string, valueStr: string) => {
    const val = parseRupiahInput(valueStr);
    setCategoryBudgets((prev) => ({
      ...prev,
      [cat]: val,
    }));
  };

  const handleDeleteCategoryBudget = (cat: string) => {
    setCategoryBudgets((prev) => {
      const copy = { ...prev };
      delete copy[cat];
      return copy;
    });
  };

  const handleAddCategoryBudget = () => {
    const amt = parseRupiahInput(newCatAmountStr);
    if (!selectedNewCat || amt <= 0) return;
    setCategoryBudgets((prev) => ({
      ...prev,
      [selectedNewCat]: amt,
    }));
  };

  const totalAllocatedCategories = Object.values(categoryBudgets).reduce((a, b) => a + b, 0);
  const currentMonthlyNum = parseRupiahInput(monthlyLimitStr);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-neutral-900">Perencanaan Anggaran (Budget Planner)</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-medium">
              Multi-Tingkat
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
            Tentukan pagu batas harian, mingguan, dan bulanan. Sistem akan mengevaluasi setiap transaksi secara otomatis dan memunculkan peringatan jika pengeluaran melebihi limit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>

      {isSavedToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan limit anggaran berhasil disimpan dan disinkronkan ke seluruh sistem!</span>
        </div>
      )}

      {/* Grid: 3 Period Limits (Daily, Weekly, Monthly) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Harian */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-bold text-neutral-900">Batas Harian (Daily)</h3>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
              analysis.daily.status === 'danger' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : analysis.daily.status === 'warning'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {analysis.daily.percentage}% Terpakai
            </span>
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1">Pagu Pengeluaran Per Hari</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-neutral-400">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={dailyLimitStr}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setDailyLimitStr(raw ? formatNumber(parseInt(raw, 10)) : '');
                }}
                className="w-full pl-10 pr-3 py-2 text-base font-bold font-mono rounded-lg border border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 text-xs space-y-1 text-neutral-500">
            <div className="flex justify-between">
              <span>Pengeluaran Hari Ini:</span>
              <strong className="text-neutral-900 font-mono">{formatRupiah(analysis.daily.spent)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Sisa Alokasi Aman:</span>
              <strong className={analysis.daily.status === 'danger' ? 'text-red-600 font-mono' : 'text-emerald-700 font-mono'}>
                {analysis.daily.status === 'danger' ? `Over ${formatRupiah(analysis.daily.overspendAmount)}` : formatRupiah(analysis.daily.remaining)}
              </strong>
            </div>
          </div>
        </div>

        {/* Mingguan */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-bold text-neutral-900">Batas Mingguan (Weekly)</h3>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
              analysis.weekly.status === 'danger' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : analysis.weekly.status === 'warning'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {analysis.weekly.percentage}% Terpakai
            </span>
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1">Pagu Pengeluaran Per Minggu</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-neutral-400">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={weeklyLimitStr}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setWeeklyLimitStr(raw ? formatNumber(parseInt(raw, 10)) : '');
                }}
                className="w-full pl-10 pr-3 py-2 text-base font-bold font-mono rounded-lg border border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 text-xs space-y-1 text-neutral-500">
            <div className="flex justify-between">
              <span>Pengeluaran Minggu Ini:</span>
              <strong className="text-neutral-900 font-mono">{formatRupiah(analysis.weekly.spent)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Sisa Kuota Minggu Ini:</span>
              <strong className={analysis.weekly.status === 'danger' ? 'text-red-600 font-mono' : 'text-emerald-700 font-mono'}>
                {analysis.weekly.status === 'danger' ? `Over ${formatRupiah(analysis.weekly.overspendAmount)}` : formatRupiah(analysis.weekly.remaining)}
              </strong>
            </div>
          </div>
        </div>

        {/* Bulanan */}
        <div className="p-5 bg-white rounded-xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-bold text-neutral-900">Batas Bulanan (Monthly)</h3>
            </div>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
              analysis.monthly.status === 'danger' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : analysis.monthly.status === 'warning'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {analysis.monthly.percentage}% Terpakai
            </span>
          </div>

          <div>
            <label className="block text-xs text-neutral-500 mb-1">Pagu Total Per Bulan</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-neutral-400">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={monthlyLimitStr}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setMonthlyLimitStr(raw ? formatNumber(parseInt(raw, 10)) : '');
                }}
                className="w-full pl-10 pr-3 py-2 text-base font-bold font-mono rounded-lg border border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none tabular-nums"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 text-xs space-y-1 text-neutral-500">
            <div className="flex justify-between">
              <span>Pengeluaran Bulan Ini:</span>
              <strong className="text-neutral-900 font-mono">{formatRupiah(analysis.monthly.spent)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Sisa Kuota Bulanan:</span>
              <strong className={analysis.monthly.status === 'danger' ? 'text-red-600 font-mono' : 'text-emerald-700 font-mono'}>
                {analysis.monthly.status === 'danger' ? `Over ${formatRupiah(analysis.monthly.overspendAmount)}` : formatRupiah(analysis.monthly.remaining)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* 50/30/20 Smart Budget Calculator Widget */}
      <div className="p-5 sm:p-6 bg-white rounded-2xl border border-neutral-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-800" />
              <h3 className="text-sm font-bold text-neutral-900">Kalkulator Kaidah 50 / 30 / 20</h3>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Metode perencanaan finansial berimbang: <strong>50% Kebutuhan Pokok</strong>, <strong>30% Gaya Hidup & Hiburan</strong>, dan <strong>20% Tabungan / Investasi</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-neutral-400">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={formatNumber(parseRupiahInput(incomeForCalc))}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setIncomeForCalc(raw);
                }}
                placeholder="Pemasukan Bulanan"
                className="pl-9 pr-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-xs font-mono font-bold text-neutral-900 w-44 focus:outline-none focus:ring-1 focus:ring-neutral-900 tabular-nums"
              />
            </div>
            <button
              onClick={handleApply503020Rule}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs transition-colors whitespace-nowrap active:scale-95"
            >
              Terapkan Formula
            </button>
          </div>
        </div>

        {calcActive && (
          <div className="mt-4 pt-4 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/60">
              <div className="text-neutral-500 text-[11px] font-medium">Kebutuhan Pokok (50%)</div>
              <div className="text-base font-bold font-mono text-neutral-900 mt-0.5">
                {formatRupiah(Math.round(parseRupiahInput(incomeForCalc) * 0.5))}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">Makanan, Sewa/Cicilan, Utilitas, Bensin</div>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/60">
              <div className="text-neutral-500 text-[11px] font-medium">Gaya Hidup & Hiburan (30%)</div>
              <div className="text-base font-bold font-mono text-neutral-900 mt-0.5">
                {formatRupiah(Math.round(parseRupiahInput(incomeForCalc) * 0.3))}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">Nongkrong, Hiburan, Hobi, Langganan</div>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/60">
              <div className="text-neutral-500 text-[11px] font-medium">Tabungan & Investasi (20%)</div>
              <div className="text-base font-bold font-mono text-emerald-700 mt-0.5">
                {formatRupiah(Math.round(parseRupiahInput(incomeForCalc) * 0.2))}
              </div>
              <div className="text-[10px] text-neutral-400 mt-1">Dana Darurat, Reksadana, Deposito</div>
            </div>
          </div>
        )}
      </div>

      {/* Category Budget Matrix */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Alokasi Anggaran Per Kategori</h3>
            <p className="text-xs text-neutral-500">
              Tetapkan batas maksimal pengeluaran per kategori untuk mencegah pemborosan di pos tertentu.
            </p>
          </div>
          <div className="text-xs font-mono text-neutral-600">
            Total Alokasi Kategori: <strong className="text-neutral-900">{formatRupiah(totalAllocatedCategories)}</strong>
            {currentMonthlyNum > 0 && (
              <span className="ml-1 text-neutral-500">
                ({Math.round((totalAllocatedCategories / currentMonthlyNum) * 100)}% dari batas bulanan)
              </span>
            )}
          </div>
        </div>

        {/* Existing Categories Table */}
        <div className="divide-y divide-neutral-100">
          {Object.entries(categoryBudgets).map(([cat, limitVal]) => {
            const spent = analysis.categorySpending[cat] || 0;
            const pct = limitVal > 0 ? Math.round((spent / limitVal) * 100) : 0;
            const isDanger = pct >= 100;
            const isWarning = pct >= threshold && pct < 100;

            return (
              <div key={cat} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="sm:w-1/3">
                  <div className="text-xs font-semibold text-neutral-900">{cat}</div>
                  <div className="text-[11px] text-neutral-500 flex items-center gap-1.5 font-mono">
                    <span>Terpakai: {formatRupiah(spent)}</span>
                    <span aria-hidden="true">·</span>
                    <span className={isDanger ? 'text-red-600 font-bold' : isWarning ? 'text-amber-700 font-bold' : 'text-neutral-700'}>
                      {pct}%
                    </span>
                  </div>
                </div>

                <div className="sm:w-1/3">
                  <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-neutral-800'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:w-1/3 justify-end">
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">Rp</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formatNumber(limitVal)}
                      onChange={(e) => handleUpdateCategoryBudget(cat, e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 text-xs font-mono font-semibold rounded-lg border border-neutral-300 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 tabular-nums"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteCategoryBudget(cat)}
                    title="Hapus alokasi kategori ini"
                    className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Category Budget Row */}
        <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedNewCat}
            onChange={(e) => setSelectedNewCat(e.target.value)}
            className="w-full sm:w-1/3 px-3 py-2 text-xs font-medium rounded-lg border border-neutral-300 bg-white"
          >
            {DEFAULT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="relative w-full sm:w-1/3">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Jumlah Limit"
              value={formatNumber(parseRupiahInput(newCatAmountStr))}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                setNewCatAmountStr(raw);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs font-mono font-semibold rounded-lg border border-neutral-300 text-neutral-900"
            />
          </div>
          <button
            onClick={handleAddCategoryBudget}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Alokasi Kategori</span>
          </button>
        </div>
      </div>
    </div>
  );
};
