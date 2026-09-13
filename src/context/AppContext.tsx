import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  User, 
  Product, 
  Order, 
  AppNotification, 
  ChatMessage, 
  OrderItem, 
  OrderStatus, 
  BluetoothDeviceInfo,
  DashboardWidgetConfig
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_CHAT_MESSAGES 
} from '../data/mockData';
import { soundEffects } from '../utils/audio';
import { bluetoothManager } from '../utils/bluetooth';

interface AppContextType {
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  
  products: Product[];
  orders: Order[];
  notifications: AppNotification[];
  chatMessages: ChatMessage[];
  
  isOffline: boolean;
  toggleOfflineMode: () => void;
  offlineQueueCount: number;
  syncOfflineData: () => void;

  darkMode: boolean;
  toggleDarkMode: () => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Cart for online citizen order or cashier quick buffer
  cart: OrderItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartItemQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Orders
  createOrder: (orderData: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  // Inventory
  updateStock: (productId: string, newStock: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  editProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  // Bluetooth Printer
  bluetoothInfo: BluetoothDeviceInfo;
  connectBluetooth: () => Promise<boolean>;
  disconnectBluetooth: () => void;
  setPaperWidth: (width: '58mm' | '80mm') => void;
  printReceipt: (order: Order) => Promise<{ success: boolean; message: string }>;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  unreadNotifsCount: number;

  // Chat
  sendChatMessage: (text: string, lang?: 'id' | 'en' | 'jw') => void;
  chatLanguage: 'id' | 'en' | 'jw';
  setChatLanguage: (lang: 'id' | 'en' | 'jw') => void;

  // Dashboard customization
  dashboardWidgets: DashboardWidgetConfig;
  updateDashboardWidgets: (widgets: Partial<DashboardWidgetConfig>) => void;

  // API Integration / Warehouse Sync simulation
  simulateWarehouseSync: () => void;
  simulateIncomingEcommerceOrder: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user state
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('warung_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_USERS[0]; // Admin by default
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('warung_products');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('warung_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_ORDERS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('warung_notifs');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('warung_chat');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_CHAT_MESSAGES;
  });

  const [cart, setCart] = useState<OrderItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('pos');
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    const saved = localStorage.getItem('warung_offline_queue');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [];
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('warung_dark_mode') === 'true';
  });

  const [chatLanguage, setChatLanguage] = useState<'id' | 'en' | 'jw'>('id');

  const [bluetoothInfo, setBluetoothInfo] = useState<BluetoothDeviceInfo>({
    name: 'Thermal POS-58mm (Belum Terhubung)',
    id: '',
    connected: false,
    paperWidth: '58mm',
    batteryLevel: 85,
  });

  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidgetConfig>({
    showMetrics: true,
    showRevenueChart: true,
    showTopProducts: true,
    showLowStockAlert: true,
    showRecentOrders: true,
    showCategoryBreakdown: true,
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('warung_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('warung_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('warung_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('warung_notifs', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('warung_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('warung_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  useEffect(() => {
    localStorage.setItem('warung_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Switch role / user
  const switchUser = (userId: string) => {
    const target = INITIAL_USERS.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      // Auto adjust appropriate active tab
      if (target.role === 'customer') {
        setActiveTab('store');
      } else if (target.role === 'cashier') {
        setActiveTab('pos');
      } else {
        setActiveTab('analytics');
      }
    }
  };

  // Add notification helper
  const addNotification = useCallback((title: string, message: string, type: 'order' | 'stock' | 'system' | 'sync', orderId?: string) => {
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      orderId,
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (type === 'order') {
      soundEffects.playOrderChime();
    } else if (type === 'stock') {
      soundEffects.playWarningTone();
    }
  }, []);

  // Offline Mode toggle
  const toggleOfflineMode = () => {
    const newOffline = !isOffline;
    setIsOffline(newOffline);
    if (!newOffline && offlineQueue.length > 0) {
      // Reconnected! Auto sync
      syncOfflineData();
    } else if (newOffline) {
      addNotification(
        '📵 Mode Offline Aktif',
        'Aplikasi beralih ke penyimpanan lokal. Transaksi kasir tetap berjalan lancar dan akan diantrekan.',
        'system'
      );
    }
  };

  const syncOfflineData = () => {
    if (offlineQueue.length === 0) return;
    const count = offlineQueue.length;
    setOfflineQueue([]);
    addNotification(
      '✅ Sinkronisasi Offline Sukses',
      `Berhasil mensinkronkan ${count} antrean transaksi offline ke database pusat warung!`,
      'sync'
    );
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    soundEffects.playBeep();
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * item.price }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        price: product.sellingPrice,
        costPrice: product.costPrice,
        unit: product.unit,
        subtotal: quantity * product.sellingPrice
      }];
    });
  };

  const updateCartItemQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.productId === productId 
        ? { ...item, quantity, subtotal: quantity * item.price }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  // Stock management
  const updateStock = (productId: string, newStock: number) => {
    setProducts(prev => {
      return prev.map(p => {
        if (p.id === productId) {
          const updated = { ...p, stock: Math.max(0, newStock) };
          // Check for low stock alert
          if (updated.stock <= updated.minStock) {
            addNotification(
              '⚠️ Stok Menipis!',
              `Produk "${p.name}" tersisa ${updated.stock} ${p.unit}. Batas minimum: ${p.minStock}.`,
              'stock'
            );
          }
          return updated;
        }
        return p;
      });
    });
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
    };
    setProducts(prev => [newProduct, ...prev]);
    addNotification(
      '📦 Produk Baru Ditambahkan',
      `Produk "${newProduct.name}" berhasil masuk ke sistem katalog & inventaris.`,
      'system'
    );
  };

  const editProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const deleteProduct = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    if (prod) {
      addNotification('🗑️ Produk Dihapus', `Produk "${prod.name}" telah dihapus dari inventaris.`, 'system');
    }
  };

  // Order creation
  const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
    const orderNumber = 'WRG-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
    const totalCost = (orderData.items || []).reduce((acc, it) => acc + (it.costPrice * it.quantity), 0);
    const totalAmount = (orderData.items || []).reduce((acc, it) => acc + it.subtotal, 0);

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber,
      type: orderData.type || 'pos',
      customerName: orderData.customerName || 'Pelanggan Langsung',
      customerPhone: orderData.customerPhone,
      customerAddress: orderData.customerAddress,
      items: orderData.items || [],
      totalAmount,
      totalCost,
      paymentMethod: orderData.paymentMethod || 'tunai',
      paymentStatus: orderData.paymentStatus || (orderData.paymentMethod === 'cod' ? 'unpaid' : 'paid'),
      status: orderData.status || (orderData.type === 'pos' ? 'completed' : 'pending'),
      cashReceived: orderData.cashReceived,
      cashChange: orderData.cashChange,
      cashierName: currentUser.role === 'customer' ? 'Sistem Pesanan Warga' : currentUser.name,
      notes: orderData.notes,
      createdAt: new Date().toISOString(),
      isOfflineSync: isOffline,
    };

    // Deduct stock for each item
    setProducts(prev => {
      return prev.map(p => {
        const item = newOrder.items.find(it => it.productId === p.id);
        if (item) {
          const updatedStock = Math.max(0, p.stock - item.quantity);
          if (updatedStock <= p.minStock) {
            // Trigger low-stock push notification
            setTimeout(() => {
              addNotification(
                '⚠️ Peringatan Stok Menipis!',
                `Stok "${p.name}" tersisa ${updatedStock} ${p.unit} setelah transaksi #${orderNumber}!`,
                'stock'
              );
            }, 300);
          }
          return { ...p, stock: updatedStock };
        }
        return p;
      });
    });

    if (isOffline) {
      setOfflineQueue(prev => [...prev, { type: 'order', data: newOrder, timestamp: new Date().toISOString() }]);
      addNotification(
        '💾 Transaksi Disimpan Offline',
        `Pesanan #${orderNumber} disimpan dalam cache lokal perangkat.`,
        'system'
      );
    } else {
      addNotification(
        newOrder.type === 'online' ? '🛍️ Pesanan Online Warga Baru!' : '🧾 Transaksi Kasir Selesai',
        `#${newOrder.orderNumber} oleh ${newOrder.customerName} - Total: Rp ${totalAmount.toLocaleString('id-ID')}`,
        'order',
        newOrder.id
      );
    }

    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated = { 
          ...o, 
          status, 
          paymentStatus: status === 'completed' ? ('paid' as const) : o.paymentStatus 
        };
        const statusMap: Record<OrderStatus, string> = {
          pending: 'Menunggu Konfirmasi',
          processing: 'Sedang Disiapkan Warung',
          ready: 'Siap Diambil / Diantar',
          delivered: 'Sedang Diantar ke Alamat Warga',
          completed: 'Selesai & Diterima',
          cancelled: 'Dibatalkan'
        };
        addNotification(
          '🔔 Status Pesanan Berubah',
          `Pesanan #${o.orderNumber} kini berstatus: "${statusMap[status]}"`,
          'order',
          o.id
        );
        return updated;
      }
      return o;
    }));
  };

  // Bluetooth printer handlers
  const connectBluetooth = async () => {
    const res = await bluetoothManager.connectPrinter();
    if (res.success && res.printer) {
      setBluetoothInfo(prev => ({
        ...prev,
        name: res.printer?.name || 'Thermal POS-58mm',
        id: res.printer?.id || 'BT-58',
        connected: true,
      }));
      addNotification('🖨️ Printer Bluetooth Terhubung', res.message, 'system');
      return true;
    }
    return false;
  };

  const disconnectBluetooth = () => {
    bluetoothManager.disconnect();
    setBluetoothInfo(prev => ({
      ...prev,
      name: 'Thermal POS-58mm (Belum Terhubung)',
      id: '',
      connected: false,
    }));
  };

  const setPaperWidth = (paperWidth: '58mm' | '80mm') => {
    setBluetoothInfo(prev => ({ ...prev, paperWidth }));
  };

  const printReceipt = async (order: Order) => {
    const res = await bluetoothManager.printOrderReceipt(order);
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, printedViaBluetooth: true } : o));
    return res;
  };

  // Notification handlers
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  // Multilingual Live Chat Support
  const sendChatMessage = (text: string, lang = chatLanguage) => {
    const userMsg: ChatMessage = {
      id: 'chat-' + Date.now(),
      sender: currentUser.role === 'customer' ? 'customer' : 'admin',
      senderName: currentUser.name,
      text,
      timestamp: new Date().toISOString(),
      language: lang
    };

    setChatMessages(prev => [...prev, userMsg]);
    soundEffects.playBeep();

    // If customer sends a message, auto reply after 1 second if admin isn't typing
    if (currentUser.role === 'customer') {
      setTimeout(() => {
        let replyText = '';
        const lower = text.toLowerCase();

        if (lang === 'en') {
          if (lower.includes('beras') || lower.includes('rice') || lower.includes('stock')) {
            replyText = 'Hello! Our Pandan Wangi 5kg rice is in stock at Rp 72,500. Free home delivery is available for community residents (RT 01 - RT 05)!';
          } else if (lower.includes('delivery') || lower.includes('shipping') || lower.includes('ongkir')) {
            replyText = 'Local delivery within 2km is completely FREE! For cash on delivery, choose "COD" during checkout.';
          } else {
            replyText = 'Thank you for reaching out to Warung Berkah! Haji Sulaiman and our team will prepare your sembako order shortly.';
          }
        } else if (lang === 'jw') {
          if (lower.includes('beras') || lower.includes('stok') || lower.includes('regane')) {
            replyText = 'Sugeng rawuh! Beras Pandan Wangi tasih wonten stok 18 karung, regine Rp 72.500. Diaturi pesen, mangke dianteraken dugi emperan griya nggih.';
          } else if (lower.includes('ongkir') || lower.includes('bayar')) {
            replyText = 'Kangge warga RT 01-05 mboten wonten ongkir (gratis ongkir). Saged bayar COD pas sembako dugi.';
          } else {
            replyText = 'Matur nuwun sampun blanja wonten Warung Berkah. Menawi wonten pesenan sembako langsung dikemasaken nggih!';
          }
        } else {
          // Indonesian
          if (lower.includes('beras') || lower.includes('stok') || lower.includes('harga')) {
            replyText = 'Halo Bu/Pak! Stok beras Pandan Wangi 5kg dan Minyak Goreng Bimoli 2L siap kirim. Kami juga ada promo telur ayam segar hari ini!';
          } else if (lower.includes('ongkir') || lower.includes('antar') || lower.includes('cod')) {
            replyText = 'Pengantaran ke rumah warga RT 01 sampai RT 05 gratis tanpa minimal belanja. Pembayaran bisa via QRIS atau bayar di tempat (COD).';
          } else {
            replyText = 'Terima kasih telah menghubungi Warung Sembako Berkah. Admin dan kasir kami siap membantu pesanan Anda!';
          }
        }

        const botReply: ChatMessage = {
          id: 'chat-rep-' + Date.now(),
          sender: 'admin',
          senderName: 'Haji Sulaiman (Admin Warung)',
          text: replyText,
          timestamp: new Date().toISOString(),
          language: lang,
        };
        setChatMessages(prev => [...prev, botReply]);
        soundEffects.playOrderChime();
      }, 1200);
    }
  };

  // Dashboard configuration
  const updateDashboardWidgets = (widgets: Partial<DashboardWidgetConfig>) => {
    setDashboardWidgets(prev => ({ ...prev, ...widgets }));
  };

  // Warehouse stock sync simulation
  const simulateWarehouseSync = () => {
    setProducts(prev => prev.map(p => {
      // Simulate inventory automated addition from warehouse
      const added = Math.floor(Math.random() * 8) + 5;
      return { ...p, stock: p.stock + added };
    }));
    addNotification(
      '🔄 Sinkronisasi API Gudang Sukses',
      'Stok barang sembako otomatis diperbarui dari Sistem Gudang Pusat (REST API /v1/sync/stock).',
      'sync'
    );
  };

  // E-commerce platform webhook simulation
  const simulateIncomingEcommerceOrder = () => {
    const randomProduct = products[Math.floor(Math.random() * products.length)] || products[0];
    const qty = Math.floor(Math.random() * 2) + 1;
    
    createOrder({
      type: 'online',
      customerName: 'Siti Rahma (Tokopedia/Shopee API)',
      customerPhone: '0812-9900-1122',
      customerAddress: 'Komp. Melati Indah Blok C3',
      paymentMethod: 'transfer',
      paymentStatus: 'paid',
      status: 'pending',
      notes: 'Pesanan masuk otomatis via Integrasi Webhook E-Commerce Warung.',
      items: [
        {
          productId: randomProduct.id,
          productName: randomProduct.name,
          quantity: qty,
          price: randomProduct.sellingPrice,
          costPrice: randomProduct.costPrice,
          unit: randomProduct.unit,
          subtotal: randomProduct.sellingPrice * qty
        }
      ]
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users: INITIAL_USERS,
        switchUser,
        products,
        orders,
        notifications,
        chatMessages,
        isOffline,
        toggleOfflineMode,
        offlineQueueCount: offlineQueue.length,
        syncOfflineData,
        darkMode,
        toggleDarkMode,
        activeTab,
        setActiveTab,
        cart,
        addToCart,
        updateCartItemQty,
        removeFromCart,
        clearCart,
        createOrder,
        updateOrderStatus,
        updateStock,
        addProduct,
        editProduct,
        deleteProduct,
        bluetoothInfo,
        connectBluetooth,
        disconnectBluetooth,
        setPaperWidth,
        printReceipt,
        markNotificationAsRead,
        clearAllNotifications,
        unreadNotifsCount,
        sendChatMessage,
        chatLanguage,
        setChatLanguage,
        dashboardWidgets,
        updateDashboardWidgets,
        simulateWarehouseSync,
        simulateIncomingEcommerceOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
