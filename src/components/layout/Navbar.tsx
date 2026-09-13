import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Store, 
  Wifi, 
  WifiOff, 
  Printer, 
  Bell, 
  Moon, 
  Sun, 
  UserCheck, 
  Smartphone, 
  Monitor, 
  X, 
  Check, 
  Trash2, 
  AlertTriangle,
  ShoppingBag
} from 'lucide-react';
import { formatDateTime } from '../../utils/format';

interface NavbarProps {
  deviceView: 'responsive' | 'mobile';
  setDeviceView: (mode: 'responsive' | 'mobile') => void;
  onOpenPrinterModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  deviceView,
  setDeviceView,
  onOpenPrinterModal,
  onOpenAuthModal,
}) => {
  const { 
    currentUser, 
    isOffline, 
    toggleOfflineMode, 
    offlineQueueCount, 
    syncOfflineData,
    darkMode, 
    toggleDarkMode,
    bluetoothInfo,
    notifications,
    unreadNotifsCount,
    markNotificationAsRead,
    clearAllNotifications,
    setActiveTab,
    cart
  } = useApp();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Store Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-slate-900 dark:text-white tracking-tight text-base sm:text-lg leading-tight">
                Warung Berkah
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                Sembako & POS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden xs:block">
              Kasir, Stok Real-Time & Belanja Warga
            </p>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Offline Mode Indicator & Toggle */}
          <button
            onClick={toggleOfflineMode}
            title={isOffline ? 'Klik untuk kembali Online' : 'Klik untuk uji Mode Offline'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isOffline
                ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800 animate-pulse'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden md:inline">Mode Offline</span>
                {offlineQueueCount > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] px-1 rounded-full font-bold">
                    {offlineQueueCount}
                  </span>
                )}
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline">Online</span>
              </>
            )}
          </button>

          {/* Sync button if offline queue has items */}
          {offlineQueueCount > 0 && !isOffline && (
            <button
              onClick={syncOfflineData}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-2 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
              title="Sinkronkan data transaksi offline ke server"
            >
              <Check className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sync ({offlineQueueCount})</span>
            </button>
          )}

          {/* Bluetooth Thermal Printer Badge / Modal Trigger */}
          <button
            onClick={onOpenPrinterModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              bluetoothInfo.connected
                ? 'bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
            title="Pengaturan Cetak Struk Bluetooth ESC/POS"
          >
            <Printer className={`w-3.5 h-3.5 ${bluetoothInfo.connected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
            <span className="hidden lg:inline">
              {bluetoothInfo.connected ? 'BT: Siap Cetak' : 'BT Printer'}
            </span>
          </button>

          {/* Mobile Emulation / Desktop Toggle */}
          <button
            onClick={() => setDeviceView(deviceView === 'responsive' ? 'mobile' : 'responsive')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            title="Beralih antara Tampilan Responsif dan Tampilan Layar Android Seluler"
          >
            {deviceView === 'responsive' ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                <span className="hidden xl:inline">Simulasi Android</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden xl:inline">Layar Penuh</span>
              </>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Cart Shortcut for customer */}
          {currentUser.role === 'customer' && (
            <button
              onClick={() => setActiveTab('store')}
              className="relative p-2 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Keranjang Belanja"
            >
              <ShoppingBag className="w-4 h-4" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {cart.length}
                </span>
              )}
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      Notifikasi Real-Time ({notifications.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Bersihkan
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifDropdown(false)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                    >
                      <X className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Tidak ada notifikasi baru.
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.type === 'order') {
                            setActiveTab('orders');
                            setShowNotifDropdown(false);
                          } else if (notif.type === 'stock') {
                            setActiveTab('inventory');
                            setShowNotifDropdown(false);
                          }
                        }}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors ${
                          !notif.read ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {notif.type === 'stock' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          ) : notif.type === 'order' ? (
                            <ShoppingBag className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                              {notif.title}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                              {formatDateTime(notif.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Role Switcher Trigger */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors ml-1"
            title="Klik untuk Ganti Peran Akses (Admin, Kasir, Warga)"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-300 dark:bg-slate-700 shrink-0">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserCheck className="w-4 h-4 m-1.5 text-slate-600 dark:text-slate-300" />
              )}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight max-w-[110px] truncate">
                {currentUser.name}
              </p>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                currentUser.role === 'admin' 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : currentUser.role === 'cashier' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-amber-600 dark:text-amber-400'
              }`}>
                {currentUser.role === 'admin' ? 'Admin Toko' : currentUser.role === 'cashier' ? 'Kasir POS' : 'Warga / Pembeli'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
