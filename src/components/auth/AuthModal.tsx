import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  X, 
  KeyRound, 
  CheckCircle2, 
  UserCheck, 
  Store, 
  Calculator, 
  ShoppingBag,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, users, switchUser } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPin, setShowPin] = useState(false);

  if (!isOpen) return null;

  // Default demo PINs
  const ROLE_PINS: Record<UserRole, string> = {
    admin: '1234',
    cashier: '0000',
    customer: '', // No PIN required for citizens
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setPinInput('');
    setPinError('');
  };

  const handleConfirmSwitch = () => {
    if (selectedRole === 'admin' && pinInput !== ROLE_PINS.admin && pinInput !== '') {
      // In demo, default PIN is 1234 or accept empty if user just clicks
      if (pinInput !== '1234') {
        setPinError('PIN Admin salah (Gunakan PIN default: 1234)');
        return;
      }
    }

    if (selectedRole === 'cashier' && pinInput !== ROLE_PINS.cashier && pinInput !== '') {
      if (pinInput !== '0000') {
        setPinError('PIN Kasir salah (Gunakan PIN default: 0000)');
        return;
      }
    }

    const targetUser = users.find(u => u.role === selectedRole);
    if (targetUser) {
      switchUser(targetUser.id);
      onClose();
    }
  };

  const roleDetails = [
    {
      role: 'admin' as UserRole,
      title: 'Pemilik Toko / Admin',
      name: 'Haji Sulaiman',
      desc: 'Akses penuh: Atur harga, manajemen stok gudang, analitik laba rugi, ekspor PDF/Excel, konfigurasi printer & integrasi API.',
      icon: Store,
      color: 'emerald',
      pinHint: 'PIN Demo: 1234'
    },
    {
      role: 'cashier' as UserRole,
      title: 'Kasir POS Warung',
      name: 'Rian Pratama',
      desc: 'Akses transaksi kasir harian, hitung kembalian tunai/QRIS, cetak struk bluetooth, dan terima pesanan sembako warga.',
      icon: Calculator,
      color: 'blue',
      pinHint: 'PIN Demo: 0000'
    },
    {
      role: 'customer' as UserRole,
      title: 'Akun Warga / Pelanggan',
      name: 'Ibu Ratna (Warga RT 04)',
      desc: 'Belanja sembako online, filter harga & kategori, pembayaran QRIS/COD, pelacakan status pesanan real-time, dan chat warung.',
      icon: ShoppingBag,
      color: 'amber',
      pinHint: 'Tanpa PIN (Langsung Belanja)'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Sistem Autentikasi Berbasis Peran (RBAC)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pilih peran akses pengguna untuk menyesuaikan hak izin aplikasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="space-y-3">
            {roleDetails.map(item => {
              const Icon = item.icon;
              const isSelected = selectedRole === item.role;
              return (
                <div
                  key={item.role}
                  onClick={() => handleRoleSelect(item.role)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl mt-0.5 ${
                        item.role === 'admin'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : item.role === 'cashier'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {item.title}
                          </h4>
                          {currentUser.role === item.role && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              Aktif Sekarang
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {item.desc}
                        </p>
                        <span className="inline-block mt-1.5 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          {item.pinHint}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 pt-1">
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PIN Input if Admin or Cashier is selected */}
          {selectedRole !== 'customer' && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Masukkan PIN Keamanan ({selectedRole === 'admin' ? 'Admin: 1234' : 'Kasir: 0000'})</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <input
                type={showPin ? 'text' : 'password'}
                maxLength={6}
                value={pinInput}
                onChange={e => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                placeholder={selectedRole === 'admin' ? 'Masukkan 1234 atau klik Ganti' : 'Masukkan 0000'}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {pinError && (
                <p className="text-[11px] text-rose-600 font-medium">
                  {pinError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmSwitch}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
          >
            Ganti ke {selectedRole === 'admin' ? 'Admin' : selectedRole === 'cashier' ? 'Kasir' : 'Warga'}
          </button>
        </div>
      </div>
    </div>
  );
};
