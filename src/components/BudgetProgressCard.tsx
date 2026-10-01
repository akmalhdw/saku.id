import React from 'react';
import { PeriodBudgetSummary } from '../types/finance';
import { formatRupiah } from '../utils/formatters';
import { ShieldCheck, AlertCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface BudgetProgressCardProps {
  summary: PeriodBudgetSummary;
  subtext?: string;
  onClickConfigure?: () => void;
}

export const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({
  summary,
  subtext,
  onClickConfigure,
}) => {
  const isOver = summary.status === 'danger';
  const isWarning = summary.status === 'warning';

  const clampedPercent = Math.min(100, summary.percentage);

  // Status visual attributes
  const statusConfig = {
    safe: {
      badge: 'Aman',
      badgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      barColor: 'bg-emerald-500',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />,
    },
    warning: {
      badge: 'Mendekati Batas',
      badgeClass: 'text-amber-800 bg-amber-50 border-amber-200',
      barColor: 'bg-amber-500',
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
    },
    danger: {
      badge: 'Overbudget!',
      badgeClass: 'text-red-700 bg-red-50 border-red-200 font-bold',
      barColor: 'bg-red-500',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600" />,
    },
  }[summary.status];

  return (
    <div className={`p-5 rounded-xl border bg-white transition-all shadow-xs relative overflow-hidden ${
      isOver ? 'border-red-300 ring-1 ring-red-200' : 'border-neutral-200 hover:border-neutral-300'
    }`}>
      {/* Top row: Title and Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Anggaran {summary.label}
          </h4>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.badgeClass}`}>
          {statusConfig.icon}
          <span>{statusConfig.badge}</span>
        </div>
      </div>

      {/* Main Numbers */}
      <div className="space-y-1 mb-4">
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900 tabular-nums">
            {formatRupiah(summary.spent)}
          </div>
          <div className="text-xs font-mono text-neutral-500 tabular-nums">
            Batas: {formatRupiah(summary.limit)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${statusConfig.barColor}`}
            style={{ width: `${clampedPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
          <span>{summary.percentage}% terpakai</span>
          {isOver ? (
            <span className="text-red-600 font-semibold font-mono">
              + Melebihi {formatRupiah(summary.overspendAmount)}
            </span>
          ) : (
            <span className="text-emerald-700 font-medium font-mono">
              Sisa {formatRupiah(summary.remaining)}
            </span>
          )}
        </div>
      </div>

      {/* Extra contextual helper note */}
      {subtext && (
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
          <span>{subtext}</span>
          {onClickConfigure && (
            <button
              onClick={onClickConfigure}
              className="text-neutral-700 hover:text-neutral-950 font-medium flex items-center gap-0.5"
            >
              Ubah Limit <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
