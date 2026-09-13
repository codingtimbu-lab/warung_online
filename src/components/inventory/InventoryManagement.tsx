import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  ArrowUpDown, 
  RefreshCw, 
  Download, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Warehouse,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { formatRupiah } from '../../utils/format';
import { exportInventoryToExcel } from '../../utils/export';
import { Product, ProductCategory } from '../../types';

export const InventoryManagement: React.FC = () => {
  const { 
    products, 
    updateStock, 
    addProduct, 
    editProduct, 
    deleteProduct, 
    simulateWarehouseSync,
    currentUser 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out'>('all');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockItem, setRestockItem] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);
  const [isSyncing, setIsSyncing] = useState(false);

  // New product form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Beras & Biji' as ProductCategory,
    costPrice: 10000,
    sellingPrice: 13000,
    stock: 20,
    minStock: 5,
    unit: 'kg',
    description: '',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
    isAvailable: true,
  });

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

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === 'Semua' || p.category === categoryFilter;
    let matchStock = true;
    if (stockStatusFilter === 'low') matchStock = p.stock <= p.minStock && p.stock > 0;
    if (stockStatusFilter === 'out') matchStock = p.stock <= 0;
    return matchSearch && matchCat && matchStock;
  });

  const totalStockItems = products.reduce((acc, p) => acc + p.stock, 0);
  const totalAssetValue = products.reduce((acc, p) => acc + (p.stock * p.costPrice), 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      simulateWarehouseSync();
      setIsSyncing(false);
    }, 800);
  };

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct(formData);
    setIsAddModalOpen(false);
    // reset
    setFormData({
      name: '',
      sku: '',
      category: 'Beras & Biji',
      costPrice: 10000,
      sellingPrice: 13000,
      stock: 20,
      minStock: 5,
      unit: 'kg',
      description: '',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
      isAvailable: true,
    });
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      editProduct(editingProduct);
      setEditingProduct(null);
    }
  };

  const handleConfirmRestock = () => {
    if (restockItem && restockQty > 0) {
      updateStock(restockItem.id, restockItem.stock + restockQty);
      setRestockItem(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Jenis Produk</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {products.length} SKU
            </p>
            <span className="text-[11px] text-slate-400">Total unit: {totalStockItems} barang</span>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Nilai Aset Modal Stok</p>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {formatRupiah(totalAssetValue)}
            </p>
            <span className="text-[11px] text-slate-400">Dihitung dari harga modal</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>

        <div className={`p-4 rounded-2xl border shadow-sm flex items-center justify-between transition-colors ${
          lowStockCount > 0 
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60' 
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Peringatan Stok Menipis</p>
            <p className={`text-xl font-black mt-0.5 ${lowStockCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {lowStockCount} Produk
            </p>
            <span className="text-[11px] text-slate-400">Di bawah batas minimum</span>
          </div>
          <div className={`p-3 rounded-xl ${lowStockCount > 0 ? 'bg-rose-500/20 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Category, Status Filter, Sync, Add, Export */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari SKU atau nama sembako..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            {/* Warehouse Sync API */}
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap transition-colors"
              title="Tarik data otomatis dari API Gudang"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sync API Gudang'}</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={() => exportInventoryToExcel(products)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 whitespace-nowrap transition-colors"
              title="Download Data Stok dalam format Excel (.csv)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Excel</span>
            </button>

            {/* Add Product Button (Admin only) */}
            {currentUser.role === 'admin' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 whitespace-nowrap transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium mr-1">Status:</span>
            {[
              { id: 'all', label: 'Semua Stok' },
              { id: 'low', label: `Menipis (${lowStockCount})` },
              { id: 'out', label: 'Habis' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStockStatusFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  stockStatusFilter === tab.id
                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1" />

          {/* Categories */}
          <div className="flex space-x-1 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  categoryFilter === cat
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Table / Responsive Card View */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="p-3">Produk & SKU</th>
                <th className="p-3">Kategori</th>
                <th className="p-3 text-right">Modal</th>
                <th className="p-3 text-right">Harga Jual</th>
                <th className="p-3 text-center">Stok</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ada produk yang cocok dengan pencarian filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock > 0 && product.stock <= product.minStock;
                  const profitMargin = Math.round(((product.sellingPrice - product.costPrice) / product.costPrice) * 100);

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white leading-tight">
                              {product.name}
                            </p>
                            <span className="font-mono text-[10px] text-slate-400">
                              {product.sku} • {product.unit}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 text-slate-600 dark:text-slate-300">
                        {product.category}
                      </td>

                      <td className="p-3 text-right text-slate-600 dark:text-slate-400 font-mono">
                        {formatRupiah(product.costPrice)}
                      </td>

                      <td className="p-3 text-right font-mono">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatRupiah(product.sellingPrice)}
                        </span>
                        <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          +{profitMargin}% margin
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => updateStock(product.id, product.stock - 1)}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold"
                            title="Kurang 1"
                          >
                            -
                          </button>
                          <span className="font-black text-sm w-7 text-center text-slate-900 dark:text-white font-mono">
                            {product.stock}
                          </span>
                          <button
                            onClick={() => updateStock(product.id, product.stock + 1)}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold"
                            title="Tambah 1"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            Habis
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Menipis
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            Aman
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setRestockItem(product);
                              setRestockQty(10);
                            }}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                            title="Restock Cepat Barang"
                          >
                            <Plus className="w-3 h-3" /> Restock
                          </button>

                          {currentUser.role === 'admin' && (
                            <>
                              <button
                                onClick={() => setEditingProduct(product)}
                                className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Edit Detail"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Hapus ${product.name} dari inventaris?`)) {
                                    deleteProduct(product.id);
                                  }
                                }}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                title="Hapus Produk"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Quick Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 p-4 shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Restock Tambahan: {restockItem.name}
            </h3>
            <p className="text-xs text-slate-500">
              Stok saat ini: <span className="font-bold">{restockItem.stock} {restockItem.unit}</span>
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Jumlah Tambahan Masuk:
              </label>
              <input
                type="number"
                min={1}
                value={restockQty}
                onChange={e => setRestockQty(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRestockItem(null)}
                className="flex-1 py-2 text-xs font-semibold border rounded-xl text-slate-600 dark:text-slate-300"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmRestock}
                className="flex-1 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
              >
                Konfirmasi Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Modal (Admin) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 my-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Tambah Produk Sembako Baru
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSaveNewProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nama Produk:</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Beras Rojo Lele 5kg"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">SKU / Barcode:</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="BRS-RL-05"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Kategori:</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  >
                    {categories.filter(c => c !== 'Semua').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Harga Modal (Rp):</label>
                  <input
                    type="number"
                    required
                    value={formData.costPrice}
                    onChange={e => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Harga Jual (Rp):</label>
                  <input
                    type="number"
                    required
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Stok Awal:</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Batas Min:</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={e => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Satuan:</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="kg / pouch"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">URL Foto Produk:</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Deskripsi Singkat:</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Keterangan mutu atau berat bersih produk..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 font-semibold border rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Edit Data: {editingProduct.name}
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nama Produk:</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Harga Modal (Rp):</label>
                  <input
                    type="number"
                    value={editingProduct.costPrice}
                    onChange={e => setEditingProduct({ ...editingProduct, costPrice: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Harga Jual (Rp):</label>
                  <input
                    type="number"
                    value={editingProduct.sellingPrice}
                    onChange={e => setEditingProduct({ ...editingProduct, sellingPrice: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Stok:</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Batas Minimum Peringatan:</label>
                  <input
                    type="number"
                    value={editingProduct.minStock}
                    onChange={e => setEditingProduct({ ...editingProduct, minStock: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2 font-semibold border rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
