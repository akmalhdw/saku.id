import React, { useState, useEffect, useMemo } from 'react';
import { 
  INITIAL_WALLETS, 
  INITIAL_BUDGET_CONFIG, 
  getInitialTransactions, 
  INITIAL_SAVINGS_GOALS, 
  INITIAL_BILL_REMINDERS, 
  INITIAL_DEBTS 
} from './utils/initialData';
import { 
  Wallet, 
  Transaction, 
  BudgetConfig, 
  SavingsGoal, 
  BillReminder, 
  DebtItem, 
  BudgetAlert 
} from './types/finance';
import { analyzeBudgetAndSpending } from './utils/budgetEngine';
import { getTodayString, getCurrentTimeString } from './utils/formatters';

import { Navbar } from './components/Navbar';
import { AlertBanner } from './components/AlertBanner';
import { DashboardView } from './components/DashboardView';
import { BudgetPlannerView } from './components/BudgetPlannerView';
import { TransactionsView } from './components/TransactionsView';
import { WalletsView } from './components/WalletsView';
import { SavingsGoalsView } from './components/SavingsGoalsView';
import { BillsAndDebtsView } from './components/BillsAndDebtsView';
import { AnalyticsView } from './components/AnalyticsView';

import { TransactionModal } from './components/TransactionModal';
import { TransferModal } from './components/TransferModal';
import { BudgetConfigModal } from './components/BudgetConfigModal';
import { InstallPwaModal } from './components/InstallPwaModal';

const STORAGE_KEY_PREFIX = 'kelolauang_app_state_v1';

export default function App() {
  // Load state from localStorage or defaults
  const [wallets, setWallets] = useState<Wallet[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_wallets`);
      return saved ? JSON.parse(saved) : INITIAL_WALLETS;
    } catch {
      return INITIAL_WALLETS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_transactions`);
      return saved ? JSON.parse(saved) : getInitialTransactions();
    } catch {
      return getInitialTransactions();
    }
  });

  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_budgetConfig`);
      return saved ? JSON.parse(saved) : INITIAL_BUDGET_CONFIG;
    } catch {
      return INITIAL_BUDGET_CONFIG;
    }
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_savingsGoals`);
      return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
    } catch {
      return INITIAL_SAVINGS_GOALS;
    }
  });

  const [bills, setBills] = useState<BillReminder[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_bills`);
      return saved ? JSON.parse(saved) : INITIAL_BILL_REMINDERS;
    } catch {
      return INITIAL_BILL_REMINDERS;
    }
  });

  const [debts, setDebts] = useState<DebtItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}_debts`);
      return saved ? JSON.parse(saved) : INITIAL_DEBTS;
    } catch {
      return INITIAL_DEBTS;
    }
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showAlertsSection, setShowAlertsSection] = useState<boolean>(true);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState<boolean>(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [prefilledCategoryFilter, setPrefilledCategoryFilter] = useState<string>('all');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_wallets`, JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_transactions`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_budgetConfig`, JSON.stringify(budgetConfig));
  }, [budgetConfig]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_savingsGoals`, JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_bills`, JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}_debts`, JSON.stringify(debts));
  }, [debts]);

  // Compute live budget analysis and alerts
  const analysis = useMemo(() => {
    return analyzeBudgetAndSpending(transactions, budgetConfig);
  }, [transactions, budgetConfig]);

  // Handle saving new or edited transaction with wallet balance update
  const handleSaveTransaction = (txData: Omit<Transaction, 'id'>, idToEdit?: string) => {
    if (idToEdit) {
      // Revert old impact on wallet
      const oldTx = transactions.find((t) => t.id === idToEdit);
      let updatedWallets = [...wallets];

      if (oldTx) {
        updatedWallets = updatedWallets.map((w) => {
          if (w.id === oldTx.walletId) {
            const revertedBalance = oldTx.type === 'expense' 
              ? w.balance + oldTx.amount 
              : w.balance - oldTx.amount;
            return { ...w, balance: revertedBalance };
          }
          return w;
        });
      }

      // Apply new impact
      updatedWallets = updatedWallets.map((w) => {
        if (w.id === txData.walletId) {
          const newBal = txData.type === 'expense' 
            ? w.balance - txData.amount 
            : w.balance + txData.amount;
          return { ...w, balance: newBal };
        }
        return w;
      });

      setWallets(updatedWallets);
      setTransactions((prev) =>
        prev.map((t) => (t.id === idToEdit ? { ...txData, id: idToEdit } : t))
      );
    } else {
      // New transaction
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}`,
      };

      setWallets((prev) =>
        prev.map((w) => {
          if (w.id === txData.walletId) {
            const newBal = txData.type === 'expense' 
              ? w.balance - txData.amount 
              : w.balance + txData.amount;
            return { ...w, balance: newBal };
          }
          return w;
        })
      );

      setTransactions((prev) => [newTx, ...prev]);
    }

    setTransactionToEdit(null);
  };

  // Delete transaction with wallet balance rollback
  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    if (confirm('Hapus transaksi ini dari buku kas?')) {
      setWallets((prev) =>
        prev.map((w) => {
          if (w.id === tx.walletId) {
            const reverted = tx.type === 'expense' 
              ? w.balance + tx.amount 
              : w.balance - tx.amount;
            return { ...w, balance: reverted };
          }
          return w;
        })
      );
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // Quick 1-click transaction add
  const handleQuickAdd = (category: string, amount: number, note: string) => {
    const defaultWallet = wallets[0];
    if (!defaultWallet) return;

    handleSaveTransaction({
      type: 'expense',
      category,
      amount,
      walletId: defaultWallet.id,
      date: getTodayString(),
      time: getCurrentTimeString(),
      note,
    });
  };

  // Transfer between wallets
  const handleTransfer = (sourceId: string, destId: string, amount: number, note: string) => {
    const sourceW = wallets.find((w) => w.id === sourceId);
    const destW = wallets.find((w) => w.id === destId);
    if (!sourceW || !destW) return;

    setWallets((prev) =>
      prev.map((w) => {
        if (w.id === sourceId) return { ...w, balance: w.balance - amount };
        if (w.id === destId) return { ...w, balance: w.balance + amount };
        return w;
      })
    );

    // Record as two corresponding tracking entries
    const now = getCurrentTimeString();
    const today = getTodayString();

    const transferOut: Transaction = {
      id: `tx-tr-out-${Date.now()}`,
      type: 'expense',
      category: 'Lainnya',
      amount,
      walletId: sourceId,
      date: today,
      time: now,
      note: `Transfer ke ${destW.name}: ${note}`,
    };

    const transferIn: Transaction = {
      id: `tx-tr-in-${Date.now() + 1}`,
      type: 'income',
      category: 'Lainnya',
      amount,
      walletId: destId,
      date: today,
      time: now,
      note: `Terima transfer dari ${sourceW.name}: ${note}`,
    };

    setTransactions((prev) => [transferOut, transferIn, ...prev]);
  };

  // Deposit into savings goal
  const handleDepositToGoal = (goalId: string, walletId: string, amount: number) => {
    const goal = savingsGoals.find((g) => g.id === goalId);
    const wallet = wallets.find((w) => w.id === walletId);
    if (!goal || !wallet) return;

    // Deduct from wallet
    setWallets((prev) =>
      prev.map((w) => (w.id === walletId ? { ...w, balance: w.balance - amount } : w))
    );

    // Increment goal amount
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );

    // Record transaction
    const depositTx: Transaction = {
      id: `tx-sg-${Date.now()}`,
      type: 'expense',
      category: 'Investasi & Tabungan',
      amount,
      walletId,
      date: getTodayString(),
      time: getCurrentTimeString(),
      note: `Setor tabungan: ${goal.title}`,
    };
    setTransactions((prev) => [depositTx, ...prev]);
  };

  // Pay bill with wallet
  const handlePayBillWithWallet = (bill: BillReminder, walletId: string) => {
    // Mark bill paid
    setBills((prev) =>
      prev.map((b) => (b.id === bill.id ? { ...b, isPaid: true } : b))
    );

    // Deduct wallet
    setWallets((prev) =>
      prev.map((w) => (w.id === walletId ? { ...w, balance: w.balance - bill.amount } : w))
    );

    // Record expense transaction
    const billTx: Transaction = {
      id: `tx-bill-${Date.now()}`,
      type: 'expense',
      category: bill.category || 'Tagihan & Utilitas',
      amount: bill.amount,
      walletId,
      date: getTodayString(),
      time: getCurrentTimeString(),
      note: `Bayar tagihan: ${bill.title}`,
    };
    setTransactions((prev) => [billTx, ...prev]);
  };

  // Reset to default demo data
  const handleResetData = () => {
    localStorage.clear();
    setWallets(INITIAL_WALLETS);
    setTransactions(getInitialTransactions());
    setBudgetConfig(INITIAL_BUDGET_CONFIG);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setBills(INITIAL_BILL_REMINDERS);
    setDebts(INITIAL_DEBTS);
    setActiveTab('dashboard');
  };

  // Restore from JSON backup
  const handleRestoreData = (importedData: any) => {
    if (importedData.wallets) setWallets(importedData.wallets);
    if (importedData.transactions) setTransactions(importedData.transactions);
    if (importedData.budgetConfig) setBudgetConfig(importedData.budgetConfig);
    if (importedData.savingsGoals) setSavingsGoals(importedData.savingsGoals);
  };

  const handleFilterTransactionsByAlert = (type: string, category?: string) => {
    if (category) {
      setPrefilledCategoryFilter(category);
    } else {
      setPrefilledCategoryFilter('all');
    }
    setActiveTab('transactions');
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
      {/* 3-Zone Top Navigation Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => {
          setTransactionToEdit(null);
          setIsAddTxModalOpen(true);
        }}
        activeAlertCount={analysis.alerts.length}
        onToggleAlerts={() => setShowAlertsSection((prev) => !prev)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dynamic Budget Overlimit Alert Banner */}
        {showAlertsSection && (
          <AlertBanner
            alerts={analysis.alerts}
            onOpenBudgetPlanner={() => setActiveTab('budget')}
            onFilterTransactionsByAlert={handleFilterTransactionsByAlert}
          />
        )}

        {/* View Routing */}
        {activeTab === 'dashboard' && (
          <DashboardView
            wallets={wallets}
            transactions={transactions}
            debts={debts}
            analysis={analysis}
            budgetConfig={budgetConfig}
            onOpenAddModal={() => {
              setTransactionToEdit(null);
              setIsAddTxModalOpen(true);
            }}
            onOpenTransferModal={() => setIsTransferModalOpen(true)}
            onOpenConfigModal={() => setIsConfigModalOpen(true)}
            onSelectTab={setActiveTab}
            onEditTransaction={(tx) => {
              setTransactionToEdit(tx);
              setIsAddTxModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onQuickAdd={handleQuickAdd}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetPlannerView
            config={budgetConfig}
            analysis={analysis}
            onUpdateConfig={setBudgetConfig}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            wallets={wallets}
            onOpenAddModal={() => {
              setTransactionToEdit(null);
              setIsAddTxModalOpen(true);
            }}
            onEditTransaction={(tx) => {
              setTransactionToEdit(tx);
              setIsAddTxModalOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            initialCategoryFilter={prefilledCategoryFilter}
          />
        )}

        {activeTab === 'wallets' && (
          <WalletsView
            wallets={wallets}
            transactions={transactions}
            debts={debts}
            onOpenTransferModal={() => setIsTransferModalOpen(true)}
            onUpdateWallets={setWallets}
          />
        )}

        {activeTab === 'savings' && (
          <SavingsGoalsView
            goals={savingsGoals}
            wallets={wallets}
            onUpdateGoals={setSavingsGoals}
            onDepositToGoal={handleDepositToGoal}
          />
        )}

        {activeTab === 'bills' && (
          <BillsAndDebtsView
            bills={bills}
            debts={debts}
            wallets={wallets}
            onUpdateBills={setBills}
            onUpdateDebts={setDebts}
            onPayBillWithWallet={handlePayBillWithWallet}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            analysis={analysis}
            transactions={transactions}
            wallets={wallets}
            budgetConfig={budgetConfig}
            savingsGoals={savingsGoals}
            onResetData={handleResetData}
            onRestoreData={handleRestoreData}
          />
        )}
      </main>

      {/* Modals */}
      <TransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => {
          setIsAddTxModalOpen(false);
          setTransactionToEdit(null);
        }}
        onSave={handleSaveTransaction}
        transactionToEdit={transactionToEdit}
        wallets={wallets}
        budgetConfig={budgetConfig}
        currentDailySpent={analysis.daily.spent}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        wallets={wallets}
        onTransfer={handleTransfer}
      />

      <BudgetConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={budgetConfig}
        onSave={setBudgetConfig}
      />

      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Clean Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-12 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} KelolaUang — Sistem Perencanaan Anggaran & Pengendalian Overbudget.</p>
          <p className="font-mono text-[11px] text-neutral-400">
            Kalkulasi Real-Time Harian · Mingguan · Bulanan
          </p>
        </div>
      </footer>
    </div>
  );
}
