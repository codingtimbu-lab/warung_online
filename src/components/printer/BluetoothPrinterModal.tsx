import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Printer, 
  X, 
  Bluetooth, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Copy, 
  Share2, 
  Download,
  Sliders,
  Receipt
} from 'lucide-react';
import { formatRupiah, formatDateTime } from '../../utils/format';
import { Order } from '../../types';

interface BluetoothPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder?: Order | null;
}

export const BluetoothPrinterModal: React.FC<BluetoothPrinterModalProps> = ({
  isOpen,
  onClose,
  selectedOrder,
}) => {
  const { 
    bluetoothInfo, 
    connectBluetooth, 
    disconnectBluetooth, 
    setPaperWidth, 
    printReceipt,
    orders,
    currentUser 
  } = useApp();

  const [isConnecting, setIsConnecting] = useState(false);
  const [printStatus, setPrintStatus] = useState<{ message: string; success?: boolean } | null>(null);

  if (!isOpen) return null;

  // Use selectedOrder, or latest order, or fallback dummy preview
  const orderToPrint: Order = selectedOrder || orders[0] || {
    id: 'ord-preview',
    orderNumber: 'WRG-20260913-DEMO',
    type: 'pos',
    customerName: 'Pelanggan Tunai',
    items: [
      {
        productId: 'demo-1',
        productName: 'Beras Pandan Wangi 5kg',
        quantity: 1,
        price: 72500,
        costPrice: 64000,
        unit: 'karung',
        subtotal: 72500
      },
      {
        productId: 'demo-2',
        productName: 'Minyak Goreng Bimoli 2L',
        quantity: 1,
        price: 35500,
        costPrice: 31000,
        unit: 'pouch',
        subtotal: 35500
      }
    ],
    totalAmount: 108000,
    totalCost: 95000,
    paymentMethod: 'tunai',
    paymentStatus: 'paid',
    status: 'completed',
    cashReceived: 110000,
    cashChange: 2000,
    cashierName: currentUser.name,
    createdAt: new Date().toISOString(),
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setPrintStatus(null);
    try {
      const ok = await connectBluetooth();
      if (ok) {
        setPrintStatus({ success: true, message: 'Printer Bluetooth siap digunakan!' });
      }
    } catch {
      setPrintStatus({ success: false, message: 'Gagal menghubungkan Bluetooth.' });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleExecutePrint = async () => {
    const res = await printReceipt(orderToPrint);
    setPrintStatus(res);
    // Also trigger browser print if needed for physical hardware or saving as PDF
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Cetak Struk Bluetooth Thermal
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Integrasi Web Bluetooth ESC/POS & Mobile POS
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
        <div className="p-4 space-y-4">
          {/* Bluetooth Device Card */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Bluetooth className={`w-5 h-5 ${bluetoothInfo.connected ? 'text-teal-500 animate-pulse' : 'text-slate-400'}`} />
                <div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {bluetoothInfo.name}
                  </p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    {bluetoothInfo.connected ? (
                      <span className="text-teal-600 dark:text-teal-400 font-medium flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Terhubung (Siap Cetak)
                      </span>
                    ) : (
                      'Belum terhubung ke printer'
                    )}
                  </p>
                </div>
              </div>

              {bluetoothInfo.connected ? (
                <button
                  onClick={disconnectBluetooth}
                  className="px-2.5 py-1 text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-lg hover:bg-rose-100"
                >
                  Putus
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm flex items-center gap-1"
                >
                  {isConnecting ? 'Mencari...' : 'Hubungkan'}
                </button>
              )}
            </div>

            {/* Paper Size selector */}
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Lebar Kertas Thermal:</span>
              <div className="flex items-center gap-1">
                {(['58mm', '80mm'] as const).map(w => (
                  <button
                    key={w}
                    onClick={() => setPaperWidth(w)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                      bluetoothInfo.paperWidth === w
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {printStatus && (
            <div className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
              printStatus.success 
                ? 'bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-200' 
                : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
            }`}>
              {printStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{printStatus.message}</span>
            </div>
          )}

          {/* Thermal Receipt Visual Preview (Matches 58mm / 80mm standard) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1 font-medium">
                <Receipt className="w-3.5 h-3.5" /> Pratinjau Struk Thermal
              </span>
              <span className="text-[10px]">{orderToPrint.orderNumber}</span>
            </div>

            <div 
              id="printable-receipt" 
              className="bg-white text-slate-950 p-4 rounded-xl shadow-inner border border-dashed border-slate-300 font-mono text-[11px] leading-relaxed mx-auto max-w-[320px] transition-all"
            >
              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-slate-300 pb-2 mb-2">
                <h4 className="font-extrabold text-sm tracking-wide">WARUNG BERKAH SEMBAKO</h4>
                <p className="text-[10px] text-slate-600">Jl. Warga Sejahtera No. 88, RT 02/05</p>
                <p className="text-[10px] text-slate-600">Telp/WA: 0812-8888-1234</p>
              </div>

              {/* Order Meta */}
              <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-2 mb-2">
                <div className="flex justify-between">
                  <span>No. Struk:</span>
                  <span className="font-semibold">{orderToPrint.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal  :</span>
                  <span>{formatDateTime(orderToPrint.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir    :</span>
                  <span>{orderToPrint.cashierName || 'Kasir Warung'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="truncate max-w-[150px]">{orderToPrint.customerName}</span>
                </div>
              </div>

              {/* Item list */}
              <div className="space-y-1 border-b border-dashed border-slate-300 pb-2 mb-2">
                {orderToPrint.items.map((item, idx) => (
                  <div key={idx}>
                    <div className="font-semibold truncate">{item.productName}</div>
                    <div className="flex justify-between text-slate-700">
                      <span>{item.quantity} {item.unit} x {formatRupiah(item.price)}</span>
                      <span>{formatRupiah(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-0.5 border-b border-dashed border-slate-300 pb-2 mb-2 font-semibold">
                <div className="flex justify-between text-xs pt-0.5">
                  <span>TOTAL:</span>
                  <span className="font-extrabold">{formatRupiah(orderToPrint.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-700 font-normal">
                  <span>Metode:</span>
                  <span className="uppercase font-semibold">{orderToPrint.paymentMethod}</span>
                </div>
                {orderToPrint.cashReceived !== undefined && (
                  <>
                    <div className="flex justify-between text-[10px] text-slate-700 font-normal">
                      <span>Tunai Diterima:</span>
                      <span>{formatRupiah(orderToPrint.cashReceived)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-700 font-normal">
                      <span>Kembalian:</span>
                      <span>{formatRupiah(orderToPrint.cashChange || 0)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="text-center text-[9px] text-slate-500 pt-1 space-y-0.5">
                <p className="font-medium">*** TERIMA KASIH TELAH BERBELANJA ***</p>
                <p>Barang yang sudah dibeli tidak dapat ditukar</p>
                <p className="text-[8px] text-slate-400">Warung Berkah POS • Dicetak via Bluetooth ESC/POS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Simpan PDF</span>
          </button>

          <button
            onClick={handleExecutePrint}
            className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Struk Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
