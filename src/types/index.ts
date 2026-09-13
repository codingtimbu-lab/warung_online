export type UserRole = 'admin' | 'cashier' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
}

export type ProductCategory = 
  | 'Beras & Biji'
  | 'Minyak & Bumbu'
  | 'Telur & Olahan'
  | 'Mi & Instan'
  | 'Gula & Tepung'
  | 'Minuman & Kopi'
  | 'Sabun & Rumah';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  costPrice: number;       // Harga modal
  sellingPrice: number;    // Harga jual
  stock: number;
  minStock: number;       // Batas peringatan stok menipis
  unit: string;           // kg, liter, bks, karton, dll
  image: string;
  description: string;
  isAvailable: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  costPrice: number;
  unit: string;
  subtotal: number;
}

export type OrderStatus = 
  | 'pending'       // Menunggu Konfirmasi
  | 'processing'    // Sedang Disiapkan
  | 'ready'         // Siap Diambil / Diantar
  | 'delivered'     // Sedang Diantar
  | 'completed'     // Selesai
  | 'cancelled';    // Dibatalkan

export type PaymentMethod = 'tunai' | 'qris' | 'transfer' | 'cod';
export type PaymentStatus = 'paid' | 'unpaid';
export type OrderType = 'pos' | 'online';

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: OrderItem[];
  totalAmount: number;
  totalCost: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  cashReceived?: number;
  cashChange?: number;
  cashierName?: string;
  notes?: string;
  createdAt: string;
  isOfflineSync?: boolean;
  printedViaBluetooth?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'system' | 'sync';
  timestamp: string;
  read: boolean;
  orderId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'admin' | 'bot';
  senderName: string;
  text: string;
  timestamp: string;
  language?: 'id' | 'en' | 'jw';
}

export interface BluetoothDeviceInfo {
  name: string;
  id: string;
  connected: boolean;
  batteryLevel?: number;
  paperWidth: '58mm' | '80mm';
}

export interface DashboardWidgetConfig {
  showMetrics: boolean;
  showRevenueChart: boolean;
  showTopProducts: boolean;
  showLowStockAlert: boolean;
  showRecentOrders: boolean;
  showCategoryBreakdown: boolean;
}

export interface SalesReportFilter {
  startDate: string;
  endDate: string;
  orderType: 'all' | 'pos' | 'online';
  paymentMethod: 'all' | PaymentMethod;
}
