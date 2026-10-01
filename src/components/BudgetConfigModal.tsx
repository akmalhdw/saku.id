import React, { useState } from 'react';
import { X, Sliders, Bell, Check, Sparkles } from 'lucide-react';
import { BudgetConfig } from '../types/finance';
import { formatNumber, parseRupiahInput, formatRupiah } from '../utils/formatters';

interface BudgetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BudgetConfig;
  onSave: (newConfig: BudgetConfig) => void;
}

export const BudgetConfigModal: React.FC<BudgetConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [dailyStr, setDailyStr] = useState<string>(formatNumber(config.dailyLimit));
  const [weeklyStr, setWeeklyStr] = useState<string>(formatNumber(config.weeklyLimit));
  const [monthlyStr, setMonthlyStr] = useState<string>(formatNumber(config.monthlyLimit));
  const [warningThreshold, setWarningThreshold] = useState<number>(config.warningThresholdPercent || 80);
  const [enableDailyAlert, setEnableDailyAlert] = useState<boolean>(config.enableDailyAlert);
  const [enableWeeklyAlert, setEnableWeeklyAlert] = useState<boolean>(config.enableWeeklyAlert);
  const [enableMonthlyAlert, setEnableMonthlyAlert] = useState<boolean>(config.enableMonthlyAlert);

  if (!isOpen) return null;

  const dailyNum = parseRupiahInput(dailyStr);
  const weeklyNum = parseRupiahInput(weeklyStr);
  const monthlyNum = parseRupiahInput(monthlyStr);

  const handleAutoDistributeFromMonthly = () => {
    if (monthlyNum <= 0) return;
    const computedWeekly = Math.round(monthlyNum / 4.3);
    const computedDaily = Math.round(computedWeekly / 7);
    setWeeklyStr(formatNumber(computedWeekly));
    setDailyStr(formatNumber(computedDaily));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...config,
      dailyLimit: dailyNum,
      weeklyLimit: weeklyNum,
      monthlyLimit: monthlyNum,
      warningThresholdPercent: warningThreshold,
      enableDailyAlert,
      enableWeeklyAlert,
      enableMonthlyAlert,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-neutral-900" />
            <h2 className="text-base font-bold text-neutral-900">Pengaturan Limit & Batas Anggaran</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            <div>
              <p className="text-xs font-semibold text-neutral-900">Hitung Otomatis Berimbang</p>
              <p className="text-[11px] text-neutral-500">Bagi limit bulanan menjadi estimasi mingguan & harian</p>
            </div>
            <button
              type="button"
              onClick={handleAutoDistributeFromMonthly}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-100 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Sinkronisasi</span>
            </button>
          </div>

          {/* Three Limit Inputs */}
          <div className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-700">Batas Anggaran Harian (Daily Cap)</label>
                <label className="flex items-center gap-1 text-[11px] text-neutral-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableDailyAlert}
                    onChange={(e) => setEnableDailyAlert(e.target.checked)}
                    className="rounded text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>Alert Aktif</span>
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 font-mono">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={dailyStr}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setDailyStr(raw ? formatNumber(parseInt(raw, 10)) : '');
                  }}
                  className="w-full pl-10 pr-3 py-2 text-sm font-bold font-mono rounded-xl border border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-700">Batas Anggaran Mingguan (Weekly Cap)</label>
                <label className="flex items-center gap-1 text-[11px] text-neutral-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableWeeklyAlert}
                    onChange={(e) => setEnableWeeklyAlert(e.target.checked)}
                    className="rounded text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>Alert Aktif</span>
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 font-mono">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={weeklyStr}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setWeeklyStr(raw ? formatNumber(parseInt(raw, 10)) : '');
                  }}
                  className="w-full pl-10 pr-3 py-2 text-sm font-bold font-mono rounded-xl border border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-neutral-700">Batas Anggaran Bulanan (Monthly Cap)</label>
                <label className="flex items-center gap-1 text-[11px] text-neutral-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableMonthlyAlert}
                    onChange={(e) => setEnableMonthlyAlert(e.target.checked)}
                    className="rounded text-neutral-900 focus:ring-neutral-900"
                  />
                  <span>Alert Aktif</span>
                </label>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 font-mono">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={monthlyStr}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setMonthlyStr(raw ? formatNumber(parseInt(raw, 10)) : '');
                  }}
                  className="w-full pl-10 pr-3 py-2 text-sm font-bold font-mono rounded-xl border border-neutral-300 text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Warning Threshold Slider */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-neutral-700">Ambang Batas Peringatan Awal:</span>
              <span className="font-mono font-bold text-amber-700">{warningThreshold}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(parseInt(e.target.value, 10))}
              className="w-full accent-neutral-900"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Sistem akan memunculkan banner peringatan kuning ketika pengeluaran menyentuh {warningThreshold}% dari batas yang ditetapkan.
            </p>
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
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm"
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
