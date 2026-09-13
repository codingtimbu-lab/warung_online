import { Order, Product } from '../types';
import { formatRupiah, formatDateTime } from './format';

// Export orders data to Excel-compatible CSV file
export function exportOrdersToExcel(orders: Order[], filename = 'Laporan_Penjualan_Warung.csv') {
  const headers = [
    'No Pesanan',
    'Tanggal & Waktu',
    'Tipe Transaksi',
    'Pelanggan',
    'Kasir',
    'Daftar Produk & Jumlah',
    'Metode Pembayaran',
    'Status Pembayaran',
    'Status Pesanan',
    'Total Omset (Rp)',
    'Total Modal (Rp)',
    'Estimasi Laba Bersih (Rp)'
  ];

  const rows = orders.map(order => {
    const itemsDetail = order.items
      .map(i => `${i.productName} (${i.quantity} ${i.unit})`)
      .join('; ');

    const profit = order.totalAmount - order.totalCost;

    return [
      `"${order.orderNumber}"`,
      `"${formatDateTime(order.createdAt)}"`,
      `"${order.type === 'pos' ? 'Kasir Warung (Offline/Langsung)' : 'Pesanan Online Warga'}"`,
      `"${order.customerName}"`,
      `"${order.cashierName || '-'}"`,
      `"${itemsDetail}"`,
      `"${order.paymentMethod.toUpperCase()}"`,
      `"${order.paymentStatus === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}"`,
      `"${order.status.toUpperCase()}"`,
      order.totalAmount,
      order.totalCost,
      profit
    ].join(',');
  });

  // Include UTF-8 BOM so Excel opens accents and symbols correctly
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export inventory stock to Excel CSV
export function exportInventoryToExcel(products: Product[], filename = 'Data_Inventaris_Stok_Warung.csv') {
  const headers = [
    'SKU',
    'Nama Produk',
    'Kategori',
    'Satuan',
    'Stok Saat Ini',
    'Batas Min. Stok',
    'Status Stok',
    'Harga Modal (Rp)',
    'Harga Jual (Rp)',
    'Estimasi Nilai Stok (Rp)'
  ];

  const rows = products.map(p => {
    const stockStatus = p.stock <= 0 ? 'HABIS' : p.stock <= p.minStock ? 'KRITIS/MENIPIS' : 'AMAN';
    const totalAssetVal = p.stock * p.costPrice;

    return [
      `"${p.sku}"`,
      `"${p.name}"`,
      `"${p.category}"`,
      `"${p.unit}"`,
      p.stock,
      p.minStock,
      `"${stockStatus}"`,
      p.costPrice,
      p.sellingPrice,
      totalAssetVal
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Print / save PDF report
export function triggerPrintReport() {
  window.print();
}
