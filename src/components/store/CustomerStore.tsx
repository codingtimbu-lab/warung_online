import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Filter, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Phone, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Sparkles,
  SlidersHorizontal,
  X,
  ArrowRight
} from 'lucide-react';
import { formatRupiah } from '../../utils/format';
import { Product, PaymentMethod } from '../../types';

export const CustomerStore: React.FC = () => {
  const { 
    products, 
    currentUser, 
    cart, 
    addToCart, 
    updateCartItemQty, 
    removeFromCart, 
    clearCart, 
    createOrder,
    setActiveTab 
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(100000);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Cart & Checkout state
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState(currentUser.name || 'Ibu Ratna (Warga RT 04)');
  const [customerPhone, setCustomerPhone] = useState(currentUser.phone || '0813-9988-7766');
  const [customerAddress, setCustomerAddress] = useState('Jl. Melati No. 12 RT 04/RW 02 (Pagar Hitam)');
  const [deliveryNotes, setDeliveryNotes] = useState('Tolong taruh di teras ya, terima kasih.');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');
  const [lastPlacedOrder, setLastPlacedOrder] = useState<any | null>(null);

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

  // Filter & sort products
  const filteredProducts = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchPrice = p.sellingPrice <= maxPriceFilter;
      return matchSearch && matchCat && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
      if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const cartTotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const newOrder = await createOrder({
      type: 'online',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      notes: deliveryNotes.trim(),
      items: cart,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'unpaid' : 'paid',
      status: 'pending',
    });

    setLastPlacedOrder(newOrder);
    clearCart();
    setIsCheckoutModalOpen(false);
    setIsCartDrawerOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Hero Welcome Banner for Citizens */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 sm:p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold tracking-wide uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Pemesanan Sembako Online Warga</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            Belanja Kebutuhan Dapur & Rumah Tangga Praktis
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1.5 leading-relaxed">
            Pesan sembako segar dari rumah, harga warung bersahabat. Gratis ongkir khusus warga RT 01 - RT 05 diantar langsung sampai depan teras!
          </p>
        </div>
      </div>

      {/* Search, Filter Bar & Sort */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari beras, minyak goreng, telur, mi instan, bumbu..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="default">Urutkan: Rekomendasi</option>
              <option value="price-asc">Harga: Termurah</option>
              <option value="price-desc">Harga: Termahal</option>
              <option value="name">Nama: A - Z</option>
            </select>

            {/* Filter Drawer Toggle */}
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors ${
                showFilterDrawer || maxPriceFilter < 100000
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter Harga</span>
              {maxPriceFilter < 100000 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Price Range Filter */}
        {showFilterDrawer && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex-1 max-w-md">
              <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Maksimal Harga:</span>
                <span className="text-emerald-600 font-bold">{formatRupiah(maxPriceFilter)}</span>
              </div>
              <input
                type="range"
                min={5000}
                max={100000}
                step={5000}
                value={maxPriceFilter}
                onChange={e => setMaxPriceFilter(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>Rp 5.000</span>
                <span>Rp 50.000</span>
                <span>Rp 100.000+</span>
              </div>
            </div>

            <button
              onClick={() => setMaxPriceFilter(100000)}
              className="text-xs text-slate-500 hover:text-rose-600 self-end sm:self-center font-medium"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Category Chips */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filteredProducts.map(product => {
          const isOutOfStock = product.stock <= 0;
          const cartItem = cart.find(i => i.productId === product.id);

          return (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  {isOutOfStock ? (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                      <span className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded-full">
                        Stok Habis
                      </span>
                    </div>
                  ) : (
                    <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 rounded-lg shadow-sm">
                      Sisa: {product.stock} {product.unit}
                    </span>
                  )}
                </div>

                <div className="p-3">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              <div className="p-3 pt-0">
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {formatRupiah(product.sellingPrice)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      per {product.unit}
                    </span>
                  </div>

                  {cartItem ? (
                    <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 p-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <button
                        onClick={() => updateCartItemQty(product.id, cartItem.quantity - 1)}
                        className="p-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 w-5 text-center">
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItemQty(product.id, cartItem.quantity + 1)}
                        disabled={cartItem.quantity >= product.stock}
                        className="p-1 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Beli</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Cart Button for Mobile & Desktop */}
      {cart.length > 0 && (
        <div className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-lg">
          <div className="bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-sm shadow-md">
                {cartItemCount}
              </div>
              <div>
                <p className="text-xs text-slate-300">Total Keranjang Sembako:</p>
                <p className="text-sm sm:text-base font-extrabold text-white">
                  {formatRupiah(cartTotal)}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <span>Checkout Pesanan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Konfirmasi Pesanan Sembako Warga
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Gratis ongkir wilayah warga RT 01-05
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Order Summary Items */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Rincian Barang ({cartItemCount} item):
                </span>
                <div className="max-h-32 overflow-y-auto space-y-1.5 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  {cart.map(item => (
                    <div key={item.productId} className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                      <span className="truncate max-w-[200px]">{item.productName} x {item.quantity}</span>
                      <span className="font-semibold">{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery info */}
              <div className="space-y-2.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nama Penerima & No. RT/RW:</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Contoh: Ibu Ratna (RT 04 / RW 02)"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nomor WhatsApp (Untuk Konfirmasi):</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Alamat Lengkap & Patokan Rumah:
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    placeholder="Jl. Melati No. 12 (Depan Pos Ronda, Pagar Hitam)..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Catatan Pengantaran (Opsional):
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={e => setDeliveryNotes(e.target.value)}
                    placeholder="Contoh: Taruh di teras saja, tolong kemas rapi..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Payment selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Metode Pembayaran:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'qris' as PaymentMethod, label: 'QRIS', icon: QrCode },
                    { id: 'cod' as PaymentMethod, label: 'Bayar di Tempat (COD)', icon: Banknote },
                    { id: 'transfer' as PaymentMethod, label: 'Transfer Bank', icon: CreditCard },
                  ].map(m => {
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                          paymentMethod === m.id
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px] leading-tight">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* QRIS / Transfer details */}
              {paymentMethod === 'qris' && (
                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center space-y-1.5">
                  <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                    Scan QRIS Warung Berkah
                  </p>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=WARUNGBERKAH-QRIS-ORDER"
                    alt="QRIS"
                    className="w-28 h-28 mx-auto bg-white p-1 rounded-lg shadow-sm"
                  />
                  <p className="text-[10px] text-slate-500">
                    Bisa dibayar dengan BCA, Mandiri, GoPay, OVO, ShopeePay, DANA
                  </p>
                </div>
              )}

              {/* Total Summary */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal Belanja:</span>
                  <span>{formatRupiah(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Ongkos Kirim Warga:</span>
                  <span>GRATIS (Rp 0)</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 dark:text-white pt-1">
                  <span>Total Pembayaran:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                    {formatRupiah(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Kembali Belanja
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kirim Pesanan Sekarang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Placed Success Confirmation Banner */}
      {lastPlacedOrder && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Pesanan Berhasil Dikirim ke Warung Berkah!
              </h4>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                Nomor Pesanan: <span className="font-mono font-bold">{lastPlacedOrder.orderNumber}</span> • Status: Menunggu Konfirmasi Warung
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
            >
              Lacak Pesanan Saya
            </button>
            <button
              onClick={() => setLastPlacedOrder(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
