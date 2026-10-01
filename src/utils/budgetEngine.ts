import { Transaction, BudgetConfig, PeriodBudgetSummary, BudgetAlert } from '../types/finance';
import { getTodayString, getStartOfWeek, getRemainingDaysInMonth, formatRupiah } from './formatters';

export interface BudgetAnalysisResult {
  daily: PeriodBudgetSummary;
  weekly: PeriodBudgetSummary;
  monthly: PeriodBudgetSummary;
  categorySpending: Record<string, number>;
  categorySummaries: Array<{
    category: string;
    spent: number;
    limit: number;
    percentage: number;
    status: 'safe' | 'warning' | 'danger';
  }>;
  alerts: BudgetAlert[];
  recommendedDailyRemaining: number;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
  netCashFlowThisMonth: number;
  savingsRate: number; // in %
}

export const analyzeBudgetAndSpending = (
  transactions: Transaction[],
  budgetConfig: BudgetConfig
): BudgetAnalysisResult => {
  const todayStr = getTodayString();
  const todayDate = new Date();
  const currentYear = todayDate.getFullYear();
  const currentMonth = todayDate.getMonth(); // 0-indexed

  const startOfWeekDate = getStartOfWeek(todayDate);
  const endOfWeekDate = new Date(startOfWeekDate);
  endOfWeekDate.setDate(startOfWeekDate.getDate() + 6);
  endOfWeekDate.setHours(23, 59, 59, 999);

  let dailyExpense = 0;
  let weeklyExpense = 0;
  let monthlyExpense = 0;
  let totalIncomeThisMonth = 0;
  const categorySpending: Record<string, number> = {};

  for (const t of transactions) {
    const [tYear, tMonth, tDay] = t.date.split('-').map(Number);
    const txDate = new Date(tYear, tMonth - 1, tDay);

    const isThisMonth = tYear === currentYear && (tMonth - 1) === currentMonth;

    if (t.type === 'income') {
      if (isThisMonth) {
        totalIncomeThisMonth += t.amount;
      }
      continue;
    }

    // Expense processing
    if (isThisMonth) {
      monthlyExpense += t.amount;
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    }

    if (t.date === todayStr) {
      dailyExpense += t.amount;
    }

    if (txDate >= startOfWeekDate && txDate <= endOfWeekDate) {
      weeklyExpense += t.amount;
    }
  }

  // Calculate Period Summaries
  const getStatus = (spent: number, limit: number, thresholdPercent: number): 'safe' | 'warning' | 'danger' => {
    if (limit <= 0) return 'safe';
    const pct = (spent / limit) * 100;
    if (pct >= 100) return 'danger';
    if (pct >= thresholdPercent) return 'warning';
    return 'safe';
  };

  const createSummary = (
    period: 'daily' | 'weekly' | 'monthly',
    label: string,
    spent: number,
    limit: number
  ): PeriodBudgetSummary => {
    const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    const remaining = Math.max(0, limit - spent);
    const overspendAmount = Math.max(0, spent - limit);
    const status = getStatus(spent, limit, budgetConfig.warningThresholdPercent);

    return {
      period,
      label,
      spent,
      limit,
      percentage,
      remaining,
      status,
      overspendAmount,
    };
  };

  const daily = createSummary('daily', 'Harian', dailyExpense, budgetConfig.dailyLimit);
  const weekly = createSummary('weekly', 'Mingguan', weeklyExpense, budgetConfig.weeklyLimit);
  const monthly = createSummary('monthly', 'Bulanan', monthlyExpense, budgetConfig.monthlyLimit);

  // Remaining days in month for smart daily burn rate recommendation
  const remainingDays = getRemainingDaysInMonth();
  const remainingMonthlyBudget = Math.max(0, budgetConfig.monthlyLimit - monthlyExpense);
  const recommendedDailyRemaining = remainingDays > 0 ? Math.floor(remainingMonthlyBudget / remainingDays) : 0;

  // Category Summaries
  const categorySummaries: Array<{
    category: string;
    spent: number;
    limit: number;
    percentage: number;
    status: 'safe' | 'warning' | 'danger';
  }> = [];

  for (const [catName, catLimit] of Object.entries(budgetConfig.categoryBudgets)) {
    const spent = categorySpending[catName] || 0;
    const percentage = catLimit > 0 ? Math.round((spent / catLimit) * 100) : 0;
    const status = getStatus(spent, catLimit, budgetConfig.warningThresholdPercent);
    categorySummaries.push({
      category: catName,
      spent,
      limit: catLimit,
      percentage,
      status,
    });
  }

  // Also include categories that had spending but no configured limit
  for (const [catName, spent] of Object.entries(categorySpending)) {
    if (budgetConfig.categoryBudgets[catName] === undefined) {
      categorySummaries.push({
        category: catName,
        spent,
        limit: 0,
        percentage: 0,
        status: 'safe',
      });
    }
  }

  // Sort categories by highest spent
  categorySummaries.sort((a, b) => b.spent - a.spent);

  // Generate Alerts
  const alerts: BudgetAlert[] = [];
  const nowTimestamp = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // 1. Daily Alert
  if (budgetConfig.enableDailyAlert && daily.limit > 0) {
    if (daily.status === 'danger') {
      alerts.push({
        id: 'alert-daily-exceeded',
        type: 'daily',
        title: 'Batas Anggaran Harian Terlampaui!',
        message: `Pengeluaran hari ini telah mencapai ${formatRupiah(daily.spent)} dari batas ${formatRupiah(daily.limit)} (melebihi ${formatRupiah(daily.overspendAmount)} / ${daily.percentage}%). Disarankan menunda pengeluaran non-primer hari ini.`,
        severity: 'danger',
        currentAmount: daily.spent,
        limitAmount: daily.limit,
        percentage: daily.percentage,
        timestamp: nowTimestamp,
      });
    } else if (daily.status === 'warning') {
      alerts.push({
        id: 'alert-daily-warning',
        type: 'daily',
        title: 'Mendekati Batas Harian',
        message: `Pengeluaran hari ini sudah mencapai ${daily.percentage}% (${formatRupiah(daily.spent)} dari batas ${formatRupiah(daily.limit)}). Sisa aman hari ini: ${formatRupiah(daily.remaining)}.`,
        severity: 'warning',
        currentAmount: daily.spent,
        limitAmount: daily.limit,
        percentage: daily.percentage,
        timestamp: nowTimestamp,
      });
    }
  }

  // 2. Weekly Alert
  if (budgetConfig.enableWeeklyAlert && weekly.limit > 0) {
    if (weekly.status === 'danger') {
      alerts.push({
        id: 'alert-weekly-exceeded',
        type: 'weekly',
        title: 'Batas Anggaran Mingguan Terlampaui!',
        message: `Total belanja minggu ini sebesar ${formatRupiah(weekly.spent)} melampaui limit mingguan ${formatRupiah(weekly.limit)} (+${formatRupiah(weekly.overspendAmount)}). Evaluasi pengeluaran akhir pekan.`,
        severity: 'danger',
        currentAmount: weekly.spent,
        limitAmount: weekly.limit,
        percentage: weekly.percentage,
        timestamp: nowTimestamp,
      });
    } else if (weekly.status === 'warning') {
      alerts.push({
        id: 'alert-weekly-warning',
        type: 'weekly',
        title: 'Peringatan Anggaran Mingguan',
        message: `Pengeluaran minggu ini telah mencapai ${weekly.percentage}% dari kuota mingguan. Sisa alokasi minggu ini: ${formatRupiah(weekly.remaining)}.`,
        severity: 'warning',
        currentAmount: weekly.spent,
        limitAmount: weekly.limit,
        percentage: weekly.percentage,
        timestamp: nowTimestamp,
      });
    }
  }

  // 3. Monthly Alert
  if (budgetConfig.enableMonthlyAlert && monthly.limit > 0) {
    if (monthly.status === 'danger') {
      alerts.push({
        id: 'alert-monthly-exceeded',
        type: 'monthly',
        title: 'Peringatan Kritis: Anggaran Bulanan Jebol!',
        message: `Total pengeluaran bulan ini mencapai ${formatRupiah(monthly.spent)}, melampaui rencana anggaran ${formatRupiah(monthly.limit)} sebesar ${formatRupiah(monthly.overspendAmount)}.`,
        severity: 'danger',
        currentAmount: monthly.spent,
        limitAmount: monthly.limit,
        percentage: monthly.percentage,
        timestamp: nowTimestamp,
      });
    } else if (monthly.status === 'warning') {
      alerts.push({
        id: 'alert-monthly-warning',
        type: 'monthly',
        title: 'Waspada: Kuota Bulanan Hampir Habis',
        message: `Pengeluaran bulan ini sudah ${monthly.percentage}% (${formatRupiah(monthly.spent)}). Tersisa ${formatRupiah(monthly.remaining)} untuk ${remainingDays} hari ke depan (alokasi aman: ${formatRupiah(recommendedDailyRemaining)}/hari).`,
        severity: 'warning',
        currentAmount: monthly.spent,
        limitAmount: monthly.limit,
        percentage: monthly.percentage,
        timestamp: nowTimestamp,
      });
    }
  }

  // 4. Category Alerts
  for (const cat of categorySummaries) {
    if (cat.limit > 0 && cat.status === 'danger') {
      alerts.push({
        id: `alert-cat-danger-${cat.category}`,
        type: 'category',
        title: `Overbudget Kategori: ${cat.category}`,
        message: `Pengeluaran ${cat.category} sudah ${formatRupiah(cat.spent)} melebihi kuota ${formatRupiah(cat.limit)} (+${formatRupiah(cat.spent - cat.limit)}).`,
        severity: 'danger',
        currentAmount: cat.spent,
        limitAmount: cat.limit,
        percentage: cat.percentage,
        categoryName: cat.category,
        timestamp: nowTimestamp,
      });
    }
  }

  const netCashFlowThisMonth = totalIncomeThisMonth - monthlyExpense;
  const savingsRate = totalIncomeThisMonth > 0 
    ? Math.max(0, Math.round((netCashFlowThisMonth / totalIncomeThisMonth) * 100))
    : 0;

  return {
    daily,
    weekly,
    monthly,
    categorySpending,
    categorySummaries,
    alerts,
    recommendedDailyRemaining,
    totalIncomeThisMonth,
    totalExpenseThisMonth: monthlyExpense,
    netCashFlowThisMonth,
    savingsRate,
  };
};
