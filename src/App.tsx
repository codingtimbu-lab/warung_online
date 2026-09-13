import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { NavigationTabs } from './components/layout/NavigationTabs';
import { CashierPOS } from './components/pos/CashierPOS';
import { CustomerStore } from './components/store/CustomerStore';
import { InventoryManagement } from './components/inventory/InventoryManagement';
import { OrderManagement } from './components/orders/OrderManagement';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { CustomerSupportChat } from './components/chat/CustomerSupportChat';
import { ApiIntegrationModal } from './components/api/ApiIntegrationModal';
import { BluetoothPrinterModal } from './components/printer/BluetoothPrinterModal';
import { AuthModal } from './components/auth/AuthModal';
import { Order } from './types';
import { Smartphone, Monitor } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, currentUser } = useApp();
  const [deviceView, setDeviceView] = useState<'responsive' | 'mobile'>('responsive');
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [orderForPrinter, setOrderForPrinter] = useState<Order | null>(null);

  const handleOpenPrinter = (order?: Order) => {
    if (order) setOrderForPrinter(order);
    setIsPrinterModalOpen(true);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'pos':
        return <CashierPOS onOpenPrinterModal={handleOpenPrinter} />;
      case 'store':
        return <CustomerStore />;
      case 'inventory':
        return <InventoryManagement />;
      case 'orders':
        return <OrderManagement onOpenPrinterModal={handleOpenPrinter} />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'chat':
        return <CustomerSupportChat />;
      case 'api':
        return <ApiIntegrationModal />;
      default:
        return <CashierPOS onOpenPrinterModal={handleOpenPrinter} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* If in simulated Android Mobile Phone Frame Mode */}
      {deviceView === 'mobile' ? (
        <div className="py-6 px-2 flex flex-col items-center justify-center min-h-screen">
          {/* Top banner switch back */}
          <div className="mb-3 flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm text-xs text-slate-600 dark:text-slate-300">
            <Smartphone className="w-3.5 h-3.5 text-blue-500" />
            <span>Mode Android Phone Mockup</span>
            <button
              onClick={() => setDeviceView('responsive')}
              className="text-emerald-600 dark:text-emerald-400 font-bold ml-1 hover:underline"
            >
              Kembali ke Layar Penuh
            </button>
          </div>

          {/* Android Smartphone Container Frame */}
          <div className="w-full max-w-[420px] h-[850px] max-h-[92vh] bg-white dark:bg-slate-900 rounded-[44px] shadow-2xl border-[10px] border-slate-800 dark:border-slate-800 flex flex-col overflow-hidden relative ring-1 ring-black/10">
            {/* Speaker & Front Camera Notch */}
            <div className="h-6 bg-slate-900 flex items-center justify-center relative shrink-0">
              <div className="w-16 h-4 bg-slate-800 rounded-full flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
              </div>
            </div>

            {/* Simulated Android Status Bar */}
            <div className="px-5 py-1 bg-white dark:bg-slate-900 flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-mono border-b border-slate-100 dark:border-slate-800 shrink-0 select-none">
              <span>09:41</span>
              <div className="flex items-center gap-1.5">
                <span>LTE 4G</span>
                <span>📶</span>
                <span>🔋 92%</span>
              </div>
            </div>

            {/* App Header & Body inside mobile */}
            <div className="flex-1 overflow-y-auto flex flex-col pb-16">
              <Navbar
                deviceView={deviceView}
                setDeviceView={setDeviceView}
                onOpenPrinterModal={() => handleOpenPrinter()}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />
              <NavigationTabs />
              <main className="flex-1">{renderActiveTab()}</main>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Full-Screen Responsive Mode */
        <div className="flex flex-col min-h-screen pb-16 md:pb-6">
          <Navbar
            deviceView={deviceView}
            setDeviceView={setDeviceView}
            onOpenPrinterModal={() => handleOpenPrinter()}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
          <NavigationTabs />
          <main className="flex-1">{renderActiveTab()}</main>
        </div>
      )}

      {/* Global Modals */}
      <BluetoothPrinterModal
        isOpen={isPrinterModalOpen}
        onClose={() => {
          setIsPrinterModalOpen(false);
          setOrderForPrinter(null);
        }}
        selectedOrder={orderForPrinter}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
