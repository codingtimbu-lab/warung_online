import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calculator, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Store, 
  MessageSquare, 
  Cpu,
  BadgeAlert
} from 'lucide-react';

export const NavigationTabs: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, products, orders } = useApp();

  // Low stock counter for badge
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;
  // Pending orders count for badge
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;

  const allNavItems = [
    {
      id: 'pos',
      label: 'Kasir POS',
      icon: Calculator,
      roles: ['admin', 'cashier'],
      badge: null,
    },
    {
      id: 'store',
      label: 'Toko Sembako',
      icon: Store,
      roles: ['admin', 'cashier', 'customer'],
      badge: null,
    },
    {
      id: 'inventory',
      label: 'Stok & Gudang',
      icon: Package,
      roles: ['admin', 'cashier'],
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'orders',
      label: currentUser.role === 'customer' ? 'Pesanan Saya' : 'Pesanan Warga',
      icon: ShoppingBag,
      roles: ['admin', 'cashier', 'customer'],
      badge: pendingOrdersCount > 0 && currentUser.role !== 'customer' ? pendingOrdersCount : null,
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'analytics',
      label: 'Analitik & Laporan',
      icon: BarChart3,
      roles: ['admin'],
      badge: null,
    },
    {
      id: 'chat',
      label: 'Live Chat',
      icon: MessageSquare,
      roles: ['admin', 'cashier', 'customer'],
      badge: null,
    },
    {
      id: 'api',
      label: 'Integrasi API',
      icon: Cpu,
      roles: ['admin'],
      badge: 'v1',
      badgeColor: 'bg-indigo-600',
    },
  ];

  const filteredItems = allNavItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <>
      {/* Desktop/Tablet Horizontal Tabs */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors sticky top-[57px] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-2 py-2 overflow-x-auto no-scrollbar">
            {filteredItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== null && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-slate-700'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Android Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 py-1 px-2 shadow-lg">
        <div className="flex items-center justify-around">
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-lg transition-colors flex-1 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge !== null && (
                    <span className={`absolute -top-1.5 -right-2 px-1 text-[9px] font-bold text-white rounded-full ${item.badgeColor || 'bg-rose-500'}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[65px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
