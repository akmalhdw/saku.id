import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, ChevronDown, ChevronUp, X, ArrowRight, Sparkles, Sliders } from 'lucide-react';
import { BudgetAlert } from '../types/finance';
import { formatRupiah } from '../utils/formatters';

interface AlertBannerProps {
  alerts: BudgetAlert[];
  onOpenBudgetPlanner: () => void;
  onFilterTransactionsByAlert?: (type: string, category?: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alerts,
  onOpenBudgetPlanner,
  onFilterTransactionsByAlert,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);

  const visibleAlerts = alerts.filter(a => !dismissedAlertIds.includes(a.id));

  if (visibleAlerts.length === 0) return null;

  const hasCritical = visibleAlerts.some(a => a.severity === 'danger');
  const criticalCount = visibleAlerts.filter(a => a.severity === 'danger').length;
  const warningCount = visibleAlerts.filter(a => a.severity === 'warning').length;

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedAlertIds(prev => [...prev, id]);
  };

  return (
    <div className={`mb-6 rounded-xl border transition-all ${
      hasCritical 
        ? 'bg-red-50/90 border-red-200 text-red-950' 
        : 'bg-amber-50/90 border-amber-200 text-amber-950'
    } shadow-xs`}>
      {/* Alert Header Summary */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-4 cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${hasCritical ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'} shrink-0`}>
            {hasCritical ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm sm:text-base">
                {hasCritical 
                  ? `Peringatan: ${criticalCount} Batas Anggaran Terlampaui!`
                  : `Waspada: ${warningCount} Anggaran Mendekati Batas Maksimal`}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded font-mono font-medium ${
                hasCritical ? 'bg-red-200/80 text-red-900' : 'bg-amber-200/80 text-amber-900'
              }`}>
                {visibleAlerts.length} Notifikasi Aktif
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">
              Pantau arus kas harian, mingguan, dan bulanan agar target keuangan tetap terkontrol.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenBudgetPlanner();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 transition-colors shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Sesuaikan Limit</span>
          </button>
          <button 
            type="button" 
            className="p-1 text-neutral-500 hover:text-neutral-800"
            aria-label="Toggle details"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Alert List */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-neutral-200/60 divide-y divide-neutral-200/60">
          {visibleAlerts.map((alert) => (
            <div key={alert.id} className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${alert.severity === 'danger' ? 'bg-red-600' : 'bg-amber-500'}`} />
                  <span className="font-semibold text-xs text-neutral-900">{alert.title}</span>
                  <span className="text-[11px] text-neutral-500">· {alert.timestamp}</span>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed pl-4">
                  {alert.message}
                </p>
                <div className="pl-4 pt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-600 font-mono">
                  <span>Terpakai: <strong className="text-neutral-900">{formatRupiah(alert.currentAmount)}</strong></span>
                  <span>Batas: <strong className="text-neutral-900">{formatRupiah(alert.limitAmount)}</strong></span>
                  <span>Rasio: <strong className={alert.severity === 'danger' ? 'text-red-700 font-bold' : 'text-amber-700 font-bold'}>{alert.percentage}%</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {onFilterTransactionsByAlert && (
                  <button
                    onClick={() => onFilterTransactionsByAlert(alert.type, alert.categoryName)}
                    className="text-xs text-neutral-700 hover:text-neutral-950 font-medium underline flex items-center gap-1"
                  >
                    <span>Cek Rincian</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={(e) => handleDismiss(alert.id, e)}
                  title="Sembunyikan alert ini"
                  className="p-1 rounded text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Actionable Advice Footer */}
          <div className="pt-3 mt-1 flex items-start gap-2 text-xs text-neutral-700 bg-white/70 p-3 rounded-lg border border-neutral-200/50">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-neutral-900">Tips Pengendalian Anggaran: </span>
              Jika batas harian atau kategori makanan terlampaui, alihkan menu makan malam dengan memasak di rumah atau gunakan sisa kuota hari berikutnya untuk menyeimbangkan total bulanan.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
