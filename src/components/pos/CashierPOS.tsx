import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  AlertCircle, 
  WifiOff, 
  RotateCcw,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { formatRupiah } from '../../utils/format';
import { Product, OrderItem, PaymentMethod } from '../../types';

interface CashierPOSProps {
  onOpenPrinterModal: (order?: any) => void;
}

export const CashierPOS: React.FC<CashierPOSProps> = ({ onOpenPrinterModal }) => {
  const { 
    products, 
    currentUser, 
    createOrder, 
    isOffline, 
    bluetoothInfo, 
    printReceipt 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('Pelanggan Tunai');

  // Checkout modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('tunai');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [customCashInput, setCustomCashInput] = useState<string>('');
  const [recentCompletedOrder, setRecentCompletedOrder] = useState<any | null>(null);

  // Categories list
  const categories = [
    'Semua',
    'Beras & Biji',
    'Minyak & Bumbu',
    'Telur & Olahan',
    'Mi & Instan',
    'Gula & Tepung',
    'Minuman & Kopi',
    'Sabun & Rumah',
  ];

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cart operations
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Cannot exceed available stock
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.sellingPrice,
        costPrice: product.costPrice,
        unit: product.unit,
        subtotal: product.sellingPrice,
      }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    const prod = products.find(p => p.id === productId);
    setCartItems(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (prod && newQty > prod.stock) return item; // limit
          return { ...item, quantity: newQty, subtotal: newQty * item.price };
        }
        return item;
      }).filter(Boolean) as OrderItem[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleClearCart = () => setCartItems([]);

  const totalAmount = cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cashChange = Math.max(0, (cashGiven || 0) - totalAmount);

  // Preset cash shortcuts
  const quickCashOptions = [
    totalAmount,
    Math.ceil(totalAmount / 10000) * 10000,
    Math.ceil(totalAmount / 50000) * 50000,
    100000,
    200000,
  ].filter((v, i, arr) => v >= totalAmount && arr.indexOf(v) === i);

  const handleOpenCheckout = () => {
    if (cartItems.length === 0) return;
    setCashGiven(totalAmount);
    setCustomCashInput(String(totalAmount));
    setIsCheckoutOpen(true);
  };

  const handleProcessOrder = async () => {
    if (paymentMethod === 'tunai' && cashGiven < totalAmount) {
      alert('Uang yang diterima kurang dari total tagihan!');
      return;
    }

    const orderData = {
      type: 'pos' as const,
      customerName: customerName.trim() || 'Pelanggan Tunai',
      items: cartItems,
      paymentMethod,
      paymentStatus: 'paid' as const,
      status: 'completed' as const,
      cashReceived: paymentMethod === 'tunai' ? cashGiven : totalAmount,
      cashChange: paymentMethod === 'tunai' ? cashChange : 0,
      cashierName: currentUser.name,
    };

    const completed = await createOrder(orderData);
    setRecentCompletedOrder(completed);
    setCartItems([]);
    setIsCheckoutOpen(false);

    // Auto print if bluetooth is connected
    if (bluetoothInfo.connected) {
      printReceipt(completed);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4">
      {/* Top Banner if Offline */}
      {isOffline && (
        <div className="mb-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600" />
            <span>
              <strong>Mode Kasir Offline:</strong> Transaksi kasir tetap berjalan lancar dan tersimpan di memori perangkat.
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900">
            Penyimpanan Lokal Aktif
          </span>
        </div>
      )}

      {/* Main Grid: Left side Products Catalog, Right side POS Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Search, Categories & Products Grid */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3">
          {/* Search bar & Scan trigger */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari sembako (nama produk, beras, minyak, SKU...)"
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => setSearchQuery('BRS')}
              className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl flex items-center gap-1.5 transition-colors"
              title="Filter Cepat Beras"
            >
              <span>🍚 Beras</span>
            </button>
          </div>

          {/* Category Chips */}
          <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Items Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
            {filteredProducts.map(product => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= product.minStock;
              const inCartQty = cartItems.find(i => i.productId === product.id)?.quantity || 0;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && handleAddToCart(product)}
                  className={`bg-white dark:bg-slate-900 rounded-xl border p-2.5 flex flex-col justify-between transition-all select-none ${
                    isOutOfStock
                      ? 'border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                      : 'border-slate-200 dark:border-slate-800 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 hover:shadow-md cursor-pointer active:scale-[0.98]'
                  }`}
                >
                  <div>
                    {/* Image / Thumbnail */}
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 mb-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                      {inCartQty > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-emerald-600 text-white font-extrabold text-[11px] rounded-full flex items-center justify-center shadow-md">
                          {inCartQty}
                        </span>
                      )}
                      {isLowStock && (
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-amber-500 text-white rounded">
                          Stok {product.stock}
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="absolute inset-0 bg-black/60 text-white flex items-center justify-center text-xs font-bold">
                          Habis
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {product.unit}
                    </p>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(product.sellingPrice)}
                      </span>
                    </div>
                    <button
                      disabled={isOutOfStock}
                      className="p-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-colors"
                      title="Tambah ke Kasir"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: POS Cart, Customer Details, Payment Button */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col h-full">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Keranjang Kasir
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Kasir: {currentUser.name}
                  </p>
                </div>
              </div>

              {cartItems.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Reset
                </button>
              )}
            </div>

            {/* Customer input */}
            <div className="py-2.5 border-b border-slate-100 dark:border-slate-800">
              <label className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                Nama Pembeli (Opsional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Contoh: Pak Wahyu, Bu Siti RT 02"
                className="w-full mt-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Items List in Cart */}
            <div className="flex-1 overflow-y-auto py-2 space-y-2 min-h-[220px] max-h-[360px]">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <ShoppingBag className="w-8 h-8 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-medium">Keranjang kasir masih kosong</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Klik produk di sebelah kiri untuk menambahkan
                  </p>
                </div>
              ) : (
                cartItems.map(item => (
                  <div
                    key={item.productId}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {formatRupiah(item.price)} / {item.unit}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleUpdateQty(item.productId, -1)}
                        className="p-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(item.productId, 1)}
                        className="p-1 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-200 hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right shrink-0 min-w-[70px]">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatRupiah(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary & Pay CTA */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Total Barang:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {totalItemsCount} item
                  </span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-1">
                  <span>Total Tagihan:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatRupiah(totalAmount)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={cartItems.length === 0}
                  onClick={handleOpenCheckout}
                  className="col-span-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Banknote className="w-4 h-4" />
                  <span>Bayar Sekarang ({formatRupiah(totalAmount)})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout & Payment Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Proses Pembayaran Kasir
                </h3>
                <p className="text-[11px] text-slate-500">
                  Pelanggan: {customerName}
                </p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Amount to pay */}
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-center">
                <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                  Total Tagihan Belanja
                </p>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {formatRupiah(totalAmount)}
                </p>
              </div>

              {/* Payment Method Switcher */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pilih Metode Pembayaran:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPaymentMethod('tunai')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'tunai'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Banknote className="w-4 h-4" /> Tunai / Cash
                  </button>

                  <button
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'qris'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <QrCode className="w-4 h-4" /> QRIS Dinamis
                  </button>
                </div>
              </div>

              {/* If Tunai, show Quick Cash buttons and Kembalian */}
              {paymentMethod === 'tunai' && (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Uang Diterima dari Pembeli:
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {quickCashOptions.map((amount, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCashGiven(amount);
                          setCustomCashInput(String(amount));
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          cashGiven === amount
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {amount === totalAmount ? 'Uang Pas' : formatRupiah(amount)}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2">
                    <input
                      type="number"
                      value={customCashInput}
                      onChange={e => {
                        setCustomCashInput(e.target.value);
                        setCashGiven(Number(e.target.value) || 0);
                      }}
                      placeholder="Masukkan nominal custom..."
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Kembalian Box */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">Kembalian:</span>
                    <span className={`text-base font-bold ${cashGiven >= totalAmount ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                      {cashGiven >= totalAmount ? formatRupiah(cashChange) : 'Uang Kurang!'}
                    </span>
                  </div>
                </div>
              )}

              {/* If QRIS, show QR Code visual simulator */}
              {paymentMethod === 'qris' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Scan QRIS via BCA / Mandiri / GoPay / OVO / DANA
                  </p>
                  <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl border border-slate-300 shadow-sm flex items-center justify-center">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=WARUNGBERKAH-QRIS-PAYMENT"
                      alt="QRIS Warung Berkah"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    NMID: ID10202688990 • Nominal: {formatRupiah(totalAmount)}
                  </p>
                </div>
              )}
            </div>

            {/* Footer Process */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-2">
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleProcessOrder}
                disabled={paymentMethod === 'tunai' && cashGiven < totalAmount}
                className="flex-1 py-2.5 px-4 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Selesaikan Transaksi ({formatRupiah(totalAmount)})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification & Quick Bluetooth Print Toast */}
      {recentCompletedOrder && (
        <div className="fixed bottom-16 md:bottom-6 right-4 z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 max-w-sm flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold">Transaksi Berhasil Selesai!</p>
                <p className="text-[11px] text-slate-300">
                  {recentCompletedOrder.orderNumber} • {formatRupiah(recentCompletedOrder.totalAmount)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setRecentCompletedOrder(null)}
              className="text-slate-400 hover:text-white text-xs ml-2"
            >
              ✕
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                onOpenPrinterModal(recentCompletedOrder);
                setRecentCompletedOrder(null);
              }}
              className="flex-1 py-1.5 px-2 bg-teal-600 hover:bg-teal-500 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Struk Bluetooth</span>
            </button>
            <button
              onClick={() => setRecentCompletedOrder(null)}
              className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-300"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
