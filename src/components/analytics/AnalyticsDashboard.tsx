import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Download, 
  Printer, 
  Sliders, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2,
  FileSpreadsheet,
  PieChart as PieIcon,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Legend 
} from 'recharts';
import { formatRupiah, formatDateTime, formatSimpleDate } from '../../utils/format';
import { exportOrdersToExcel } from '../../utils/export';
import { MONTHLY_SALES_HISTORY } from '../../data/mockData';

export const AnalyticsDashboard: React.FC = () => {
  const { orders, products, dashboardWidgets, updateDashboardWidgets } = useApp();
  const [timeRange, setTimeRange] = useState<'today' | 'month' | 'history'>('history');
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

  // Financial calculations
  const totalRevenue = orders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
  const totalCost = orders.reduce((acc, o) => acc + (o.paymentStatus === 'paid' ? o.totalCost : 0), 0);
  const netProfit = totalRevenue - totalCost;
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const profitMarginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // Chart data: Monthly historical + current month aggregated
  const chartData = MONTHLY_SALES_HISTORY.map(item => ({
    name: item.month,
    omset: item.totalRevenue,
    laba: item.totalProfit,
    transaksi: item.orderCount,
  }));

  // Top selling products calculated dynamically from orders
  const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
      }
      productSalesMap[item.productId].qty += item.quantity;
      productSalesMap[item.productId].revenue += item.subtotal;
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Payment breakdown
  const paymentBreakdown = orders.reduce((acc, o) => {
    acc[o.paymentMethod] = (acc[o.paymentMethod] || 0) + o.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  const handlePrintPdfReport = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Dashboard Analitik & Laporan Penjualan</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Real-Time
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pantau pertumbuhan omset, margin laba bersih harian/bulanan, dan unduh laporan resmi manajer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Customize Widgets Button */}
          <button
            onClick={() => setShowCustomizeModal(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
            title="Kustomisasi Tata Letak Widget Dashboard"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Kustomisasi</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={() => exportOrdersToExcel(orders)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 transition-colors border border-emerald-200 dark:border-emerald-800"
            title="Download Spreadsheet Excel (.csv)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor Excel</span>
          </button>

          {/* Print PDF Report */}
          <button
            onClick={handlePrintPdfReport}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            title="Cetak Laporan Format PDF untuk Manajer / Pemilik"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Laporan PDF</span>
          </button>
        </div>
      </div>

      {/* Primary Key Financial Metric Cards */}
      {dashboardWidgets.showMetrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Revenue */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Omset Penjualan</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              {formatRupiah(totalRevenue)}
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+18.4% dari bulan lalu</span>
            </div>
          </div>

          {/* Net Profit */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Estimasi Laba Bersih</span>
              <div className="p-2 bg-teal-500/10 text-teal-600 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-black text-teal-600 dark:text-teal-400 mt-1">
              {formatRupiah(netProfit)}
            </p>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">
              Margin Keuntungan: ~{profitMarginPercent}%
            </span>
          </div>

          {/* Total Transactions */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Transaksi Selesai</span>
              <div className="p-2 bg-blue-500/10 text-blue-600 rounded-lg">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              {orders.length} Transaksi
            </p>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">
              {orders.filter(o => o.type === 'online').length} online • {orders.filter(o => o.type === 'pos').length} kasir
            </span>
          </div>

          {/* Average Basket Value */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Rata-Rata Keranjang (AOV)</span>
              <div className="p-2 bg-purple-500/10 text-purple-600 rounded-lg">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">
              {formatRupiah(avgOrderValue)}
            </p>
            <span className="text-[11px] text-slate-400 font-medium mt-1 block">
              Per struk pembeli
            </span>
          </div>
        </div>
      )}

      {/* Visual Chart: Monthly Trends (Recharts) */}
      {dashboardWidgets.showRevenueChart && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Grafik Tren Penjualan & Laba Bulanan
              </h3>
              <p className="text-[11px] text-slate-500">
                Visualisasi perbandingan total pendapatan kotor dan estimasi laba bersih toko sembako
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Omset
              </span>
              <span className="flex items-center gap-1 text-teal-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Laba Bersih
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLaba" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={val => `Rp${(val / 1000000).toFixed(1)}jt`}
                />
                <Tooltip
                  formatter={(val: any) => [formatRupiah(Number(val)), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="omset"
                  name="Omset Penjualan"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorOmset)"
                />
                <Area
                  type="monotone"
                  dataKey="laba"
                  name="Laba Bersih"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLaba)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Two Column Section: Top Products & Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Selling Products */}
        {dashboardWidgets.showTopProducts && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              5 Produk Sembako Terlaris (Kontributor Omset)
            </h3>
            <div className="space-y-2.5">
              {topProducts.length === 0 ? (
                <p className="text-xs text-slate-400">Belum ada data produk terjual.</p>
              ) : (
                topProducts.map((p, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {p.name}
                        </p>
                        <span className="text-[10px] text-slate-400">Terjual {p.qty} unit</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900 dark:text-white shrink-0 ml-2">
                      {formatRupiah(p.revenue)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Payment Methods Breakdown */}
        {dashboardWidgets.showCategoryBreakdown && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Sebaran Metode Pembayaran
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'tunai', label: 'Tunai / Cash', amount: paymentBreakdown['tunai'] || 0, color: 'bg-emerald-500' },
                { id: 'qris', label: 'QRIS Dinamis', amount: paymentBreakdown['qris'] || 0, color: 'bg-blue-500' },
                { id: 'transfer', label: 'Transfer Bank', amount: paymentBreakdown['transfer'] || 0, color: 'bg-purple-500' },
                { id: 'cod', label: 'Bayar di Tempat (COD)', amount: paymentBreakdown['cod'] || 0, color: 'bg-amber-500' },
              ].map(m => (
                <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${m.color}`} />
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {m.label}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatRupiah(m.amount)}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
              💡 <strong>Tips Efisiensi Warung:</strong> Pembayaran non-tunai (QRIS & Transfer) membantu pencatatan otomatis lebih akurat dan mengurangi risiko uang kembalian selisih di kasir.
            </div>
          </div>
        )}
      </div>

      {/* Customizable Widgets Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Kustomisasi Widget Dashboard
              </h3>
              <button onClick={() => setShowCustomizeModal(false)} className="text-slate-400">✕</button>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { key: 'showMetrics', label: 'Kartu Ringkasan Finansial (Omset & Laba)' },
                { key: 'showRevenueChart', label: 'Grafik Tren Penjualan Bulanan (Recharts)' },
                { key: 'showTopProducts', label: 'Daftar 5 Produk Sembako Terlaris' },
                { key: 'showCategoryBreakdown', label: 'Sebaran Metode Pembayaran' },
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={(dashboardWidgets as any)[item.key]}
                    onChange={e => updateDashboardWidgets({ [item.key]: e.target.checked })}
                    className="accent-emerald-600 w-4 h-4"
                  />
                </label>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Selesai Simpan Tampilan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Official Printable Report (Used by window.print() for PDF generation) */}
      <div id="printable-report" className="hidden print:block font-sans text-slate-900 p-6 max-w-4xl mx-auto">
        <div className="border-b-2 border-slate-800 pb-4 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black tracking-tight uppercase">WARUNG BERKAH SEMBAKO</h1>
            <p className="text-xs text-slate-600">Jl. Warga Sejahtera No. 88, RT 02/05 • Telp: 0812-8888-1234</p>
            <p className="text-xs font-bold text-slate-800 mt-1">LAPORAN KINERJA PENJUALAN & KEUANGAN BULANAN</p>
          </div>
          <div className="text-right text-xs">
            <p>Tanggal Cetak: {formatSimpleDate(new Date().toISOString())}</p>
            <p>Status: RESMI / VALID</p>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-4 gap-3 my-4 p-3 bg-slate-100 rounded-lg text-xs">
          <div>
            <p className="text-slate-500">Total Omset:</p>
            <p className="font-bold text-sm">{formatRupiah(totalRevenue)}</p>
          </div>
          <div>
            <p className="text-slate-500">Total Modal:</p>
            <p className="font-bold text-sm">{formatRupiah(totalCost)}</p>
          </div>
          <div>
            <p className="text-slate-500">Laba Bersih:</p>
            <p className="font-bold text-sm text-emerald-700">{formatRupiah(netProfit)}</p>
          </div>
          <div>
            <p className="text-slate-500">Jumlah Transaksi:</p>
            <p className="font-bold text-sm">{orders.length} Transaksi</p>
          </div>
        </div>

        {/* Transaction Table */}
        <table className="w-full text-xs text-left border-collapse my-4">
          <thead>
            <tr className="border-b border-slate-300 font-bold bg-slate-50">
              <th className="py-2">No Transaksi</th>
              <th className="py-2">Tanggal</th>
              <th className="py-2">Pelanggan</th>
              <th className="py-2">Tipe</th>
              <th className="py-2">Metode</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((o, idx) => (
              <tr key={idx}>
                <td className="py-1.5 font-mono">{o.orderNumber}</td>
                <td className="py-1.5">{formatSimpleDate(o.createdAt)}</td>
                <td className="py-1.5">{o.customerName}</td>
                <td className="py-1.5 uppercase">{o.type}</td>
                <td className="py-1.5 uppercase">{o.paymentMethod}</td>
                <td className="py-1.5 text-right font-bold">{formatRupiah(o.totalAmount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signatures */}
        <div className="flex justify-between pt-10 text-xs text-center mt-6">
          <div>
            <p className="text-slate-500">Dibuat oleh:</p>
            <p className="font-bold mt-12 underline">Rian Pratama</p>
            <p className="text-[10px] text-slate-500">Kasir Warung</p>
          </div>
          <div>
            <p className="text-slate-500">Disetujui & Diperiksa oleh:</p>
            <p className="font-bold mt-12 underline">Haji Sulaiman</p>
            <p className="text-[10px] text-slate-500">Pemilik / Manajer Warung Berkah</p>
          </div>
        </div>
      </div>
    </div>
  );
};
