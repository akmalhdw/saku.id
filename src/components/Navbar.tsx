import React from 'react';
import { Plus, Bell, Smartphone } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAddModal: () => void;
  activeAlertCount: number;
  onToggleAlerts: () => void;
  onOpenInstallModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  activeAlertCount,
  onToggleAlerts,
  onOpenInstallModal,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Ringkasan' },
    { id: 'budget', label: 'Perencanaan Anggaran' },
    { id: 'transactions', label: 'Transaksi' },
    { id: 'wallets', label: 'Dompet & Rekening' },
    { id: 'savings', label: 'Target Tabungan' },
    { id: 'bills', label: 'Tagihan & Hutang' },
    { id: 'analytics', label: 'Analisis & Laporan' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element Brand Zone */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              KU
            </div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
              className="text-lg font-bold tracking-tight text-neutral-900 hover:text-neutral-700 transition-colors"
            >
              KelolaUang
            </a>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`whitespace-nowrap transition-colors py-1 relative ${
                  activeTab === item.id
                    ? 'text-neutral-900 font-semibold'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {item.label}
                {activeTab === item.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2">
            {/* Install on Mobile Prompt Button */}
            <button
              onClick={onOpenInstallModal}
              title="Pasang di Layar Utama HP"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs whitespace-nowrap"
            >
              <Smartphone className="w-3.5 h-3.5 text-neutral-600" />
              <span>Pasang di HP</span>
            </button>

            {/* Alert Bell Button with Badge */}
            <button
              onClick={onToggleAlerts}
              title={activeAlertCount > 0 ? `${activeAlertCount} Peringatan Limit Aktif` : 'Tidak ada peringatan'}
              className={`relative p-2 rounded-lg border transition-colors ${
                activeAlertCount > 0
                  ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              <Bell className="w-4 h-4" />
              {activeAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                  {activeAlertCount}
                </span>
              )}
            </button>

            {/* Main Action: Catat Transaksi */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-sm whitespace-nowrap active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Transaksi</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto py-2.5 border-t border-neutral-100 no-scrollbar text-xs font-medium">
          <button
            onClick={onOpenInstallModal}
            className="whitespace-nowrap px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 font-semibold shrink-0"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
            <span>Pasang di HP</span>
          </button>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`whitespace-nowrap px-2 py-1 rounded transition-colors ${
                activeTab === item.id
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
