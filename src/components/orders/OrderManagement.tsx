import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShoppingBag, 
  Search, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Printer, 
  Phone, 
  MapPin, 
  AlertCircle, 
  ChevronRight,
  ExternalLink,
  PackageCheck,
  Ban
} from 'lucide-react';
import { formatRupiah, formatDateTime } from '../../utils/format';
import { Order, OrderStatus } from '../../types';

interface OrderManagementProps {
  onOpenPrinterModal: (order: Order) => void;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({ onOpenPrinterModal }) => {
  const { orders, currentUser, updateOrderStatus } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // If customer is viewing, filter only to their orders or show all for admin/cashier
  const userOrders = currentUser.role === 'customer'
    ? orders.filter(o => o.customerName.toLowerCase().includes('ratna') || o.type === 'online')
    : orders;

  const filteredOrders = userOrders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (o.customerPhone || '').includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Menunggu Konfirmasi',
          classes: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300',
          icon: Clock
        };
      case 'processing':
        return {
          label: 'Sedang Disiapkan',
          classes: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
          icon: PackageCheck
        };
      case 'ready':
      case 'delivered':
        return {
          label: 'Sedang Diantar ke Rumah',
          classes: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
          icon: Truck
        };
      case 'completed':
        return {
          label: 'Selesai & Diterima',
          classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
          icon: CheckCircle2
        };
      case 'cancelled':
        return {
          label: 'Dibatalkan',
          classes: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
          icon: Ban
        };
      default:
        return { label: status, classes: 'bg-slate-100 text-slate-800', icon: Clock };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            {currentUser.role === 'customer' ? 'Status & Riwayat Pesanan Saya' : 'Manajemen & Pantau Pesanan Real-Time'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentUser.role === 'customer'
              ? 'Lacak status pesanan sembako online Anda yang sedang diproses atau diantar warung.'
              : 'Konfirmasi pesanan online warga, perbarui status pengantaran, dan cetak struk kasir.'}
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nomor struk pesanan atau nama pelanggan..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'pending', label: 'Menunggu' },
              { id: 'processing', label: 'Disiapkan' },
              { id: 'delivered', label: 'Diantar' },
              { id: 'completed', label: 'Selesai' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders List Cards */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Belum ada pesanan dalam kategori ini.
            </p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const badge = getStatusBadge(order.status);
            const StatusIcon = badge.icon;
            const itemsCount = order.items.reduce((acc, it) => acc + it.quantity, 0);

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Info & Items */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      #{order.orderNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${badge.classes}`}>
                      <StatusIcon className="w-3 h-3" />
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDateTime(order.createdAt)}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold uppercase">
                      {order.type === 'pos' ? 'POS Warung' : 'Online Warga'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {order.customerName}
                    </h4>
                    {order.customerAddress && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{order.customerAddress}</span>
                      </p>
                    )}
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-500 dark:text-slate-400">Barang: </span>
                    {order.items.slice(0, 3).map((item, idx) => (
                      <span key={idx}>
                        {item.productName} ({item.quantity}x){idx < Math.min(order.items.length - 1, 2) ? ', ' : ''}
                      </span>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-slate-400"> +{order.items.length - 3} lainnya</span>
                    )}
                  </div>

                  {/* Real-time visual tracking indicator for citizens */}
                  {currentUser.role === 'customer' && order.type === 'online' && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
                        <span className={order.status !== 'cancelled' ? 'text-emerald-600 font-bold' : ''}>Diterima</span>
                        <span className={order.status === 'processing' || order.status === 'delivered' || order.status === 'completed' ? 'text-emerald-600 font-bold' : ''}>Disiapkan</span>
                        <span className={order.status === 'delivered' || order.status === 'completed' ? 'text-emerald-600 font-bold' : ''}>Sedang Diantar</span>
                        <span className={order.status === 'completed' ? 'text-emerald-600 font-bold' : ''}>Selesai</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{
                            width:
                              order.status === 'pending'
                                ? '25%'
                                : order.status === 'processing'
                                ? '55%'
                                : order.status === 'delivered'
                                ? '80%'
                                : order.status === 'completed'
                                ? '100%'
                                : '0%',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Total & Action Controls */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-slate-400">Total Pembayaran ({order.paymentMethod.toUpperCase()})</p>
                    <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(order.totalAmount)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Bluetooth Print Button */}
                    <button
                      onClick={() => onOpenPrinterModal(order)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Cetak Struk Transaksi via Bluetooth"
                    >
                      <Printer className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span className="hidden sm:inline">Cetak</span>
                    </button>

                    {/* WhatsApp notification contact shortcut */}
                    {order.customerPhone && (
                      <a
                        href={`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1"
                        title="Hubungi via WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">WA</span>
                      </a>
                    )}

                    {/* Status updater for Admin / Cashier */}
                    {currentUser.role !== 'customer' && (
                      <>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'processing')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
                          >
                            Siapkan Pesanan
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm"
                          >
                            Kirim ke Warga
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                          >
                            Tandai Selesai
                          </button>
                        )}
                      </>
                    )}

                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 my-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Rincian Pesanan #{selectedOrder.orderNumber}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {formatDateTime(selectedOrder.createdAt)}
                </p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Pelanggan: {selectedOrder.customerName}
                </p>
                {selectedOrder.customerPhone && (
                  <p className="text-slate-500">Telp/WA: {selectedOrder.customerPhone}</p>
                )}
                {selectedOrder.customerAddress && (
                  <p className="text-slate-500">Alamat: {selectedOrder.customerAddress}</p>
                )}
                {selectedOrder.notes && (
                  <p className="text-amber-600 dark:text-amber-400">Catatan: "{selectedOrder.notes}"</p>
                )}
              </div>

              {/* Items */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 dark:text-slate-300">Daftar Produk:</span>
                <div className="max-h-40 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="pt-1 flex justify-between">
                      <div>
                        <p className="font-semibold">{item.productName}</p>
                        <span className="text-[10px] text-slate-400">{item.quantity} {item.unit} x {formatRupiah(item.price)}</span>
                      </div>
                      <span className="font-bold">{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center font-bold text-sm">
                <span>Total:</span>
                <span className="text-emerald-600">{formatRupiah(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  onOpenPrinterModal(selectedOrder);
                  setSelectedOrder(null);
                }}
                className="flex-1 py-2 text-xs font-bold bg-teal-600 text-white rounded-xl flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Struk Bluetooth</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
